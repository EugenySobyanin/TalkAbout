from django.core.validators import (MinValueValidator,
                                    MaxValueValidator,
                                    MaxLengthValidator)
from django.db import models
from django.utils.text import slugify
from django.utils import timezone


from gallery.constants import (
    # Максимальные значения длины для полей
    NAME_MAX_LENGTH,
    PERSON_NAME_MAX_LENGTH,
    FILM_TITLE_MAX_LENGTH,
    SHORT_DESC_MAX_LENGTH,
    SLOGAN_MAX_LENGTH,
    RATING_MPAA_MAX_LENGTH,
    BUDGET_CURRENCY_MAX_LENGTH,
    MOVIE_CHARACTER_MAX_LENGTH,
    URL_MAX_LENGTH,
    VIDEO_TITLE_MAX_LENGTH,
    PROFESSION_MAX_LENGTH,
    CURRENCY_MAX_LENGTH,

    # Ограничения по длине в строковых методах
    CUT_FACT_TEXT,
    CUT_FILM_NAME,
    CUT_PERSON_NAME,
    CUT_VIDEO_NAME,

    # Ограничения в валидаторах
    FIRST_FILM_YEAR,
    MAX_MOVIE_LENGTH,
    MIN_MOVIE_LENGTH
)
from gallery.validators import MaxYearValidator
from gallery.utils import cut_str


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
        related_name='film_genres'
    )
    # При обратной свзи получаем все объекты FilmGenre, где genre == Genre.id
    # Потом можно получить все фильмы в конкретном жанре
    genre = models.ForeignKey(
        Genre,
        on_delete=models.CASCADE,
        verbose_name='Жанр',
        related_name='films'
    )

    def __str__(self) -> str:
        return f'{cut_str(self.film.name, CUT_FILM_NAME)} - {self.genre.name}'


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
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        related_name='film_countries'
    )
    # При обратной свзи получаем все объекты FilmCountry,
    # где country == Country.id
    # Потом можно получить все фильмы, снятые в конкретной стране
    country = models.ForeignKey(
        Country,
        on_delete=models.CASCADE,
        related_name='films'
    )

    def __str__(self) -> str:
        return (f'{cut_str(self.film.name, CUT_FILM_NAME)} '
                f'- {self.country.name}')


class Network(BaseWithSlug):
    """Стриминговый сервис.

    Netfilx, HBO и тд.
    """

    name = models.CharField(
        'Стриминговый сервис',
        max_length=NAME_MAX_LENGTH,
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
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        related_name='film_networks'
    )
    # При обратной свзи получаем все объекты FilmNetwork,
    # где network == Network.id
    # Потом можно получить все фильмы, выпущенные этим сервисом
    network = models.ForeignKey(
        Network,
        on_delete=models.CASCADE,
        related_name='films'
    )

    def __str__(self) -> str:
        return (f'{cut_str(self.film.name, CUT_FILM_NAME)} '
                f'- {self.network.name}')


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
        max_length=PERSON_NAME_MAX_LENGTH,
        null=True,
        blank=True,
        db_index=True,
    )
    en_name = models.CharField(
        'Имя и фамилия на английском',
        max_length=PERSON_NAME_MAX_LENGTH,
        null=True,
        blank=True,
        db_index=True,
    )
    growth = models.PositiveSmallIntegerField(
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
        return f'{cut_str(self.name, CUT_PERSON_NAME)}'

    @property
    def age(self):
        """Возраст или возраст на момент смерти."""
        if not self.birthday:
            return None

        end_date = timezone.now().date() if not self.death else self.death

        # Проверка что дата смерти не раньше даты рождения
        if self.death and self.death < self.birthday:
            return None

        # Точный расчет
        age = end_date.year - self.birthday.year

        # Проверяем, наступил ли день рождения в текущем году
        has_birthday_occurred = (
            (end_date.month > self.birthday.month) or
            (end_date.month == self.birthday.month and 
             end_date.day >= self.birthday.day)
        )

        if not has_birthday_occurred:
            age -= 1

        return max(0, age)  # Возраст не может быть отрицательным


class Profession(models.Model):
    """Профессии.

    Профессии людей, задействованных в ходе
    съемки фильма.
    """

    profession = models.CharField(
        'Профессия на русском',
        max_length=PROFESSION_MAX_LENGTH,
        unique=True
    )
    en_profession = models.CharField(
        'Профессия на английском',
        max_length=PROFESSION_MAX_LENGTH,
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
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        related_name='film_persons'
    )
    # При обратной связи получаем объекты FilmPerson, где person = Person.id
    # Потом можем получить все фильмы, где участвует конкретная персона
    person = models.ForeignKey(
        Person,
        on_delete=models.CASCADE,
        related_name='films'
    )
    # Если это актер, то в этом поле краткое описание персонажа,
    # которого он играет
    description = models.CharField(
        'Описание роли, которую исполнил актре в фильме',
        max_length=MOVIE_CHARACTER_MAX_LENGTH,
        null=True,
        blank=True,
        help_text='Описание роли, которую исполнил актре в фильме',
    )

    def __str__(self) -> str:
        return (f'{self.pk} - {cut_str(self.film.name, CUT_FILM_NAME)} '
                f'- {cut_str(self.person.name, CUT_PERSON_NAME)}')


class FilmPersonProfession(models.Model):
    """Промежуточная модель.

    Связь FilmPerson  и Profession (Many To Many).
    Одна персона может иметь несколько профессий в
    рамках одного фильма.
    """
    # При обратной связи получаем все объекты FilmPersonProfession,
    # где film_person == FilmPerson.id
    # Потом можем получить все профессии, которые были в этом фильме
    film_person = models.ForeignKey(
        FilmPerson,
        on_delete=models.CASCADE,
        related_name='professions'
    )
    # При обратной связи получаем все объекты FilmPersonProfession,
    # где profession == Profession.id
    # Потом можем получить всех людей конкретной профессии по фильму
    profession = models.ForeignKey(
        Profession,
        on_delete=models.CASCADE,
        related_name='film_person_professions'
    )

    def __str__(self) -> str:
        return (f'{self.pk} - '
                f'{cut_str(self.film_person.film.name, CUT_FILM_NAME)} - '
                f'{cut_str(self.film_person.person.name, CUT_PERSON_NAME)} - '
                f'{self.profession.profession}')


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
        related_name='videos'
    )
    url = models.URLField(
        'Ссылка',
        max_length=URL_MAX_LENGTH,
        null=True,
        blank=True,
        unique=True,
    )
    name = models.CharField(
        'Название видео',
        max_length=VIDEO_TITLE_MAX_LENGTH,
        null=True,
        blank=True
    )
    site = models.CharField(
        'Название сайта',
        max_length=NAME_MAX_LENGTH,
        null=True,
        blank=True,
    )
    type = models.CharField(
        'Тип видео',
        max_length=NAME_MAX_LENGTH,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Видео'
        verbose_name_plural = 'Видео'
        ordering = ['film', 'type', 'name']

    def __str__(self) -> str:
        return (f'{self.pk} - '
                f'{cut_str(self.name, CUT_VIDEO_NAME)} '
                f'- {self.type} - {cut_str(self.film.name, CUT_FILM_NAME)}')


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
    text = models.TextField('Текст', default='')
    # Тип факта FACT, BLOOPER
    type = models.CharField(
        'Тип факта',
        max_length=NAME_MAX_LENGTH,
        null=True,
        blank=True,
    )
    spoiler = models.BooleanField('Спойлер или нет', default=False)

    class Meta:
        verbose_name = 'Факт'
        verbose_name_plural = 'Факты'
        ordering = ['film', 'type', 'pk']

    def __str__(self):
        return (f'{self.pk} - '
                f'{cut_str(self.film.name, CUT_FILM_NAME)} - '
                f'{cut_str(self.text, CUT_FACT_TEXT)}')


class Fees(models.Model):
    """Данные о сборах фильма.

    One To Many
    Одна запись из Fees связана с одним фильмом,
    Один фильм может быть связан с несколькими записями из Fees.
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
        max_length=NAME_MAX_LENGTH,
    )
    value = models.PositiveIntegerField('Сумма', null=True, blank=True)
    currency = models.CharField(
        'Валюта',
        max_length=CURRENCY_MAX_LENGTH,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'Сборы'
        verbose_name_plural = 'Сборы'
        ordering = ['film', 'place']

    def __str__(self):
        return (f'{self.pk} - {cut_str(self.film.name, CUT_FILM_NAME)} '
                f'собрал {self.value} {self.currency} в {self.place}')


class AgregatorInfo(models.Model):
    """Данные агрегаторов.

    Агрегаторы: кинопоиск, imdb, критики.
    Связь One To Many
    Одна записись из AgregatorIngo может быть связан с одним Film
    Один Film может быть связан со многими AgregatorInfo.
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
    source = models.CharField('Ресурс', max_length=NAME_MAX_LENGTH)

    class Meta:
        verbose_name = 'Данные агрегатора'
        verbose_name_plural = 'Данные агрегаторов'
        ordering = ['film', 'source', 'pk']

    def __str__(self) -> str:
        return (f'{self.pk} - {self.source} - '
                f'{cut_str(self.film.name, CUT_FILM_NAME)}')


class SequelsAndPrequels(models.Model):
    """Данные о сиквелах и приквелах."""
    # При обратной связи получаем все объекты SequelsAndPrequels,
    # где film == Film.pk
    # Потом мы можем извлечь все сиквелы и приквелы фильма
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        verbose_name='Фильм',
        related_name='sequels_and_prequels'
    )
    # Для этого поля обратная связь не нужна, т.к по сути, в результате
    # так же получаем сиквелы и приквелы
    related_film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        verbose_name='Связанынй фильм (сиквел, приквел и тд.)'
    )

    class Meta:
        verbose_name = 'Сиквелы, приквелы и тд.'
        verbose_name_plural = 'Сиквелы, приквелы и тд.'

    def __str__(self) -> str:
        return (f'{self.pk} - {cut_str(self.film.name, CUT_FILM_NAME)} '
                f'связан с - {cut_str(self.related_film.name, CUT_FILM_NAME)}')


class SimilarFilms(models.Model):
    """Данные о схожих фильмах."""
    # При обратной связи получаем все объекты SequelsAndPrequels,
    # где film == Film.pk
    # Потом мы можем извлечь все сиквелы и приквелы фильма
    film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        verbose_name='Фильм',
        related_name='similar_films'
    )
    # Для этого поля обратная связь не нужна, т.к по сути, в результате
    # так же получаем схожие фильмы (которые связаны с этим)
    similar_film = models.ForeignKey(
        Film,
        on_delete=models.CASCADE,
        verbose_name='Похожий фильм'
    )

    class Meta:
        verbose_name = 'Похожий фильм'
        verbose_name_plural = 'Похожие фильмы'

    def __str__(self) -> str:
        return (f'{self.pk} - {cut_str(self.film.name, CUT_FILM_NAME)} '
                f'связан с - {cut_str(self.similar_film.name, CUT_FILM_NAME)}')
