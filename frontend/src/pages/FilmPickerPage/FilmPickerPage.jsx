import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getFilmGenres,
  getFilmCountries,
} from '../../api/films'
import RangeField from '../../components/RangeField/RangeField'
import SearchableMultiSelect from '../../components/SearchableMultiSelect/SearchableMultiSelect'
import './FilmPickerPage.css'

const initialFormData = {
  year_min: '',
  year_max: '',
  movie_length_min: '',
  movie_length_max: '',
  kinopoisk_rating_min: '',
  kinopoisk_rating_max: '',
  imdb_rating_min: '',
  imdb_rating_max: '',
  age_rating: '',
  genres: [],
  countries: [],
}

function FilmPickerPage() {
  const navigate = useNavigate()

  const [genres, setGenres] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [genresData, countriesData] = await Promise.all([
          getFilmGenres(),
          getFilmCountries(),
        ])

        setGenres(genresData)
        setCountries(countriesData)
      } catch (error) {
        console.error('Ошибка загрузки справочников:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFiltersData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleArrayChange = (fieldName, values) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: values,
    }))
  }

  const handleReset = () => {
    setFormData(initialFormData)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const params = new URLSearchParams()

    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item) params.append(key, item)
        })
      } else if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value)
      }
    })

    navigate(`/films/picker/results?${params.toString()}`)
  }

  if (loading) {
    return <div className="picker-loading">Загрузка фильтров...</div>
  }

  return (
    <div className="movie-picker-page">
      <div className="movie-picker-hero">
        <p className="movie-picker-hero__eyebrow">Frame25</p>
        <h1 className="movie-picker-hero__title">Подбор фильма</h1>
        <p className="movie-picker-hero__subtitle">
          Настрой параметры под свое настроение: жанр, страну, рейтинг, длительность и период выхода.
        </p>
      </div>

      <form className="movie-picker-form" onSubmit={handleSubmit}>
        <div className="movie-picker-layout">
          <section className="picker-card">
            <div className="picker-card__head">
              <h2 className="picker-card__title">Основные параметры</h2>
              <p className="picker-card__text">Укажите диапазоны, чтобы сузить подборку.</p>
            </div>

            <div className="picker-stack">
              <RangeField
                label="Год выпуска"
                minName="year_min"
                maxName="year_max"
                minValue={formData.year_min}
                maxValue={formData.year_max}
                onChange={handleChange}
                minPlaceholder="Например, 1990"
                maxPlaceholder="Например, 2010"
              />

              <RangeField
                label="Длительность, мин"
                minName="movie_length_min"
                maxName="movie_length_max"
                minValue={formData.movie_length_min}
                maxValue={formData.movie_length_max}
                onChange={handleChange}
              />

              <RangeField
                label="Рейтинг Кинопоиска"
                minName="kinopoisk_rating_min"
                maxName="kinopoisk_rating_max"
                minValue={formData.kinopoisk_rating_min}
                maxValue={formData.kinopoisk_rating_max}
                onChange={handleChange}
                step="0.1"
              />

              <RangeField
                label="Рейтинг IMDb"
                minName="imdb_rating_min"
                maxName="imdb_rating_max"
                minValue={formData.imdb_rating_min}
                maxValue={formData.imdb_rating_max}
                onChange={handleChange}
                step="0.1"
              />

              <div className="single-field">
                <label className="single-field__label">Возрастной рейтинг</label>
                <input
                  type="number"
                  name="age_rating"
                  value={formData.age_rating}
                  onChange={handleChange}
                  placeholder="Например, 16"
                  className="single-field__input"
                />
              </div>
            </div>
          </section>

          <section className="picker-card">
            <div className="picker-card__head">
              <h2 className="picker-card__title">Категории</h2>
              <p className="picker-card__text">Выберите несколько значений. Поиск поможет быстро найти нужное.</p>
            </div>

            <div className="picker-stack">
              <SearchableMultiSelect
                label="Жанры"
                options={genres}
                selectedValues={formData.genres}
                onChange={(values) => handleArrayChange('genres', values)}
                placeholder="Найти жанр"
                emptyText="Жанры не найдены"
              />

              <SearchableMultiSelect
                label="Страны"
                options={countries}
                selectedValues={formData.countries}
                onChange={(values) => handleArrayChange('countries', values)}
                placeholder="Найти страну"
                emptyText="Страны не найдены"
              />
            </div>
          </section>
        </div>

        <div className="picker-actions">
          <button type="submit" className="picker-submit-btn">
            Показать фильмы
          </button>

          <button
            type="button"
            className="picker-reset-btn"
            onClick={handleReset}
          >
            Очистить
          </button>
        </div>
      </form>
    </div>
  )
}

export default FilmPickerPage