import time
from dataclasses import dataclass
from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple

import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from gallery.models import (
    Country,
    Fact,
    Fees,
    Film,
    FilmCountry,
    FilmGenre,
    FilmPerson,
    FilmPersonProfession,
    Genre,
    ImportState,
    Person,
    Profession,
    SequelsAndPrequels,
    SimilarFilms,
    Type,
    Video,
)


API_BASE = "https://api.kinopoisk.dev"
TOKEN_INFO_URL = f"{API_BASE}/v1.5/token"
MOVIES_URL = f"{API_BASE}/v1.5/movie"

SOURCE_PREFIX = "kinopoisk_movies_quality"
MAX_VOTES_FILTER_VALUE = 99999999


@dataclass
class TokenInfo:
    requests_used: Optional[int] = None
    requests_remaining: Optional[int] = None
    daily_limit: Optional[int] = None
    resets_at: Optional[str] = None


class KinopoiskAPIError(Exception):
    """Ошибка при работе с Kinopoisk API."""


def format_number(value: float) -> str:
    """Форматирует число для query-параметров Kinopoisk API."""
    if float(value).is_integer():
        return str(int(value))
    return str(value)


def make_range_filter(
    min_value: Optional[float],
    max_value: Optional[float],
) -> Optional[str]:
    """
    Делает строку диапазона для API:
    7-10, 500000-99999999, 1990-2026.
    """
    if min_value is None and max_value is None:
        return None

    if min_value is None:
        return f"0-{format_number(max_value)}"

    if max_value is None:
        return f"{format_number(min_value)}-{MAX_VOTES_FILTER_VALUE}"

    return f"{format_number(min_value)}-{format_number(max_value)}"


def make_import_source_name(
    min_rating: float,
    min_votes: int,
    year_min: Optional[int],
    year_max: Optional[int],
    require_backdrop: bool,
) -> str:
    """
    Делаем отдельный ImportState под конкретный набор фильтров,
    чтобы курсор старого импорта не ломал новый импорт.
    """
    rating_part = str(min_rating).replace(".", "_")
    year_part = f"{year_min or 'any'}_{year_max or 'any'}"
    backdrop_part = "with_backdrop" if require_backdrop else "no_backdrop"

    source = (
        f"{SOURCE_PREFIX}_r{rating_part}_v{min_votes}_"
        f"y{year_part}_{backdrop_part}"
    )

    return source[:100]


def to_float(value: Any) -> Optional[float]:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def to_int(value: Any) -> Optional[int]:
    try:
        if value is None:
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


class KinopoiskClient:
    def __init__(self, api_key: str, timeout: int = 30):
        self.session = requests.Session()
        self.session.headers.update({"X-API-KEY": api_key})
        self.timeout = timeout

    def _get(
        self,
        url: str,
        params: Optional[List[Tuple[str, str]]] = None,
    ) -> Dict[str, Any]:
        response = self.session.get(url, params=params, timeout=self.timeout)

        if response.status_code == 401:
            raise KinopoiskAPIError("Неверный API ключ или он не передан.")

        if response.status_code == 403:
            raise KinopoiskAPIError("Превышен суточный лимит запросов.")

        if response.status_code == 400:
            raise KinopoiskAPIError(
                "Невалидный запрос: {0}".format(response.text)
            )

        try:
            response.raise_for_status()
        except requests.HTTPError as exc:
            raise KinopoiskAPIError(
                "Ошибка API: {0}; body={1}".format(exc, response.text)
            )

        return response.json()

    def get_token_info(self) -> TokenInfo:
        data = self._get(TOKEN_INFO_URL)

        return TokenInfo(
            requests_used=data.get("used"),
            requests_remaining=data.get("requestsRemaining"),
            daily_limit=data.get("limit"),
            resets_at=data.get("resetsAt"),
        )

    def get_movies_page(
        self,
        limit: int = 250,
        next_cursor: Optional[str] = None,
        updated_since: Optional[str] = None,
        min_rating: float = 7.0,
        min_votes: int = 500000,
        year_min: Optional[int] = None,
        year_max: Optional[int] = None,
        require_backdrop: bool = True,
    ) -> Dict[str, Any]:
        rating_filter = make_range_filter(min_rating, 10)
        votes_filter = make_range_filter(min_votes, MAX_VOTES_FILTER_VALUE)
        year_filter = make_range_filter(year_min, year_max)

        params = [
            ("limit", str(limit)),

            # Основные поля
            ("selectFields", "id"),
            ("selectFields", "name"),
            ("selectFields", "enName"),
            ("selectFields", "alternativeName"),
            ("selectFields", "description"),
            ("selectFields", "shortDescription"),
            ("selectFields", "slogan"),
            ("selectFields", "type"),
            ("selectFields", "isSeries"),
            ("selectFields", "year"),

            # Рейтинги и голоса
            ("selectFields", "rating"),
            ("selectFields", "votes"),
            ("selectFields", "ratingMpaa"),
            ("selectFields", "ageRating"),

            # Детали
            ("selectFields", "budget"),
            ("selectFields", "movieLength"),

            # Связи и медиа
            ("selectFields", "genres"),
            ("selectFields", "countries"),
            ("selectFields", "poster"),
            ("selectFields", "backdrop"),
            ("selectFields", "logo"),
            ("selectFields", "videos"),
            ("selectFields", "persons"),
            ("selectFields", "facts"),
            ("selectFields", "fees"),
            ("selectFields", "similarMovies"),
            ("selectFields", "sequelsAndPrequels"),

            # Служебные
            ("selectFields", "updatedAt"),
            ("selectFields", "createdAt"),

            # Жёсткие фильтры качества
            ("type", "movie"),
            ("isSeries", "false"),
            ("rating.kp", rating_filter),
            ("votes.kp", votes_filter),

            # Нужные поля не должны быть пустыми
            ("notNullFields", "id"),
            ("notNullFields", "name"),
            ("notNullFields", "year"),
            ("notNullFields", "rating.kp"),
            ("notNullFields", "votes.kp"),
            ("notNullFields", "poster.url"),
            ("notNullFields", "genres.name"),

            # Сортировка: сначала новее, потом популярнее, потом выше рейтинг
            ("sortField", "year"),
            ("sortType", "-1"),
            ("sortField", "votes.kp"),
            ("sortType", "-1"),
            ("sortField", "rating.kp"),
            ("sortType", "-1"),
        ]

        if require_backdrop:
            params.append(("notNullFields", "backdrop.url"))

        if year_filter:
            params.append(("year", year_filter))

        if updated_since:
            params.append(("updatedAt", updated_since))

        if next_cursor:
            params.append(("next", next_cursor))

        return self._get(MOVIES_URL, params=params)


class Command(BaseCommand):
    help = (
        "Импорт качественных популярных фильмов из Kinopoisk API v1.5: "
        "по умолчанию КП >= 7.0, голосов КП >= 500000, только movie."
    )

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=250)
        parser.add_argument("--reserve", type=int, default=15)
        parser.add_argument("--max-pages", type=int, default=None)
        parser.add_argument("--sleep", type=float, default=0.2)

        parser.add_argument("--min-rating", type=float, default=7.0)
        parser.add_argument("--min-votes", type=int, default=500000)
        parser.add_argument("--year-min", type=int, default=None)
        parser.add_argument("--year-max", type=int, default=None)

        parser.add_argument(
            "--no-require-backdrop",
            action="store_true",
            help="Не требовать backdrop.url. По умолчанию обои требуются.",
        )
        parser.add_argument(
            "--allow-related-placeholders",
            action="store_true",
            help=(
                "Разрешить создавать Film-заглушки для похожих фильмов и "
                "сиквелов. По умолчанию отключено, чтобы не засорять БД."
            ),
        )

        parser.add_argument(
            "--updated-since",
            type=str,
            default=None,
            help='Явно задать updatedAt, например "01.04.2026-17.04.2026"',
        )
        parser.add_argument(
            "--start-cursor",
            type=str,
            default=None,
            help="Явно задать cursor и игнорировать сохранённый",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
        )
        parser.add_argument(
            "--reset-state",
            action="store_true",
            help="Сбросить сохранённый cursor перед запуском",
        )
        parser.add_argument(
            "--full-sync",
            action="store_true",
            help="Запустить полный проход: без updatedAt и с пустым cursor",
        )

    def handle(self, *args, **options):
        api_key = getattr(settings, "KINOPOISK_API_KEY", None)
        if not api_key:
            raise CommandError("В settings.py не найден KINOPOISK_API_KEY")

        limit = options["limit"]
        reserve = options["reserve"]
        max_pages = options["max_pages"]
        sleep_seconds = options["sleep"]
        dry_run = options["dry_run"]

        self.min_rating = options["min_rating"]
        self.min_votes = options["min_votes"]
        self.year_min = options["year_min"]
        self.year_max = options["year_max"]
        self.require_backdrop = not options["no_require_backdrop"]
        self.allow_related_placeholders = options["allow_related_placeholders"]

        manual_updated_since = options["updated_since"]
        manual_start_cursor = options["start_cursor"]
        reset_state = options["reset_state"]
        full_sync = options["full_sync"]

        if limit < 1 or limit > 250:
            raise CommandError("--limit должен быть от 1 до 250")

        if self.min_rating < 0 or self.min_rating > 10:
            raise CommandError("--min-rating должен быть от 0 до 10")

        if self.min_votes < 0:
            raise CommandError("--min-votes не может быть отрицательным")

        if (
            self.year_min is not None
            and self.year_max is not None
            and self.year_min > self.year_max
        ):
            raise CommandError("--year-min не может быть больше --year-max")

        source_name = make_import_source_name(
            min_rating=self.min_rating,
            min_votes=self.min_votes,
            year_min=self.year_min,
            year_max=self.year_max,
            require_backdrop=self.require_backdrop,
        )

        state = None
        if not dry_run:
            state, _ = ImportState.objects.get_or_create(source=source_name)

            if state.is_running:
                raise CommandError(
                    "Импорт уже помечен как запущенный. "
                    "Если это зависшее состояние, снимите is_running вручную."
                )

            if reset_state:
                state.next_cursor = None
                state.last_error = None
                state.pages_processed = 0
                state.movies_processed = 0
                state.movies_saved = 0
                state.save(update_fields=[
                    "next_cursor",
                    "last_error",
                    "pages_processed",
                    "movies_processed",
                    "movies_saved",
                    "updated_at",
                ])
                self.stdout.write(self.style.WARNING("Состояние импорта сброшено"))

        client = KinopoiskClient(api_key=api_key)

        token_info = client.get_token_info()
        remaining = token_info.requests_remaining or 0

        self.stdout.write(
            self.style.SUCCESS(
                "Лимит: осталось {0}, использовано {1}, дневной лимит {2}, сброс {3}".format(
                    remaining,
                    token_info.requests_used,
                    token_info.daily_limit,
                    token_info.resets_at,
                )
            )
        )

        if remaining <= reserve:
            self.stdout.write(
                self.style.WARNING(
                    "Остановлено: осталось {0} запросов, reserve={1}".format(
                        remaining, reserve
                    )
                )
            )
            return

        budget = remaining - reserve

        pages_processed = 0
        movies_seen = 0
        movies_saved = 0
        movies_skipped = 0

        next_cursor = None
        updated_since = None

        if full_sync:
            next_cursor = None
            updated_since = None
            self.stdout.write("Режим full-sync: полный проход без фильтра updatedAt")
        else:
            if manual_start_cursor:
                next_cursor = manual_start_cursor
            elif state:
                next_cursor = state.next_cursor

            if manual_updated_since:
                updated_since = manual_updated_since
            elif state and not next_cursor and state.last_completed_sync_at:
                start_dt = state.last_completed_sync_at - timedelta(hours=1)
                end_dt = timezone.now()
                updated_since = "{0}-{1}".format(
                    start_dt.strftime("%d.%m.%Y"),
                    end_dt.strftime("%d.%m.%Y"),
                )

        self.stdout.write(
            "Стартовые параметры: source={0}, cursor={1}, updated_since={2}".format(
                source_name,
                "есть" if next_cursor else "нет",
                updated_since or "не задан",
            )
        )
        self.stdout.write(
            "Фильтры: КП >= {0}, голосов КП >= {1}, year_min={2}, year_max={3}, require_backdrop={4}".format(
                self.min_rating,
                self.min_votes,
                self.year_min or "не задан",
                self.year_max or "не задан",
                self.require_backdrop,
            )
        )

        if state:
            state.is_running = True
            state.last_error = None
            state.save(update_fields=["is_running", "last_error", "updated_at"])

        completed_full_pass = False

        try:
            while budget > 0:
                if max_pages is not None and pages_processed >= max_pages:
                    self.stdout.write(self.style.WARNING("Достигнут --max-pages, остановка"))
                    break

                self.stdout.write(
                    "Запрос страницы {0}, budget={1}, cursor={2}".format(
                        pages_processed + 1,
                        budget,
                        "есть" if next_cursor else "нет",
                    )
                )

                data = client.get_movies_page(
                    limit=limit,
                    next_cursor=next_cursor,
                    updated_since=updated_since,
                    min_rating=self.min_rating,
                    min_votes=self.min_votes,
                    year_min=self.year_min,
                    year_max=self.year_max,
                    require_backdrop=self.require_backdrop,
                )

                budget -= 1
                pages_processed += 1

                docs = data.get("docs", [])
                has_next = data.get("hasNext", False)
                next_cursor = data.get("next")

                self.stdout.write("Получено фильмов: {0}".format(len(docs)))

                for payload in docs:
                    movies_seen += 1

                    if dry_run:
                        if self.passes_quality_filters(payload):
                            movies_saved += 1
                        else:
                            movies_skipped += 1
                        continue

                    saved = self.save_movie(payload)
                    if saved:
                        movies_saved += 1
                    else:
                        movies_skipped += 1

                if state:
                    state.next_cursor = next_cursor
                    state.pages_processed = pages_processed
                    state.movies_processed = movies_seen
                    state.movies_saved = movies_saved
                    state.last_successful_run_at = timezone.now()
                    state.save(update_fields=[
                        "next_cursor",
                        "pages_processed",
                        "movies_processed",
                        "movies_saved",
                        "last_successful_run_at",
                        "updated_at",
                    ])

                self.stdout.write(
                    self.style.SUCCESS(
                        "Страниц: {0}; просмотрено: {1}; сохранено/подходит: {2}; "
                        "пропущено: {3}; has_next={4}".format(
                            pages_processed,
                            movies_seen,
                            movies_saved,
                            movies_skipped,
                            has_next,
                        )
                    )
                )

                if not has_next or not next_cursor:
                    completed_full_pass = True
                    self.stdout.write(self.style.SUCCESS("Больше страниц нет"))
                    break

                time.sleep(sleep_seconds)

            if state:
                state.is_running = False
                state.last_successful_run_at = timezone.now()

                if completed_full_pass:
                    state.next_cursor = None
                    state.last_completed_sync_at = timezone.now()

                state.pages_processed = pages_processed
                state.movies_processed = movies_seen
                state.movies_saved = movies_saved
                state.save(update_fields=[
                    "is_running",
                    "last_successful_run_at",
                    "last_completed_sync_at",
                    "next_cursor",
                    "pages_processed",
                    "movies_processed",
                    "movies_saved",
                    "updated_at",
                ])

        except Exception as exc:
            if state:
                state.is_running = False
                state.last_error = str(exc)
                state.pages_processed = pages_processed
                state.movies_processed = movies_seen
                state.movies_saved = movies_saved
                state.save(update_fields=[
                    "is_running",
                    "last_error",
                    "pages_processed",
                    "movies_processed",
                    "movies_saved",
                    "updated_at",
                ])
            raise

        self.stdout.write(
            self.style.SUCCESS(
                "Готово. Страниц: {0}, просмотрено фильмов: {1}, "
                "сохранено/подходит: {2}, пропущено: {3}".format(
                    pages_processed,
                    movies_seen,
                    movies_saved,
                    movies_skipped,
                )
            )
        )

    def passes_quality_filters(self, payload: Dict[str, Any]) -> bool:
        movie_type = payload.get("type")
        is_series = payload.get("isSeries")

        if movie_type != "movie":
            return False

        if is_series is True:
            return False

        rating = payload.get("rating") or {}
        votes = payload.get("votes") or {}
        poster = payload.get("poster") or {}
        backdrop = payload.get("backdrop") or {}

        kp_rating = to_float(rating.get("kp"))
        kp_votes = to_int(votes.get("kp"))
        year = to_int(payload.get("year"))

        if kp_rating is None or kp_rating < self.min_rating:
            return False

        if kp_votes is None or kp_votes < self.min_votes:
            return False

        if year is None:
            return False

        if self.year_min is not None and year < self.year_min:
            return False

        if self.year_max is not None and year > self.year_max:
            return False

        if not poster.get("url"):
            return False

        if self.require_backdrop and not backdrop.get("url"):
            return False

        if not payload.get("name"):
            return False

        genres = payload.get("genres") or []
        if not genres:
            return False

        return True

    @transaction.atomic
    def save_movie(self, payload: Dict[str, Any]) -> bool:
        if not self.passes_quality_filters(payload):
            return False

        movie_type = payload.get("type")

        type_obj, _ = Type.objects.get_or_create(name=movie_type)

        rating = payload.get("rating") or {}
        votes = payload.get("votes") or {}
        budget = payload.get("budget") or {}
        poster = payload.get("poster") or {}
        backdrop = payload.get("backdrop") or {}
        logo = payload.get("logo") or {}

        film, _ = Film.objects.update_or_create(
            kinopoisk_api_id=payload["id"],
            defaults={
                "name": payload.get("name"),
                "en_name": payload.get("enName"),
                "alternative_name": payload.get("alternativeName"),
                "description": payload.get("description"),
                "short_description": payload.get("shortDescription"),
                "slogan": payload.get("slogan"),
                "year": payload.get("year"),
                "movie_length": payload.get("movieLength"),
                "kinopoisk_rating": rating.get("kp"),
                "kinopoisk_votes": votes.get("kp"),
                "imdb_rating": rating.get("imdb"),
                "imdb_votes": votes.get("imdb"),
                "rating_mpaa": payload.get("ratingMpaa"),
                "age_rating": payload.get("ageRating"),
                "budget_value": budget.get("value"),
                "budget_currency": budget.get("currency"),
                "poster_url": poster.get("url"),
                "poster_preview_url": poster.get("previewUrl"),
                "logo_url": logo.get("url"),
                "logo_preview_url": logo.get("previewUrl"),
                "backdrop_url": backdrop.get("url"),
                "backdrop_preview_url": backdrop.get("previewUrl"),
                "type": type_obj,
            }
        )

        self.sync_genres(film, payload.get("genres") or [])
        self.sync_countries(film, payload.get("countries") or [])
        self.sync_persons(film, payload.get("persons") or [])
        self.sync_videos(film, payload.get("videos") or {})
        self.sync_facts(film, payload.get("facts") or [])
        self.sync_fees(film, payload.get("fees") or {})
        self.sync_similar_movies(film, payload.get("similarMovies") or [])
        self.sync_sequels_and_prequels(film, payload.get("sequelsAndPrequels") or [])

        return True

    def sync_genres(self, film: Film, genres: List[Dict[str, Any]]) -> None:
        for item in genres:
            genre_name = item.get("name")
            if not genre_name:
                continue

            genre, _ = Genre.objects.get_or_create(name=genre_name)
            FilmGenre.objects.get_or_create(film=film, genre=genre)

    def sync_countries(self, film: Film, countries: List[Dict[str, Any]]) -> None:
        for item in countries:
            country_name = item.get("name")
            if not country_name:
                continue

            country, _ = Country.objects.get_or_create(name=country_name)
            FilmCountry.objects.get_or_create(film=film, country=country)

    def sync_persons(self, film: Film, persons: List[Dict[str, Any]]) -> None:
        for item in persons:
            kinopoisk_person_id = item.get("id")
            if not kinopoisk_person_id:
                continue

            person_defaults = {
                "name": item.get("name"),
                "en_name": item.get("enName"),
            }

            if hasattr(Person, "photo_url"):
                person_defaults["photo_url"] = item.get("photo")

            person, _ = Person.objects.update_or_create(
                kinopoisk_id=kinopoisk_person_id,
                defaults=person_defaults,
            )

            film_person, _ = FilmPerson.objects.get_or_create(
                film=film,
                person=person,
                defaults={"description": item.get("description")},
            )

            description = item.get("description")
            if film_person.description != description:
                film_person.description = description
                film_person.save(update_fields=["description"])

            profession_ru = item.get("profession")
            profession_en = item.get("enProfession")

            if profession_ru and profession_en:
                profession, _ = Profession.objects.get_or_create(
                    profession=profession_ru,
                    defaults={"en_profession": profession_en},
                )

                if profession.en_profession != profession_en:
                    profession.en_profession = profession_en
                    profession.save(update_fields=["en_profession"])

                FilmPersonProfession.objects.get_or_create(
                    film_person=film_person,
                    profession=profession,
                )

    def sync_videos(self, film: Film, videos_payload: Dict[str, Any]) -> None:
        trailers = []

        if isinstance(videos_payload, dict):
            trailers = videos_payload.get("trailers", []) or []

        for item in trailers:
            url = item.get("url")
            if not url:
                continue

            Video.objects.update_or_create(
                url=url,
                defaults={
                    "film": film,
                    "name": item.get("name"),
                    "site": item.get("site"),
                    "type": "trailer",
                }
            )

    def sync_facts(self, film: Film, facts: List[Dict[str, Any]]) -> None:
        for item in facts:
            text = item.get("value")
            fact_type = item.get("type")
            spoiler = bool(item.get("spoiler", False))

            if not text:
                continue

            exists = Fact.objects.filter(
                film=film,
                text=text,
                type=fact_type,
                spoiler=spoiler,
            ).exists()

            if not exists:
                Fact.objects.create(
                    film=film,
                    text=text,
                    type=fact_type,
                    spoiler=spoiler,
                )

    def sync_fees(self, film: Film, fees_payload: Dict[str, Any]) -> None:
        if not isinstance(fees_payload, dict):
            return

        mapping = {
            "world": "Мир",
            "usa": "США",
            "russia": "Россия",
        }

        for key, place in mapping.items():
            block = fees_payload.get(key) or {}
            value = block.get("value")
            currency = block.get("currency")

            if value is None:
                continue

            Fees.objects.update_or_create(
                film=film,
                place=place,
                defaults={
                    "value": value,
                    "currency": currency,
                }
            )

    def sync_similar_movies(self, film: Film, items: List[Dict[str, Any]]) -> None:
        for item in items:
            similar_id = item.get("id")
            if not similar_id:
                continue

            similar_film = Film.objects.filter(
                kinopoisk_api_id=similar_id
            ).first()

            if not similar_film and self.allow_related_placeholders:
                poster = item.get("poster") or {}
                rating = item.get("rating") or {}

                similar_film, _ = Film.objects.get_or_create(
                    kinopoisk_api_id=similar_id,
                    defaults={
                        "name": item.get("name"),
                        "en_name": item.get("enName"),
                        "alternative_name": item.get("alternativeName"),
                        "year": item.get("year"),
                        "poster_url": poster.get("url"),
                        "poster_preview_url": poster.get("previewUrl"),
                        "kinopoisk_rating": rating.get("kp"),
                        "imdb_rating": rating.get("imdb"),
                    }
                )

            if not similar_film:
                continue

            SimilarFilms.objects.get_or_create(
                film=film,
                similar_film=similar_film,
            )

    def sync_sequels_and_prequels(self, film: Film, items: List[Dict[str, Any]]) -> None:
        for item in items:
            related_id = item.get("id")
            if not related_id:
                continue

            related_film = Film.objects.filter(
                kinopoisk_api_id=related_id
            ).first()

            if not related_film and self.allow_related_placeholders:
                poster = item.get("poster") or {}
                rating = item.get("rating") or {}

                related_film, _ = Film.objects.get_or_create(
                    kinopoisk_api_id=related_id,
                    defaults={
                        "name": item.get("name"),
                        "en_name": item.get("enName"),
                        "alternative_name": item.get("alternativeName"),
                        "year": item.get("year"),
                        "poster_url": poster.get("url"),
                        "poster_preview_url": poster.get("previewUrl"),
                        "kinopoisk_rating": rating.get("kp"),
                        "imdb_rating": rating.get("imdb"),
                    }
                )

            if not related_film:
                continue

            SequelsAndPrequels.objects.get_or_create(
                film=film,
                related_film=related_film,
            )
