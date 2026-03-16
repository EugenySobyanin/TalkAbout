from rest_framework import serializers

from compilations.models import Compilation, CompilationsFilms
from gallery.models import Film


class CompilationSerializer(serializers.ModelSerializer):
    """Сериализатор для подборок (компиляций)."""

    films = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Film.objects.all(),
        required=False
    )

    class Meta:
        model = Compilation
        fields = ['id', 'user', 'title', 'description', 'is_public', 'films']
        read_only_fields = ['user']  # чтобы user автоматически устанавливался из запроса

    def create(self, validated_data):
        films_data = validated_data.pop('films', [])
        compilation = Compilation.objects.create(**validated_data)

        # Создаем связи через промежуточную модель
        for film in films_data:
            CompilationsFilms.objects.create(
                collection=compilation,
                film=film
            )

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

            # Создаем новые связи
            for film in films_data:
                CompilationsFilms.objects.create(
                    collection=instance,
                    film=film
                )

        return instance
