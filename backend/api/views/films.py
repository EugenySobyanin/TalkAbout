from rest_framework import filters, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
import random
from django.conf import settings
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend

from gallery.models import Film
from api.filters import FilmFilter
from api.serializers.films import FilmDetailSerializer, SearchListFilmSerilizer
from talk_about.constants import MIN_RATING, EXCLUDED_GENRES





class FilmViewSet(viewsets.ModelViewSet):
    """Вьюсет для фильмов."""

    queryset = Film.objects.all().select_related('type').prefetch_related(
        'genres', 'countries', 'persons'
    )
    serializer_class = FilmDetailSerializer
    permission_classes = []
    filter_backends = [
        DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter
    ]
    filterset_class = FilmFilter

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
        if self.action in ['list', 'random_top_films', 'discover']:
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
        url_path='random-top',
        url_name='random-top',
        permission_classes=[permissions.AllowAny]
    )
    def random_top_films(self, request):
        """
        Возвращает случайные фильмы с рейтингом выше min_rating,
        исключая короткометражки, концерты и документальные.
        """
        count = int(request.query_params.get('count', 250))
        # min_rating = float(request.query_params.get('min_rating', MIN_RATING))
        count = min(count, 500)

        queryset = self.get_random_films_base_queryset(min_rating=MIN_RATING)
        total_count = queryset.count()

        if total_count == 0:
            return Response({
                'count': 0,
                'message': 'Нет фильмов с рейтингом >= {0}'.format(min_rating),
                'results': []
            })

        if count >= total_count:
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
            'total_available': total_count,
            'min_rating_filter': min_rating,
            'excluded_genres': EXCLUDED_GENRES,
            'results': serializer.data
        })

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