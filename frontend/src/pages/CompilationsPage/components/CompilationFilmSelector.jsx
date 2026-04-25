import React, { useEffect, useMemo, useState } from 'react'
import { searchFilms } from '../../../api/films'

const getFilmPoster = (film) => {
  return film.poster || film.poster_url || film.poster_preview_url || '/placeholder-poster.jpg'
}

const getFilmTitle = (film) => {
  return film.name || film.alternative_name || film.en_name || 'Без названия'
}

const formatRating = (rating) => {
  if (rating === null || rating === undefined || rating === '') {
    return null
  }

  const numericRating = Number(rating)

  if (Number.isNaN(numericRating)) {
    return null
  }

  return numericRating.toFixed(1)
}

const CompilationFilmSelector = ({
  selectedFilms = [],
  onChange,
  compact = false,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const selectedIds = useMemo(() => {
    return new Set(selectedFilms.map((film) => film.id))
  }, [selectedFilms])

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchFilms(trimmedQuery)
        setResults(data.results || data || [])
      } catch (error) {
        console.error('Ошибка поиска фильмов:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleToggleFilm = (film) => {
    if (selectedIds.has(film.id)) {
      onChange(selectedFilms.filter((item) => item.id !== film.id))
      return
    }

    onChange([...selectedFilms, film])
  }

  const handleRemoveFilm = (filmId) => {
    onChange(selectedFilms.filter((film) => film.id !== filmId))
  }

  return (
    <div className={`compilations-film-selector ${compact ? 'compilations-film-selector--compact' : ''}`}>
      <div className="compilations-film-selector__search">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти фильм для подборки..."
          className="compilations-film-selector__input"
        />

        {isSearching && (
          <span className="compilations-film-selector__spinner">
            ⟳
          </span>
        )}
      </div>

      {results.length > 0 && (
        <div className="compilations-film-selector__results">
          {results.slice(0, 8).map((film) => {
            const isSelected = selectedIds.has(film.id)

            return (
              <button
                type="button"
                key={film.id}
                className={`compilations-film-result ${isSelected ? 'compilations-film-result--selected' : ''}`}
                onClick={() => handleToggleFilm(film)}
              >
                <img
                  src={getFilmPoster(film)}
                  alt={getFilmTitle(film)}
                  className="compilations-film-result__poster"
                  onError={(event) => {
                    event.target.onerror = null
                    event.target.src = '/placeholder-poster.jpg'
                  }}
                />

                <span className="compilations-film-result__info">
                  <span className="compilations-film-result__title">
                    {getFilmTitle(film)}
                  </span>

                  <span className="compilations-film-result__meta">
                    {film.year || '—'}
                    {formatRating(film.kinopoisk_rating) && (
                      <>
                        <span>•</span>
                        KP {formatRating(film.kinopoisk_rating)}
                      </>
                    )}
                  </span>
                </span>

                <span className="compilations-film-result__check">
                  {isSelected ? '✓' : '+'}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {query.trim().length >= 2 && !isSearching && results.length === 0 && (
        <div className="compilations-film-selector__empty">
          Ничего не найдено
        </div>
      )}

      {selectedFilms.length > 0 && (
        <div className="compilations-selected-films">
          <div className="compilations-selected-films__title">
            Выбрано фильмов: {selectedFilms.length}
          </div>

          <div className="compilations-selected-films__list">
            {selectedFilms.map((film) => (
              <div key={film.id} className="compilations-selected-film">
                <img
                  src={getFilmPoster(film)}
                  alt={getFilmTitle(film)}
                  className="compilations-selected-film__poster"
                  onError={(event) => {
                    event.target.onerror = null
                    event.target.src = '/placeholder-poster.jpg'
                  }}
                />

                <div className="compilations-selected-film__info">
                  <span className="compilations-selected-film__title">
                    {getFilmTitle(film)}
                  </span>

                  <span className="compilations-selected-film__year">
                    {film.year || '—'}
                  </span>
                </div>

                <button
                  type="button"
                  className="compilations-selected-film__remove"
                  onClick={() => handleRemoveFilm(film.id)}
                  aria-label={`Удалить фильм ${getFilmTitle(film)} из подборки`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CompilationFilmSelector