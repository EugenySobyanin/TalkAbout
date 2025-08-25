from django.core.validators import (MinValueValidator,
                                    MaxValueValidator,
                                    MaxLengthValidator)
from django.db import models
from django.utils.text import slugify


from backend.gallery.constants import (
    NAME_MAX_LENGTH,
    FILM_TITLE_MAX_LENGTH,
    SHORT_DESC_MAX_LENGTH,
    SLOGAN_MAX_LENGTH,
    FIRST_FILM_YEAR,
    MIN_MOVIE_LENGTH,
    MAX_MOVIE_LENGTH,
    RATING_MPAA_MAX_LENGTH,
    BUDGET_CURRENCY_MAX_LENGTH
)
from backend.gallery.validators import MaxYearValidator


class BaseWithSlug(models.Model):
    """Базовый класс с полем Slug."""

    name = models.CharField(
        'Название',
        max_length=NAME_MAX_LENGTH
    )
    slug = models.SlugField(
        'Slug',
        max_length=NAME_MAX_LENGTH,
        blank=True,
        unique=True,
        help_text="Человекопонятный URL (автозаполнение)"
    )

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Автоматически создаем slug из name, если он не задан
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Film(models.Model):
    """Главная модель.

    Не только фильмы, но у сериалы, мультфильмы и тд.
    """

    kinopoisk_api_id = models.PositiveIntegerField(
        'ID API Kinopoisk',
        null=True,
        blank=True,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    name = models.CharField(
        'Название (на русском)',
        max_length=FILM_TITLE_MAX_LENGTH,
        null=True,
        blank=True,
        db_index=True,
    )
    alternative_name = models.CharField(
        'Альтернативное название',
        max_length=FILM_TITLE_MAX_LENGTH,
        null=True,
        blank=True,
        db_index=True,
    )
    en_name = models.CharField(
        'Название на английском',
        max_length=FILM_TITLE_MAX_LENGTH,
        null=True,
        blank=True,
        db_index=True,
    )
    description = models.TextField(
        'Описание',
        null=True,
        blank=True,
    )
    short_description = models.TextField(
        'Краткое описание',
        null=True,
        blank=True,
        validators=[
            MaxLengthValidator(SHORT_DESC_MAX_LENGTH),
        ],
    )
    slogan = models.CharField(
        'Слоган',
        max_length=SLOGAN_MAX_LENGTH,
        null=True,
        blank=True,
    )
    year = models.IntegerField(
        'Год выпуска фильма',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(
                FIRST_FILM_YEAR,
                message=f'Первый фильм вышел в {FIRST_FILM_YEAR} году.'
            ),
            MaxYearValidator(),
        ],
        db_index=True,
    )
    movie_length = models.PositiveIntegerField(
        'Длительность фильма в минутах',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(
                MIN_MOVIE_LENGTH,
                f'Не может быть меньше {MIN_MOVIE_LENGTH}'
            ),
            MaxValueValidator(
                MAX_MOVIE_LENGTH,
                f'Длительность не может быть больше {MAX_MOVIE_LENGTH} минут.')
        ],
    )
    # pg-13, R и тд.
    rating_mpaa = models.CharField(
        'Рейтиг MPAA',
        max_length=RATING_MPAA_MAX_LENGTH,
        null=True,
        blank=True,
    )
    age_rating = models.PositiveSmallIntegerField(
        'Возрастной рейтинг',
        null=True,
        blank=True,
    )
    budget_value = models.PositiveIntegerField(
        'Бюджет фильма',
        null=True,
        blank=True,
    )
    budget_currency = models.CharField(
        'Валюта бюджета',
        max_length=BUDGET_CURRENCY_MAX_LENGTH,
        null=True,
        blank=True
    )
    is_series = models.BooleanField(
        'Сериал или нет',
        default=False,
        blank=True
    )
    series_length = models.PositiveIntegerField(
        'Длительность одной серии в минутах',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(
                MIN_MOVIE_LENGTH,
                f'Не может быть меньше {MIN_MOVIE_LENGTH}'
            ),
            MaxValueValidator(
                MAX_MOVIE_LENGTH,
                f'Длительность не может быть больше {MAX_MOVIE_LENGTH} минут.')
        ],
    )
    total_series_length = models.PositiveIntegerField(
        'Длительность всего сериала в минутах',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(
                MIN_MOVIE_LENGTH,
                f'Не может быть меньше {MIN_MOVIE_LENGTH}'
            ),
        ],
    )
    # seasons_info = ...
    # start_series = ... # Год старта сериала
    # end_series = ...   # Год окончания сериала
    # poster = ...
    # logo = ...
    # backdrop = ...
    type = models.ForeignKey(
        'Type',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Тип',
        related_name='films'
    )
    genres = models.ManyToManyField(
        'Genre',
        through='FilmGenre',
        verbose_name='Жанры'
    )
    countries = models.ManyToManyField(
        'Country',
        through='FilmCountry',
        verbose_name='Страны'
    )
    networks = models.ManyToManyField(
        'Network',
        through='FilmNetwork',
        verbose_name='Стриминговые сервисы'
    )
    persons = models.ManyToManyField(
        'Person',
        through='FilmPerson',
        verbose_name='Персоны'
    )

    class Meta:
        verbose_name = 'Фильм (серил и др.)'
        verbose_name_plural = 'Фильмы (сериалы и др.)'
        ordering = ['year', 'id']

    def __str__(self):
        return f'{self.name} {self.year}'


class Type(BaseWithSlug):
    """Тип кинопроизведения.

    Фильм, сериал, мультфильм и тд.
    """

    name = models.CharField(
        'Тип',
        max_length=NAME_MAX_LENGTH,
        unique=True,
        help_text="Например: Фильм, Сериал, Мультфильм",
    )

    class Meta:
        verbose_name = 'Тип'
        verbose_name_plural = 'Типы'
        ordering = ['name']


class Genre(BaseWithSlug):
    """Жанр.

    Комедия, криминал, драма и тд.
    """

    name = models.CharField(
        'Жанр',
        max_length=NAME_MAX_LENGTH,
        unique=True,
        help_text="Например: Драма, Комедия, Ужасы",
    )

    class Meta:
        verbose_name = 'Жанр'
        verbose_name_plural = 'Жанры'
        ordering = ['name']


class FilmGenre(models.Model):
    """Промежуточная модель.

    Связь Фильма и Жанра (Many To Many).
    """

    # При обратной связи получаем все объекты FilmGenre, где film == Film.id
    # Потом можно получить все жанры фильма
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        verbose_name='Фильм (сериал и тд.)',
        related_name='genres'
    )
    # При обратной свзи получаем все объекты FilmGenre, где genre == Genre.id
    # Потом можно получить все фильмы в конкретном жанре
    genre = models.ForeignKey(
        Genre,
        on_delete=models.CASCADE,
        verbose_name='Жанр',
        related_name='films'
    )


class Country(BaseWithSlug):
    """Страна производства.

    США, Россия, Швеция и тд.
    """

    name = models.CharField(
        'Страна',
        max_length=NAME_MAX_LENGTH,
        unique=True,
        help_text="Например: США, Россия, Италия",
    )

    class Meta:
        verbose_name = 'Страна'
        verbose_name_plural = 'Страны'
        ordering = ['name']


class FilmCountry(models.Model):
    """Промежуточная модель.

    Связь Фильма и Страны (Many To Many).
    """

    # При обратной связи получаем все объекты FilmCountry, где film == Film.id
    # Потом можно получить все страны фильма
    film = models.ForeignKey(Film,
                             on_delete=models.CASCADE,
                             related_name='countries')
    # При обратной свзи получаем все объекты FilmCountry, где country == Country.id
    # Потом можно получить все фильмы, снятые в конкретной стране
    country = models.ForeignKey(Country,
                                on_delete=models.CASCADE,
                                related_name='films')


class Network(BaseWithSlug):
    """Стриминговый сервис.

    Netfilx, HBO и тд.
    """

    name = models.CharField(
        'Стриминговый сервис',
        max_length=255,
        unique=True,
        help_text="Например: Netfilx, HBO, Apple TV",
    )

    class Meta:
        verbose_name = 'Стриминговый сервис'
        verbose_name_plural = 'Стриминговые сервисы'
        ordering = ['name']


class FilmNetwork(models.Model):
    """Промежуточная модель.

    Связь Фильма и Стримингового сервиса (Many To Many).
    """

    # При обратной связи получаем все объекты FilmNetwork, где film == Film.id
    # Потом можно получить все стриминговые сервисы фильма (это не нужно)
    film = models.ForeignKey(Film,
                             on_delete=models.CASCADE,
                             related_name='networks')
    # При обратной свзи получаем все объекты FilmNetwork, где network == Network.id
    # Потом можно получить все фильмы, выпущенные этим сервисом
    network = models.ForeignKey(Network,
                                on_delete=models.CASCADE,
                                related_name='films')


class Person(models.Model):
    """Работник связанный с фильмом.

    Режиссер, актер, актер озвучки, оператор и тд.
    """

    kinopoisk_id = models.PositiveIntegerField(
        'ID на Кинопоиск',
        null=True,
        blank=True,
        unique=True,
    )
    name = models.CharField(
        'Имя и фамилия на русском',
        max_length=255,
        null=True,
        blank=True,
        unique=True,
    )
    en_name = models.CharField(
        'Имя и фамилия на английском',
        max_length=255,
        null=True,
        blank=True,
        unique=True,
    )
    qrowth = models.PositiveSmallIntegerField(
        'Рост в см',
        null=True,
        blank=True,
    )
    birthday = models.DateField(
        'Дата рождения',
        null=True,
        blank=True,

    )
    death = models.DateField(
        'Дата смерти',
        null=True,
        blank=True,
    )
    # photo = ...

    class Meta:
        verbose_name = 'Персона'
        verbose_name_plural = 'Персоны'
        ordering = ['name']

    def __str__(self):
        return self.name


class Profession(models.Model):
    """Профессии.

    Профессии людей, задействованных в ходе
    съемки фильма.
    """

    profession = models.CharField(
        'Профессия на русском',
        max_length=255,
        unique=True
    )
    en_profession = models.CharField(
        'Профессия на английском',
        max_length=255,
        unique=True
    )

    class Meta:
        verbose_name = 'Профессия'
        verbose_name_plural = 'Профессии'
        ordering = ['profession']

    def __str__(self) -> str:
        return self.profession


class FilmPerson(models.Model):
    """Промежуточная модель.

    Связь Фильма и Персоны (Many To Many).
    """

    # При обратной свзяи получаем объекты FilmPerson, где film == Film.id
    # Потом можем получить всех персон этого фильма
    film = models.ForeignKey(Film,
                             on_delete=models.CASCADE,
                             related_name='persons')
    # При обратной связи получаем объекты FilmPerson, где person = Person.id
    # Потом можем получить все фильмы, где участвует конкретная персона
    person = models.ForeignKey(Person,
                               on_delete=models.CASCADE,
                               related_name='films')
    # Если это актер, то в этом поле краткое описание персонажа, которого он играет
    description = models.CharField(
        'Персонаж из фильма',
        max_length=255,
        null=True,
        blank=True,
    )


class FilmPersonProfession(models.Model):
    """Промежуточная модель.

    Связь FilmPerson  и Profession (Many To Many).
    Одна персона может иметь несколько профессий в
    рамках одного фильма.
    """
    # При обратной связи получаем все объекты FilmPersonProfession, где film_person == FilmPerson.id
    # Потом можем получить все профессии, которые были в этом фильме
    film_person = models.ForeignKey(FilmPerson,
                                    on_delete=models.CASCADE,
                                    related_name='professions')
    # При обратной связи получаем все объекты FilmPersonProfession, где profession == Profession.id
    # Потом можем получить всех людей конкретной профессии по фильму
    profession = models.ForeignKey(Profession,
                                   on_delete=models.CASCADE,
                                   related_name='film_persons')


class Video(models.Model):
    """Видео.

    Видео связанные с фильмами.
    One To Many.
    У одного трейлера один фильм, у одного фильма много трейлеров.
    """

    film = models.ForeignKey(
        Film,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Фильм',
        related_name='video'
    )
    url = models.URLField('Ссылка', max_length=255, null=True, blank=True)
    name = models.CharField(
        'Название видео',
        max_length=255,
        null=True,
        blank=True
    )
    site = models.CharField(
        'Название сайта',
        max_length=100,
        null=True,
        blank=True,
        unique=True
    )
    type = models.CharField(
        'Тип видео',
        max_length=50,
        null=True,
        blank=True,
        unique=True,
    )

    class Meta:
        verbose_name = 'Видео'
        verbose_name_plural = 'Видео'
        ordering = ['film', 'type', 'name']

    def __str__(self):
        return self.name


class Fact(models.Model):
    """Факт.

    Факты связанные с фильмами.
    One To Many.
    У одного факта один фильм, у одного фильма много фактов.
    """

    film = models.ForeignKey(
        Film,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Фильм',
        related_name='facts'
    )
    text = models.TextField('Текст', max_length=1000, default='')
    type = models.CharField(
        'Тип факта',
        max_length=50,
        null=True,
        blank=True,
        unique=True
    )
    spoiler = models.BooleanField('Спойлер или нет', default=False)

    class Meta:
        verbose_name = 'Факт'
        verbose_name_plural = 'Факты'
        ordering = ['film', 'type', 'id']

    def __str__(self):
        return self.text[:30]


class Fees(models.Model):
    """Данные о сборах фильма.

    One To One
    Одна запись из Fees связана с одним фильмом,
    Один фильм связан с одной записью Fees.
    """

    film = models.ForeignKey(
        Film,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Фильм',
        related_name='fees'
    )
    place = models.CharField(
        'Тип сброров',
        max_length=50,
    )
    value = models.PositiveIntegerField('Сумма', null=True, blank=True)
    currency = models.CharField('Валюта', null=True, blank=True)

    class Meta:
        verbose_name = 'Сборы'
        verbose_name_plural = 'Сборы'
        ordering = ['film', 'type']

    def __str__(self):
        return f'{self.film.name[:20]} собрал {self.value} {self.currency} в {self.place}'


class AgregatorInfo(models.Model):
    """Данные агрегаторов.

    Агрегаторы: кинопоиск, imdb, критики.
    Many To Many
    """

    film = models.ForeignKey(
        Film,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name='Фильм',
        related_name='agregators'
    )
    rating = models.FloatField(
        'Значение',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(10)
        ]
    )
    votes = models.PositiveIntegerField('Количество оценок')
    source = models.CharField('Ресурс', max_length=30)


class SequelsAndPrequels(models.Model):
    """Данные о сиквелах и приквелах."""


class SimilarFilms(models.Model):
    """Данные о похожих фильмах."""
