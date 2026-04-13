from rest_framework import serializers
from compilations.models import Compilation, CompilationsFilms
from gallery.models import Film
from django.conf import settings


class FilmSerializer(serializers.ModelSerializer):
    """Сериализатор для фильмов внутри подборок."""
    
    poster = serializers.SerializerMethodField()

    class Meta:
        model = Film
        fields = [
            'id',
            'name',
            'year',
            'poster',
            'kinopoisk_rating',
            'imdb_rating',
        ]
    
    def get_poster(self, obj):
        """Возвращает полный URL до постера."""
        if obj.poster:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.poster.url)
            else:
                base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
                return f"{base_url}{obj.poster.url}"
        return None


class CompilationSerializer(serializers.ModelSerializer):
    """Сериализатор для подборок (компиляций)."""

    films = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Film.objects.all(),
        required=False
    )

    class Meta:
        model = Compilation
        fields = [
            'id',
            'user',
            'title',
            'description',
            'is_public',
            'films'
        ]
        read_only_fields = ['user']

    def create(self, validated_data):
        films_data = validated_data.pop('films', [])
        compilation = Compilation.objects.create(**validated_data)

        # Создаем связи через промежуточную модель
        if films_data:
            CompilationsFilms.objects.bulk_create([
                CompilationsFilms(collection=compilation, film=film)
                for film in films_data
            ])

        return compilation

    def update(self, instance, validated_data):
        films_data = validated_data.pop('films', None)

        # Обновляем основные поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Обновляем связи с фильмами, если они были переданы
        if films_data is not None:
            # Удаляем старые связи
            CompilationsFilms.objects.filter(collection=instance).delete()
            # Создаем новые
            if films_data:
                CompilationsFilms.objects.bulk_create([
                    CompilationsFilms(collection=instance, film=film)
                    for film in films_data
                ])

        return instance


class CompilationReadSerializer(serializers.ModelSerializer):
    """Сериализатор для чтения подборок с детальной информацией о фильмах."""
    
    films = serializers.SerializerMethodField()
    films_count = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%d.%m.%Y", read_only=True)
    updated_at = serializers.DateTimeField(format="%d.%m.%Y", read_only=True)

    class Meta:
        model = Compilation
        fields = [
            'id',
            'user',
            'title',
            'description',
            'is_public',
            'films',
            'films_count',
            'created_at',
            'updated_at'
        ]

    def get_films(self, obj):
        # Получаем фильмы через промежуточную модель
        films = Film.objects.filter(
            compilationsfilms__collection=obj
        ).distinct()
        return FilmSerializer(
            films, 
            many=True, 
            context={'request': self.context.get('request')}
        ).data
    
    def get_films_count(self, obj):
        return obj.films.count()