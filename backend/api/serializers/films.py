from django.db.models import Avg
from rest_framework import serializers

from gallery.models import (Film,
                            Genre,
                            Country,
                            Video,
                            Fact,
                            Person,
                            Profession,
                            FilmPerson,
                            FilmGenre,
                            FilmPersonProfession,
                            SequelsAndPrequels,
                            SimilarFilms,
                            Type)
from activities.models import UserFilmActivity


class GenreSerializer(serializers.ModelSerializer):
    """Сериализатор для жанров."""

    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug']


class CountrySerializer(serializers.ModelSerializer):
    """Сериализатор для стран."""

    class Meta:
        model = Country
        fields = ['id', 'name', 'slug']


class TypeSerializer(serializers.ModelSerializer):
    """Сериализатор для типа фильма."""

    class Meta:
        model = Type
        fields = ['id', 'name', 'slug']


class VideoSerializer(serializers.ModelSerializer):
    """Сериализатор для видео (трейлеры и т.д.)."""

    class Meta:
        model = Video
        fields = ['id', 'url', 'name', 'site', 'type']


class FactSerializer(serializers.ModelSerializer):
    """Сериализатор для фактов о фильме."""

    class Meta:
        model = Fact
        fields = ['id', 'text', 'type', 'spoiler']


class ProfessionSerializer(serializers.ModelSerializer):
    """Сериализатор для профессий."""

    class Meta:
        model = Profession
        fields = ['id', 'profession', 'en_profession']


class PersonSerializer(serializers.ModelSerializer):
    """Сериализатор для персоны."""

    age = serializers.IntegerField(read_only=True)

    class Meta:
        model = Person
        fields = [
            'id', 'kinopoisk_id', 'name', 'en_name',
            'photo_url', 'growth', 'birthday', 'death', 'age'
        ]


class FilmPersonSerializer(serializers.ModelSerializer):
    """Сериализатор для связи фильм-персона."""

    person = PersonSerializer(read_only=True)
    professions = serializers.SerializerMethodField()

    class Meta:
        model = FilmPerson
        fields = ['id', 'person', 'description', 'professions']

    def get_professions(self, obj):
        """Получаем все профессии персоны в этом фильме."""
        # Используем правильное имя related_name из модели FilmPersonProfession
        professions = obj.professions.select_related('profession').all()
        return [p.profession.profession for p in professions]


class SimilarFilmSerializer(serializers.ModelSerializer):
    """Сериализатор для похожих фильмов (упрощенный)."""

    class Meta:
        model = Film
        fields = [
            'id', 'name', 'alternative_name', 'year',
            'poster_url', 'kinopoisk_rating', 'imdb_rating', 'movie_length'
        ]


class SequelsAndPrequelsSerializer(serializers.ModelSerializer):
    """Сериализатор для сиквелов и приквелов."""

    related_film = SimilarFilmSerializer(read_only=True)

    class Meta:
        model = SequelsAndPrequels
        fields = ['id', 'related_film']


class SimilarFilmsRelationSerializer(serializers.ModelSerializer):
    """Сериализатор для связи похожих фильмов."""

    similar_film = SimilarFilmSerializer(read_only=True)

    class Meta:
        model = SimilarFilms
        fields = ['id', 'similar_film']


class ActivityInFilmDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для активити внутри информации о фильме,
    если запрос делает залогиненный пользователь."""

    current_user_rating = serializers.IntegerField(source='rating')

    class Meta:
        model = UserFilmActivity
        fields = [
            'id',
            'is_planned',
            'is_watched',
            'current_user_rating',
        ]


class FilmDetailSerializer(serializers.ModelSerializer):
    """
    Детальный сериализатор для страницы фильма.
    Включает всю связанную информацию.
    """

    # Связанные модели
    type = TypeSerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    countries = CountrySerializer(many=True, read_only=True)

    # Видео и факты
    videos = VideoSerializer(many=True, read_only=True)
    facts = FactSerializer(many=True, read_only=True)

    # Персоны (сгруппированные по профессиям)
    persons_by_profession = serializers.SerializerMethodField()

    # Сиквелы/приквелы и похожие фильмы
    sequels_and_prequels = serializers.SerializerMethodField()
    similar_films = serializers.SerializerMethodField()

    # Рейтинги
    user_rating = serializers.SerializerMethodField()
    rating_votes_count = serializers.SerializerMethodField()

    # Дополнительная информация
    formatted_budget = serializers.SerializerMethodField()
    formatted_duration = serializers.SerializerMethodField()

    # Активити (если пользователь не анонимный)
    activity = serializers.SerializerMethodField()

    class Meta:
        model = Film
        fields = [
            # Основные поля
            'id',
            'kinopoisk_api_id',
            'name',
            'alternative_name',
            'en_name',
            'description',
            'short_description',
            'slogan',
            'year',
            'movie_length',

            # Рейтинги
            'kinopoisk_rating',
            'imdb_rating',
            'user_rating',
            'rating_votes_count',
            'rating_mpaa',
            'age_rating',

            # Бюджет
            'budget_value',
            'budget_currency',
            'formatted_budget',

            # Медиа
            'poster_url',
            'logo_url',
            'backdrop_url',

            # Связанные модели
            'type',
            'genres',
            'countries',
            # 'networks',

            # Видео и факты
            'videos',
            'facts',

            # Персоны
            'persons_by_profession',

            # Связи с другими фильмами
            'sequels_and_prequels',
            'similar_films',

            # Служебные поля
            'formatted_duration',
            'created_at',
            'updated_at',

            # Активити (если пользоователь не анонимный)
            'activity',
        ]

    def get_persons_by_profession(self, obj):
        """
        Группируем всех персон по профессиям.
        Возвращает словарь: { 'профессия': [список персон] }
        related_name='film_persons' из модели FilmPerson
        """
        film_persons = obj.film_persons.select_related('person').prefetch_related(
            'professions__profession'
        ).all()

        persons_by_profession = {}

        for film_person in film_persons:
            # Получаем данные персоны
            person_data = PersonSerializer(film_person.person).data
            person_data['role_description'] = film_person.description

            # Добавляем персону в каждую её профессию в этом фильме
            for prof_relation in film_person.professions.all():
                prof_name = prof_relation.profession.profession

                if prof_name not in persons_by_profession:
                    persons_by_profession[prof_name] = []

                # Проверяем, не добавлена ли уже эта персона в эту профессию
                if not any(p['id'] == person_data['id'] for p in persons_by_profession[prof_name]):
                    persons_by_profession[prof_name].append(person_data)

        return persons_by_profession

    def get_sequels_and_prequels(self, obj):
        """
        Получаем сиквелы и приквелы.
        related_name='sequels_and_prequels' из модели SequelsAndPrequels
        """
        sequels = obj.sequels_and_prequels.select_related('related_film').all()
        return SequelsAndPrequelsSerializer(sequels, many=True).data

    def get_similar_films(self, obj):
        """
        Получаем похожие фильмы.
        related_name='similar_films' из модели SimilarFilms
        """
        similar = obj.similar_films.select_related('similar_film').all()[:12]
        return SimilarFilmsRelationSerializer(similar, many=True).data

    def get_user_rating(self, obj):
        """
        Получаем средний рейтинг пользователей.
        related_name='film_activities' из модели UserFilmActivity
        """
        if hasattr(obj, 'avg_rating'):
            return round(obj.avg_rating, 1) if obj.avg_rating else None

        # Вычисляем средний рейтинг
        result = UserFilmActivity.objects.filter(
            film=obj,
            rating__isnull=False
        ).aggregate(avg=Avg('rating'))['avg']

        return round(result, 1) if result else None

    def get_rating_votes_count(self, obj):
        """Количество оценок пользователей."""
        if hasattr(obj, 'rating_count'):
            return obj.rating_count

        return UserFilmActivity.objects.filter(
            film=obj,
            rating__isnull=False
        ).count()

    def get_formatted_budget(self, obj):
        """Форматированный бюджет."""
        if obj.budget_value:
            formatted = f"${obj.budget_value:,}"
            if obj.budget_currency:
                formatted += f" {obj.budget_currency}"
            return formatted
        return None

    def get_formatted_duration(self, obj):
        """Форматированная длительность в часах и минутах."""
        if obj.movie_length:
            hours = obj.movie_length // 60
            minutes = obj.movie_length % 60

            if hours > 0:
                return f"{hours} ч {minutes} мин"
            return f"{minutes} мин"
        return None

    def get_activity(self, obj):
        """Получаем активити текущего пользователя."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            activity = UserFilmActivity.objects.filter(
                user=request.user,
                film=obj
            ).first()
            if activity:
                return ActivityInFilmDetailSerializer(activity).data
        return None


class SearchListFilmSerilizer(serializers.ModelSerializer):
    """
    Сериализатор для списка фильмов.
    """

    rating = serializers.SerializerMethodField()
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Film
        fields = [
            'id',
            'name',
            'alternative_name',
            'en_name',
            'year',
            'movie_length',
            'poster_url',
            'kinopoisk_rating',
            'imdb_rating',
            'short_description',
            'rating',  # рейтинг на нашем портале
            'genres',
        ]

    def get_rating(self, obj):
        """Вычисляет средний рейтинг фильма из активностей пользователей."""
        if hasattr(obj, 'avg_rating'):
            return round(obj.avg_rating, 1) if obj.avg_rating else None

        result = UserFilmActivity.objects.filter(
            film=obj,
            rating__isnull=False
        ).aggregate(avg=Avg('rating'))['avg']

        return round(result, 1) if result else None
