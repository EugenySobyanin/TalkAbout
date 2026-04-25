import { useEffect, useMemo, useState } from 'react'
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

const quickPresets = [
  {
    label: 'Высокий рейтинг',
    hint: 'КП и IMDb от 7',
    values: {
      kinopoisk_rating_min: '7',
      imdb_rating_min: '7',
    },
  },
  {
    label: 'Короткий фильм',
    hint: 'До 100 минут',
    values: {
      movie_length_max: '100',
    },
  },
  {
    label: 'Классика',
    hint: '1970–1999, КП от 7',
    values: {
      year_min: '1970',
      year_max: '1999',
      kinopoisk_rating_min: '7',
    },
  },
  {
    label: 'Новое',
    hint: 'После 2015',
    values: {
      year_min: '2015',
    },
  },
]

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

  const activeFiltersCount = useMemo(() => {
    return Object.values(formData).reduce((count, value) => {
      if (Array.isArray(value)) {
        return value.length > 0 ? count + 1 : count
      }

      return value ? count + 1 : count
    }, 0)
  }, [formData])

  const handleChange = (event) => {
    const { name, value } = event.target

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

  const handlePresetClick = (preset) => {
    setFormData((prev) => ({
      ...prev,
      ...preset.values,
    }))
  }

  const handleReset = () => {
    setFormData(initialFormData)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

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
    return (
      <div className="movie-picker-page">
        <div className="picker-loading">
          <div className="picker-loading-spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="movie-picker-page">
      <div className="movie-picker-toolbar">
        <div>
          <p className="movie-picker-eyebrow">Frame25</p>
          <h1 className="movie-picker-title">Подбор фильма</h1>
        </div>

        <div className="movie-picker-summary">
          <span className="movie-picker-summary__label">Активных фильтров</span>
          <span className="movie-picker-summary__value">{activeFiltersCount}</span>
        </div>
      </div>

      <form className="movie-picker-form" onSubmit={handleSubmit}>
        <section className="picker-panel picker-panel--presets">
          <div className="picker-panel__head">
            <div>
              <h2 className="picker-panel__title">Быстрый старт</h2>
              <p className="picker-panel__text">
                Можно выбрать один из пресетов, а потом докрутить параметры вручную.
              </p>
            </div>
          </div>

          <div className="picker-presets">
            {quickPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="picker-preset"
                onClick={() => handlePresetClick(preset)}
              >
                <span className="picker-preset__label">{preset.label}</span>
                <span className="picker-preset__hint">{preset.hint}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="movie-picker-layout">
          <section className="picker-panel">
            <div className="picker-panel__head">
              <div>
                <h2 className="picker-panel__title">Период и формат</h2>
                <p className="picker-panel__text">
                  Ограничь год выхода, длительность и возрастной рейтинг.
                </p>
              </div>
            </div>

            <div className="picker-stack">
              <RangeField
                label="Год выпуска"
                minName="year_min"
                maxName="year_max"
                minValue={formData.year_min}
                maxValue={formData.year_max}
                onChange={handleChange}
                minPlaceholder="1990"
                maxPlaceholder="2010"
              />

              <RangeField
                label="Длительность, мин"
                minName="movie_length_min"
                maxName="movie_length_max"
                minValue={formData.movie_length_min}
                maxValue={formData.movie_length_max}
                onChange={handleChange}
                minPlaceholder="80"
                maxPlaceholder="140"
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

          <section className="picker-panel">
            <div className="picker-panel__head">
              <div>
                <h2 className="picker-panel__title">Рейтинги</h2>
                <p className="picker-panel__text">
                  Отсекай слабые фильмы по оценкам Кинопоиска и IMDb.
                </p>
              </div>
            </div>

            <div className="picker-stack">
              <RangeField
                label="Рейтинг Кинопоиска"
                minName="kinopoisk_rating_min"
                maxName="kinopoisk_rating_max"
                minValue={formData.kinopoisk_rating_min}
                maxValue={formData.kinopoisk_rating_max}
                onChange={handleChange}
                minPlaceholder="7.0"
                maxPlaceholder="10"
                step="0.1"
              />

              <RangeField
                label="Рейтинг IMDb"
                minName="imdb_rating_min"
                maxName="imdb_rating_max"
                minValue={formData.imdb_rating_min}
                maxValue={formData.imdb_rating_max}
                onChange={handleChange}
                minPlaceholder="7.0"
                maxPlaceholder="10"
                step="0.1"
              />
            </div>
          </section>
        </div>

        <section className="picker-panel">
          <div className="picker-panel__head">
            <div>
              <h2 className="picker-panel__title">Жанры и страны</h2>
              <p className="picker-panel__text">
                Выбирай несколько значений. Поиск поможет быстро найти нужное.
              </p>
            </div>
          </div>

          <div className="movie-picker-categories">
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

        <div className="picker-actions">
          <button type="button" className="picker-reset-btn" onClick={handleReset}>
            Очистить
          </button>

          <button type="submit" className="picker-submit-btn">
            Показать фильмы
          </button>
        </div>
      </form>
    </div>
  )
}

export default FilmPickerPage