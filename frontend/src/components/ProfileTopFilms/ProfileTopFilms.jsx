import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchFilms } from '../../api/films'
import {
  getMyTopFilms,
  getUserTopFilms,
  updateMyTopFilms,
} from '../../api/users'

const TOP_LIMIT = 10

const getFilmTitle = (film) => {
  return film?.name || film?.alternative_name || film?.en_name || 'Без названия'
}

const getFilmPoster = (film) => {
  return (
    film?.poster_preview_url ||
    film?.poster_url ||
    film?.poster ||
    '/placeholder-poster.jpg'
  )
}

const normalizeTopEntries = (items = []) => {
  return items
    .map((item, index) => {
      if (item?.film) {
        return {
          id: item.id || `${item.film.id}-${index}`,
          position: item.position || index + 1,
          film: item.film,
        }
      }

      return {
        id: `${item.id}-${index}`,
        position: index + 1,
        film: item,
      }
    })
    .filter((item) => item.film?.id)
    .sort((a, b) => a.position - b.position)
    .slice(0, TOP_LIMIT)
}

function ProfileTopFilms({
  isOwner = false,
  userId,
  initialItems = [],
}) {
  const navigate = useNavigate()

  const [items, setItems] = useState(() => normalizeTopEntries(initialItems))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const selectedFilmIds = useMemo(() => {
    return new Set(items.map((item) => item.film.id))
  }, [items])

  const emptySlotsCount = Math.max(TOP_LIMIT - items.length, 0)

  useEffect(() => {
    const loadTopFilms = async () => {
      setLoading(true)

      try {
        const data = isOwner
          ? await getMyTopFilms()
          : await getUserTopFilms(userId)

        setItems(normalizeTopEntries(data))
      } catch (error) {
        console.error('Ошибка загрузки ТОП-10:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOwner || userId) {
      loadTopFilms()
    }
  }, [isOwner, userId])

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (!isOwner || trimmedQuery.length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)

    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchFilms(trimmedQuery)
        setSearchResults(data.results || [])
      } catch (error) {
        console.error('Ошибка поиска фильмов:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, isOwner])

  const persistTop = async (nextItems) => {
    if (!isOwner) return

    const normalized = nextItems.map((item, index) => ({
      ...item,
      position: index + 1,
    }))

    setItems(normalized)
    setSaving(true)

    try {
      const updated = await updateMyTopFilms(
        normalized.map((item) => item.film.id)
      )

      setItems(normalizeTopEntries(updated))
    } catch (error) {
      console.error('Ошибка сохранения ТОП-10:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddFilm = (film) => {
    if (!film?.id) return
    if (selectedFilmIds.has(film.id)) return
    if (items.length >= TOP_LIMIT) return

    const nextItems = [
      ...items,
      {
        id: `new-${film.id}`,
        position: items.length + 1,
        film,
      },
    ]

    setQuery('')
    setSearchResults([])
    persistTop(nextItems)
  }

  const handleRemoveFilm = (filmId) => {
    const nextItems = items.filter((item) => item.film.id !== filmId)
    persistTop(nextItems)
  }

  const handleMoveFilm = (index, direction) => {
    const targetIndex = index + direction

    if (targetIndex < 0 || targetIndex >= items.length) return

    const nextItems = [...items]
    const temp = nextItems[index]

    nextItems[index] = nextItems[targetIndex]
    nextItems[targetIndex] = temp

    persistTop(nextItems)
  }

  return (
    <section className="profile-top">
      <div className="profile-block__head">
        <div>
          <h2 className="profile-block__title">ТОП-10 фильмов</h2>
          <p className="profile-block__count">
            {items.length}/{TOP_LIMIT}
          </p>
        </div>

        {saving && (
          <span className="profile-top__saving">
            Сохраняю...
          </span>
        )}
      </div>

      {isOwner && (
        <div className="profile-top-search">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти фильм и добавить в топ..."
            className="profile-top-search__input"
            disabled={items.length >= TOP_LIMIT}
          />

          {searching && (
            <span className="profile-top-search__loader">
              ⟳
            </span>
          )}

          {searchResults.length > 0 && (
            <div className="profile-top-search__results">
              {searchResults.slice(0, 6).map((film) => {
                const alreadySelected = selectedFilmIds.has(film.id)

                return (
                  <button
                    key={film.id}
                    type="button"
                    className={`profile-top-search__result ${
                      alreadySelected ? 'profile-top-search__result--disabled' : ''
                    }`}
                    onClick={() => handleAddFilm(film)}
                    disabled={alreadySelected || items.length >= TOP_LIMIT}
                  >
                    <img
                      src={getFilmPoster(film)}
                      alt={getFilmTitle(film)}
                      className="profile-top-search__poster"
                      onError={(event) => {
                        event.target.onerror = null
                        event.target.src = '/placeholder-poster.jpg'
                      }}
                    />

                    <span className="profile-top-search__info">
                      <span className="profile-top-search__title">
                        {getFilmTitle(film)}
                      </span>

                      <span className="profile-top-search__meta">
                        {film.year || '—'}
                      </span>
                    </span>

                    <span className="profile-top-search__add">
                      {alreadySelected ? '✓' : '+'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="profile-top__loading">
          Загрузка топа...
        </div>
      ) : (
        <div className="profile-top-list">
          {items.map((item, index) => (
            <div key={item.id} className="profile-top-row">
              <button
                type="button"
                className="profile-top-row__main"
                onClick={() => navigate(`/film/${item.film.id}`)}
              >
                <span className="profile-top-row__position">
                  #{index + 1}
                </span>

                <img
                  src={getFilmPoster(item.film)}
                  alt={getFilmTitle(item.film)}
                  className="profile-top-row__poster"
                  onError={(event) => {
                    event.target.onerror = null
                    event.target.src = '/placeholder-poster.jpg'
                  }}
                />

                <span className="profile-top-row__info">
                  <span className="profile-top-row__title">
                    {getFilmTitle(item.film)}
                  </span>

                  <span className="profile-top-row__meta">
                    {item.film.year || '—'}
                    {item.film.kinopoisk_rating ? ` • KP ${Number(item.film.kinopoisk_rating).toFixed(1)}` : ''}
                    {item.film.imdb_rating ? ` • IMDb ${Number(item.film.imdb_rating).toFixed(1)}` : ''}
                  </span>
                </span>
              </button>

              {isOwner && (
                <div className="profile-top-row__actions">
                  <button
                    type="button"
                    className="profile-top-row__action"
                    onClick={() => handleMoveFilm(index, -1)}
                    disabled={index === 0 || saving}
                    title="Поднять выше"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    className="profile-top-row__action"
                    onClick={() => handleMoveFilm(index, 1)}
                    disabled={index === items.length - 1 || saving}
                    title="Опустить ниже"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    className="profile-top-row__action profile-top-row__action--delete"
                    onClick={() => handleRemoveFilm(item.film.id)}
                    disabled={saving}
                    title="Удалить из топа"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}

          {Array.from({ length: emptySlotsCount }).map((_, index) => (
            <div key={`empty-${index}`} className="profile-top-row profile-top-row--empty">
              <span className="profile-top-row__position">
                #{items.length + index + 1}
              </span>

              <span className="profile-top-row__empty-text">
                {isOwner ? 'Свободное место' : 'Место пока пустое'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default ProfileTopFilms