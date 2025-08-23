from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class MPAARating(models.TextChoices):
    """Возможные варианты рейтинга MPAAA."""

    G = 'G', 'G (Для всех возрастов)'
    PG = 'PG', 'PG (Родительский контроль)'
    PG_13 = 'PG-13', 'PG-13 (Для детей от 13 лет)'
    R = 'R', 'R (До 17 лет с родителями)'
    NC_17 = 'NC-17', 'NC-17 (Только для взрослых 18+)'
    NOT_RATED = 'NR', 'Не рейтингован'
    UNRATED = 'UNRATED', 'Без рейтинга'


class BaseWithSlug(models.Model):
    """Базовый класс с полем Slug."""

    name = models.CharField(max_length=255)
    slug = models.SlugField(
        'Slug',
        max_length=255,
        blank=True,
        unique=True,
        help_text="Человекопонятный URL (автозаполнение)"
    )

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
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(
        'Название',
        max_length=255,
    )
    alternative_name = models.CharField(
        'Альтернативное название',
        max_length=255,
        null=True,
        blank=True,
    )
    en_name = models.CharField(
        'Название на английском',
        max_length=255,
        null=True,
        blank=True,
    )
    description = models.TextField('Описание', null=True, blank=True,)
    short_description = models.TextField('Краткое описание',
                                         null=True, blank=True,)
    slogan = models.CharField('Слоган', max_length=255, null=True, blank=True,)
    year = models.IntegerField(
        'Год выпуска фильма',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(1888, message='Первый фильм вышел в 1888 году.'),
            MaxValueValidator(lambda: timezone.now().year + 20,
                              message="Слишком будущий год")
        ],
    )
    movie_length = models.PositiveIntegerField(
        'Длительность фильма в минутах',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(1, 'Не может быть меньше 1'),
            MaxValueValidator(1000,
                              'Длительность не может быть больше 1000 минут.')
        ],
    )
    rating_mpaa = models.CharField(
        'Рейтиг MPAA',
        null=True,
        blank=True,
        choices=MPAARating.choices,
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
        max_length=20,
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
            MinValueValidator(1, 'Не может быть меньше 1'),
            MaxValueValidator(1000,
                              'Длительность не может быть больше 1000 минут.')
        ],
    )
    total_series_length = models.PositiveIntegerField(
        'Длительность сериала в минутах',
        null=True,
        blank=True,
        validators=[
            MinValueValidator(1, 'Не может быть меньше 1'),
        ],
    )
    # seasons_info = ...
    # start_series = ... # Год старта сериала
    # end_series = ...   # Год окончания сериала
    # poster = ...
    # logo = ...
    # backdrop = ...
    type = models.ForeignKey('Type',
                             on_delete=models.SET_NULL,
                             null=True,
                             blank=True,
                             verbose_name='Тип',
                             related_name='films')
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


class Type(BaseWithSlug):
    """Тип кинопроизведения.

    Фильм, сериал, мультфильм и тд.
    """

    name = models.CharField(
        'Тип',
        max_length=255,
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
        max_length=255,
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
    film = models.ForeignKey(Film,
                             on_delete=models.CASCADE,
                             related_name='genres')
    # При обратной свзи получаем все объекты FilmGenre, где genre == Genre.id
    # Потом можно получить все фильмы в конкретном жанре
    genre = models.ForeignKey(Genre,
                              on_delete=models.CASCADE,
                              related_name='films')


class Country(BaseWithSlug):
    """Страна производства.

    США, Россия, Швеция и тд.
    """

    name = models.CharField(
        'Страна',
        max_length=255,
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


class Fact(models.Model):
    """Факт.

    Факты связанные с фильмами.
    One To Many.
    У одного факта один фильм, у одного фильма много фактов.
    """


class Fees(models.Model):
    """Данные о сборах фильма.

    One To One
    Одна запись из Fees связана с одним фильмом,
    Один фильм связан с одной записью Fees.
    """


class AgregatorInfo(models.Model):
    """Данные агрегаторов.

    Агрегаторы: кинопоиск, imdb, критики.
    Many To Many
    """


class SequelsAndPrequels(models.Model):
    """Данные о сиквелах и приквелах."""


class SimilarFilms(models.Model):
    """Данные о похожих фильмах."""
