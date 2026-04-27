from rest_framework import serializers

from gallery.models import Person



class PersonSerializer(serializers.ModelSerializer):
    """Короткий сериализатор персоны для фильтров."""

    name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Person
        fields = (
            'id',
            'kinopoisk_id',
            'name',
            'en_name',
            'photo_url',
        )

    def get_name(self, obj):
        return obj.name or obj.en_name or f'Персона #{obj.id}'

    def get_photo_url(self, obj):
        photo = (
            getattr(obj, 'photo', None)
            or getattr(obj, 'image', None)
            or getattr(obj, 'photo_url', None)
        )

        if not photo:
            return None

        request = self.context.get('request')

        try:
            photo_url = photo.url
        except AttributeError:
            photo_url = str(photo)

        if not photo_url:
            return None

        if photo_url.startswith('http://') or photo_url.startswith('https://'):
            return photo_url

        if request:
            return request.build_absolute_uri(photo_url)

        return photo_url
