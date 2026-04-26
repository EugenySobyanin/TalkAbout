from rest_framework import filters, generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
import random
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Case, When, IntegerField, Value, Q
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from gallery.models import (Film, Genre, Country, Type, UserTopFilm)
from api.filters import FilmFilter
from api.serializers.films import (FilmDetailSerializer,
                                   SearchListFilmSerilizer,
                                   GenreSerializer,
                                   CountrySerializer,
                                   TypeSerializer,
                                   UserTopFilmSerializer,
                                   TopFilmSerializer)
from api.pagination import FilmSearchPagination
from talk_about.constants import (MIN_RATING,
                                  EXCLUDED_GENRES,
                                  MIN_SEARCH_VOTES,
                                  SEARCH_SUGGESTIONS_LIMIT)


User = get_user_model()


class FilmViewSet(viewsets.ModelViewSet):
    """Вьюсет для фильмов."""

    queryset = Film.objects.all().select_related('type').prefetch_related(
        'genres', 'countries', 'persons'
    ).distinct()
    serializer_class = FilmDetailSerializer
    permission_classes = []
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_class = FilmFilter
    pagination_class = FilmSearchPagination

    search_fields = [
        'name',
        'alternative_name',
        'en_name'
    ]
    ordering_fields = [
        'year',
        'kinopoisk_rating',
        'imdb_rating',
        'movie_length'
    ]
    ordering = ['-kinopoisk_rating', '-year']

    def get_serializer_class(self):
        if self.action in ['list',
                           'random_top_films',
                           'discover',
                           'search_suggestions',
                           'search']:
            return SearchListFilmSerilizer
        return super().get_serializer_class()

    def get_random_films_base_queryset(self, min_rating=MIN_RATING):
        """
        Базовый queryset для случайных подборок:
        - рейтинг >= min_rating
        - есть постер
        - есть хотя бы один жанр
        - исключены нежелательные жанры
        """
        queryset = (
            Film.objects.filter(
                kinopoisk_rating__gte=min_rating,
                genres__isnull=False,  # 👈 есть хотя бы один жанр
            )
            .exclude(
                Q(poster_url__isnull=True) | Q(poster_url='')
            )
            .exclude(
                genres__name__in=EXCLUDED_GENRES
            )
            .select_related('type')
            .prefetch_related('genres', 'persons')
            .distinct()
        )

        return queryset

    @action(
        detail=False,
        methods=['get'],
        url_path='discover',
        url_name='discover'
    )
    def discover(self, request):
        """
        Умная рекомендация: случайные фильмы с высоким рейтингом и постерами,
        без короткометражек, концертов и документальных.
        """
        # min_rating = float(request.query_params.get('min_rating', MIN_RATING))
        queryset = self.get_random_films_base_queryset(min_rating=MIN_RATING)

        genres = request.query_params.get('genres')
        if genres:
            genre_ids = [int(g) for g in genres.split(',') if g.isdigit()]
            queryset = queryset.filter(genres__id__in=genre_ids).distinct()

        year_min = request.query_params.get('year_min')
        if year_min and year_min.isdigit():
            queryset = queryset.filter(year__gte=int(year_min))

        year_max = request.query_params.get('year_max')
        if year_max and year_max.isdigit():
            queryset = queryset.filter(year__lte=int(year_max))

        total = queryset.count()
        count = min(int(request.query_params.get('count', 50)), 200)

        if total == 0:
            films = []
        elif total <= count:
            films = list(queryset)
            random.shuffle(films)
        else:
            if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
                films = queryset.order_by('?')[:count]
            else:
                pks = list(queryset.values_list('id', flat=True))
                random_pks = random.sample(pks, count)
                films = list(queryset.filter(id__in=random_pks))

        serializer = self.get_serializer(films, many=True)

        return Response({
            'count': len(films),
            'total_matching': total,
            'excluded_genres': EXCLUDED_GENRES,
            'results': serializer.data
        })

    @action(
        detail=False,
        methods=['get'],
        url_path='search-suggestions',
        url_name='search-suggestions',
        permission_classes=[permissions.AllowAny],
    )
    def search_suggestions(self, request):
        query = request.query_params.get('q', '').strip()

        # Не обрабатываем запрос с 1 буквой
        if len(query) < 2:
            return Response({
                'total': 0,
                'results': []
            })

        queryset = Film.objects.filter(
            Q(name__icontains=query) |
            Q(alternative_name__icontains=query) |
            Q(en_name__icontains=query),
        ).exclude(
            Q(name__isnull=True) &
            Q(alternative_name__isnull=True) &
            Q(en_name__isnull=True)
        ).select_related(
            'type'
        ).prefetch_related(
            'genres'
        ).annotate(
            # 🔥 приоритет популярным фильмам
            popularity_priority=Case(
                When(kinopoisk_votes__gte=MIN_SEARCH_VOTES, then=Value(1)),
                default=Value(0),
                output_field=IntegerField(),
            )
        ).order_by(
            '-popularity_priority',   # сначала популярные
            '-kinopoisk_rating',      # потом рейтинг
            '-kinopoisk_votes',       # потом голоса
            '-year'
        ).distinct()

        total = queryset.count()
        films = queryset[:SEARCH_SUGGESTIONS_LIMIT]

        serializer = SearchListFilmSerilizer(films, many=True)

        return Response({
            'total': total,
            'results': serializer.data
        })

    @action(
        detail=False,
        methods=['get'],
        url_path='search',
        url_name='search',
        permission_classes=[permissions.AllowAny],
    )
    def search(self, request):
        query = request.query_params.get('q', '').strip()

        if len(query) < 2:
            return Response({
                'count': 0,
                'next': None,
                'previous': None,
                'results': []
            })

        queryset = Film.objects.filter(
            Q(name__icontains=query) |
            Q(alternative_name__icontains=query) |
            Q(en_name__icontains=query)
        ).select_related(
            'type'
        ).prefetch_related(
            'genres'
        ).order_by(
            '-kinopoisk_rating',
            '-kinopoisk_votes',
            '-year'
        ).distinct()

        paginator = FilmSearchPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = SearchListFilmSerilizer(page, many=True)

        return paginator.get_paginated_response(serializer.data)


class TypeList(generics.ListCreateAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer
    permission_classes = [permissions.AllowAny]


class GenreList(generics.ListCreateAPIView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.AllowAny]


class CountryList(generics.ListCreateAPIView):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]


class MyTopFilmsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        top_films = UserTopFilm.objects.filter(
            user=request.user
        ).select_related('film')

        serializer = UserTopFilmSerializer(top_films, many=True)
        return Response(serializer.data)

    def put(self, request):
        film_ids = request.data.get('film_ids', [])

        if len(film_ids) > 10:
            return Response(
                {'detail': 'В топе может быть максимум 10 фильмов.'},
                status=400
            )

        if len(film_ids) != len(set(film_ids)):
            return Response(
                {'detail': 'Фильм нельзя добавить в топ дважды.'},
                status=400
            )

        films = Film.objects.filter(id__in=film_ids)

        if films.count() != len(film_ids):
            return Response(
                {'detail': 'Один или несколько фильмов не найдены.'},
                status=400
            )

        films_by_id = {film.pk: film for film in films}

        UserTopFilm.objects.filter(user=request.user).delete()

        UserTopFilm.objects.bulk_create([
            UserTopFilm(
                user=request.user,
                film=films_by_id[film_id],
                position=index + 1
            )
            for index, film_id in enumerate(film_ids)
        ])

        top_films = UserTopFilm.objects.filter(
            user=request.user
        ).select_related('film')

        serializer = UserTopFilmSerializer(top_films, many=True)
        return Response(serializer.data)


class UserTopFilmsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        top_films = UserTopFilm.objects.filter(
            user=user
        ).select_related('film')

        serializer = UserTopFilmSerializer(top_films, many=True)
        return Response(serializer.data)