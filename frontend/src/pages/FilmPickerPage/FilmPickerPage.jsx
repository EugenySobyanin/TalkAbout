import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getFilmGenres,
  getFilmCountries,
  getFilmPersons,
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
  persons: [],
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

const normalizeOptions = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.results)) {
    return data.results
  }

  return []
}

const normalizePersonOptions = (data) => {
  return normalizeOptions(data)
    .map((person) => ({
      ...person,
      id: Number(person.id),
      name:
        person.name ||
        person.full_name ||
        person.en_name ||
        person.original_name ||
        `Персона #${person.id}`,
    }))
    .filter((person) => person.id && person.name)
}

function FilmPickerPage() {
  const navigate = useNavigate()

  const [genres, setGenres] = useState([])
  const [countries, setCountries] = useState([])
  const [persons, setPersons] = useState([])

  const [loading, setLoading] = useState(true)
  const [personsLoading, setPersonsLoading] = useState(false)

  const [personSearch, setPersonSearch] = useState('')
  const [selectedPersons, setSelectedPersons] = useState([])

  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [genresResult, countriesResult] = await Promise.allSettled([
          getFilmGenres(),
          getFilmCountries(),
        ])

        if (genresResult.status === 'fulfilled') {
          setGenres(normalizeOptions(genresResult.value))
        } else {
          console.error('Ошибка загрузки жанров:', genresResult.reason)
        }

        if (countriesResult.status === 'fulfilled') {
          setCountries(normalizeOptions(countriesResult.value))
        } else {
          console.error('Ошибка загрузки стран:', countriesResult.reason)
        }
      } catch (error) {
        console.error('Ошибка загрузки справочников:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFiltersData()
  }, [])

  useEffect(() => {
    const search = personSearch.trim()

    if (search.length < 2) {
      setPersons([])
      setPersonsLoading(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setPersonsLoading(true)

        const data = await getFilmPersons(search)
        setPersons(normalizePersonOptions(data))
      } catch (error) {
        console.error('Ошибка поиска персон:', error)
        setPersons([])
      } finally {
        setPersonsLoading(false)
      }
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [personSearch])

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

  const handlePersonToggle = (person) => {
    const personId = Number(person.id)

    setFormData((prev) => {
      const alreadySelected = prev.persons.includes(personId)

      return {
        ...prev,
        persons: alreadySelected
          ? prev.persons.filter((id) => id !== personId)
          : [...prev.persons, personId],
      }
    })

    setSelectedPersons((prev) => {
      const alreadySelected = prev.some((item) => Number(item.id) === personId)

      if (alreadySelected) {
        return prev.filter((item) => Number(item.id) !== personId)
      }

      return [...prev, person]
    })
  }

  const handlePersonRemove = (personId) => {
    const normalizedPersonId = Number(personId)

    setFormData((prev) => ({
      ...prev,
      persons: prev.persons.filter((id) => Number(id) !== normalizedPersonId),
    }))

    setSelectedPersons((prev) => (
      prev.filter((person) => Number(person.id) !== normalizedPersonId)
    ))
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setPersonSearch('')
    setPersons([])
    setSelectedPersons([])
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
          <h1 className="movie-picker-title">
            <span className="movie-picker-title__white">Подбор</span> фильма
          </h1>

          <p className="movie-picker-subtitle">
            Собери свой идеальный вечер: жанр, страна, персона, эпоха и рейтинг.
          </p>
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

        <section className="picker-panel picker-panel--yellow picker-panel--categories">
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

        <section className="picker-panel picker-panel--persons">
          <div className="picker-panel__head">
            <div>
              <h2 className="picker-panel__title">Персоны</h2>
              <p className="picker-panel__text">
                Фильтрация по актёрам, режиссёрам и другим участникам фильма.
              </p>
            </div>
          </div>

          <div className="movie-picker-persons">
            <div className="search-multi">
              <label className="search-multi__label">Персоны</label>

              <div className="search-multi__box">
                <input
                  type="text"
                  value={personSearch}
                  onChange={(event) => setPersonSearch(event.target.value)}
                  placeholder="Введите минимум 2 символа"
                  className="search-multi__input"
                />

                {selectedPersons.length > 0 && (
                  <div className="search-multi__chips">
                    {selectedPersons.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        className="search-multi__chip"
                        onClick={() => handlePersonRemove(person.id)}
                      >
                        {person.name || person.en_name}
                        <span className="search-multi__chip-x">×</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="search-multi__options">
                  {personSearch.trim().length < 2 ? (
                    <div className="search-multi__empty">
                      Начните вводить имя персоны
                    </div>
                  ) : personsLoading ? (
                    <div className="search-multi__empty">
                      Поиск...
                    </div>
                  ) : persons.length > 0 ? (
                    persons.map((person) => {
                      const isSelected = formData.persons.includes(Number(person.id))

                      return (
                        <button
                          key={person.id}
                          type="button"
                          className={`search-multi__option ${
                            isSelected ? 'search-multi__option--selected' : ''
                          }`}
                          onClick={() => handlePersonToggle(person)}
                        >
                          <span>{person.name || person.en_name}</span>
                          {isSelected && (
                            <span className="search-multi__check">✓</span>
                          )}
                        </button>
                      )
                    })
                  ) : (
                    <div className="search-multi__empty">
                      Персоны не найдены
                    </div>
                  )}
                </div>
              </div>
            </div>
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