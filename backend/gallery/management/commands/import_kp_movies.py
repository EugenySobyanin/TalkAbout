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
IMPORT_SOURCE_NAME = "kinopoisk_movies"


@dataclass
class TokenInfo:
    requests_used: Optional[int] = None
    requests_remaining: Optional[int] = None
    daily_limit: Optional[int] = None
    resets_at: Optional[str] = None


class KinopoiskAPIError(Exception):
    """Ошибка при работе с Kinopoisk API."""


class KinopoiskClient:
    def __init__(self, api_key: str, timeout: int = 30):
        self.session = requests.Session()
        self.session.headers.update({"X-API-KEY": api_key})
        self.timeout = timeout

    def _get(
        self,
        url: str,
        params: Optional[List[Tuple[str, str]]] = None
    ) -> Dict[str, Any]:
        response = self.session.get(url, params=params, timeout=self.timeout)

        if response.status_code == 401:
            raise KinopoiskAPIError("Неверный API ключ или он не передан.")
        if response.status_code == 403:
            raise KinopoiskAPIError("Превышен суточный лимит запросов.")
        if response.status_code == 400:
            raise KinopoiskAPIError("Невалидный запрос: {0}".format(response.text))

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
        only_movies: bool = True,
    ) -> Dict[str, Any]:
        params = [
            ("limit", str(limit)),

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
            ("selectFields", "rating"),
            ("selectFields", "ratingMpaa"),
            ("selectFields", "ageRating"),
            ("selectFields", "votes"),
            ("selectFields", "budget"),
            ("selectFields", "movieLength"),
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
            ("selectFields", "updatedAt"),
            ("selectFields", "createdAt"),
        ]

        if only_movies:
            params.append(("type", "movie"))

        if updated_since:
            params.append(("updatedAt", updated_since))

        if next_cursor:
            params.append(("next", next_cursor))

        return self._get(MOVIES_URL, params=params)


class Command(BaseCommand):
    help = "Импорт фильмов из Kinopoisk API v1.5 с сохранением состояния"

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=250)
        parser.add_argument("--reserve", type=int, default=15)
        parser.add_argument("--max-pages", type=int, default=None)
        parser.add_argument("--sleep", type=float, default=0.2)

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
        manual_updated_since = options["updated_since"]
        manual_start_cursor = options["start_cursor"]
        reset_state = options["reset_state"]
        full_sync = options["full_sync"]

        if limit < 1 or limit > 250:
            raise CommandError("--limit должен быть от 1 до 250")

        state, _ = ImportState.objects.get_or_create(source=IMPORT_SOURCE_NAME)

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

        next_cursor = None
        updated_since = None

        if full_sync:
            next_cursor = None
            updated_since = None
            self.stdout.write("Режим full-sync: полный проход без фильтра updatedAt")
        else:
            if manual_start_cursor:
                next_cursor = manual_start_cursor
            else:
                next_cursor = state.next_cursor

            if manual_updated_since:
                updated_since = manual_updated_since
            elif not next_cursor and state.last_completed_sync_at:
                start_dt = state.last_completed_sync_at - timedelta(hours=1)
                end_dt = timezone.now()
                updated_since = "{0}-{1}".format(
                    start_dt.strftime("%d.%m.%Y"),
                    end_dt.strftime("%d.%m.%Y"),
                )

        self.stdout.write(
            "Стартовые параметры: cursor={0}, updated_since={1}".format(
                "есть" if next_cursor else "нет",
                updated_since or "не задан",
            )
        )

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
                    only_movies=True,
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
                        continue

                    saved = self.save_movie(payload)
                    if saved:
                        movies_saved += 1

                if not dry_run:
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
                        "Обработано страниц: {0}; фильмов просмотрено: {1}; "
                        "фильмов сохранено/обновлено: {2}; has_next={3}".format(
                            pages_processed,
                            movies_seen,
                            movies_saved,
                            has_next,
                        )
                    )
                )

                if not has_next or not next_cursor:
                    completed_full_pass = True
                    self.stdout.write(self.style.SUCCESS("Больше страниц нет"))
                    break

                time.sleep(sleep_seconds)

            if not dry_run:
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
            if not dry_run:
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
                "сохранено/обновлено: {2}".format(
                    pages_processed,
                    movies_seen,
                    movies_saved,
                )
            )
        )

    @transaction.atomic
    def save_movie(self, payload: Dict[str, Any]) -> bool:
        movie_type = payload.get("type")
        is_series = payload.get("isSeries")

        if movie_type != "movie":
            return False

        if is_series is True:
            return False

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

            SimilarFilms.objects.get_or_create(
                film=film,
                similar_film=similar_film,
            )

    def sync_sequels_and_prequels(self, film: Film, items: List[Dict[str, Any]]) -> None:
        for item in items:
            related_id = item.get("id")
            if not related_id:
                continue

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

            SequelsAndPrequels.objects.get_or_create(
                film=film,
                related_film=related_film,
            )