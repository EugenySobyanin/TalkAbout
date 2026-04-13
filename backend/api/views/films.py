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


class FilmViewSet(viewsets.ModelViewSet):
    """Вьюсет для фильмов."""

    queryset = Film.objects.all().select_related('type').prefetch_related(
        'genres', 'countries', 'networks', 'persons'
    )
    serializer_class = FilmDetailSerializer
    permission_classes = []  # Настройте по необходимости
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
        if self.action == 'list':
            return SearchListFilmSerilizer
        return super().get_serializer_class()

    @action(
        detail=False,
        methods=['get'],
        url_path='random-top',
        url_name='random-top',
        permission_classes=[permissions.AllowAny]
    )
    def random_top_films(self, request):
        """
        Возвращает 250 случайных фильмов с рейтингом Кинопоиска > 7.

        Query параметры:
        - count: количество фильмов (по умолчанию 250, максимум 500)
        - min_rating: минимальный рейтинг (по умолчанию 7.0)
        """
        # Получаем параметры из запроса
        count = int(request.query_params.get('count', 250))
        min_rating = float(request.query_params.get('min_rating', 7.0))

        # Ограничиваем максимальное количество
        count = min(count, 500)

        # Базовый queryset
        queryset = Film.objects.filter(
            kinopoisk_rating__gte=min_rating
        ).exclude(
            poster__isnull=True
        ).exclude(
            poster_url=''
        ).select_related('type').prefetch_related(
            'genres', 'persons',
        )

        # Получаем общее количество подходящих фильмов
        total_count = queryset.count()

        if total_count == 0:
            return Response({
                'count': 0,
                'message': f'Нет фильмов с рейтингом >= {min_rating}',
                'results': []
            })

        # Если запрошено больше, чем есть - вернём все
        if count >= total_count:
            films = list(queryset)
            random.shuffle(films)
        else:
            # Эффективный способ получить случайные записи
            # Вариант 1: Для PostgreSQL (самый быстрый)
            if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
                films = queryset.order_by('?')[:count]
            else:
                # Вариант 2: Для SQLite/MySQL (более медленный, но надёжный)
                pks = list(queryset.values_list('id', flat=True))
                random_pks = random.sample(pks, count)
                films = queryset.filter(id__in=random_pks)

        # Сериализуем результат
        serializer = self.get_serializer(films, many=True)

        return Response({
            'count': len(films),
            'total_available': total_count,
            'min_rating_filter': min_rating,
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
        Умная рекомендация: случайные фильмы с высоким рейтингом и постерами.
        
        Можно комбинировать с фильтрами:
        - genres: ID жанров через запятую
        - year_min, year_max
        - exclude_watched: исключить просмотренные (если пользователь авторизован)
        """
        queryset = Film.objects.filter(
            kinopoisk_rating__gte=7.0
        ).exclude(
            Q(poster__isnull=True) | Q(poster='')
        )
        
        # Применяем фильтры из запроса
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
        
        # Оптимизация запроса
        queryset = queryset.select_related('type').prefetch_related(
            'genres', 'persons'
        )
        
        total = queryset.count()
        
        # Берём случайные
        count = min(int(request.query_params.get('count', 50)), 200)
        
        if total == 0:
            films = []
        elif total <= count:
            films = list(queryset)
            random.shuffle(films)
        else:
            # Для PostgreSQL используем order_by('?')
            films = queryset.order_by('?')[:count]
        
        serializer = self.get_serializer(films, many=True)
        
        return Response({
            'count': len(films),
            'total_matching': total,
            'results': serializer.data
        })
