// src/pages/FilmPage/components/FilmActions.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import {
  rateFilm,
  addToWatchlist,
  markAsWatched
} from '../../../api/activities'
import {
  getMyCompilations,
  patchCompilation
} from '../../../api/compilations'

const normalizeCompilations = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

const getCompilationFilmIds = (compilation) => {
  if (Array.isArray(compilation?.films)) {
    return compilation.films
      .map((film) => {
        if (typeof film === 'object' && film !== null) {
          return Number(film.id)
        }

        return Number(film)
      })
      .filter(Boolean)
  }

  if (Array.isArray(compilation?.film_ids)) {
    return compilation.film_ids
      .map((id) => Number(id))
      .filter(Boolean)
  }

  return []
}

function FilmActions({ filmId, activity }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [localActivity, setLocalActivity] = useState(activity)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isWatched, setIsWatched] = useState(false)
  const [isPlanned, setIsPlanned] = useState(false)
  const [loading, setLoading] = useState(false)

  const [isCompilationModalOpen, setIsCompilationModalOpen] = useState(false)
  const [compilations, setCompilations] = useState([])
  const [selectedCompilationIds, setSelectedCompilationIds] = useState([])
  const [compilationsLoading, setCompilationsLoading] = useState(false)
  const [compilationsSaving, setCompilationsSaving] = useState(false)
  const [compilationsError, setCompilationsError] = useState('')

  useEffect(() => {
    setLocalActivity(activity)

    if (activity) {
      setUserRating(activity.current_user_rating || activity.rating || 0)
      setIsWatched(activity.is_watched || false)
      setIsPlanned(activity.is_planned || false)
    } else {
      setUserRating(0)
      setIsWatched(false)
      setIsPlanned(false)
    }
  }, [activity])

  const handleRate = async (rating) => {
    if (!user) {
      navigate('/login')
      return
    }

    const previousRating = userRating

    try {
      setLoading(true)
      setUserRating(rating)

      const updatedActivity = await rateFilm(filmId, rating, localActivity)

      if (updatedActivity) {
        setLocalActivity(updatedActivity)
        setUserRating(
          updatedActivity.current_user_rating ||
          updatedActivity.rating ||
          rating
        )
        setIsWatched(updatedActivity.is_watched || false)
        setIsPlanned(updatedActivity.is_planned || false)
      }
    } catch (error) {
      console.error('Error rating film:', error)
      setUserRating(previousRating)
    } finally {
      setLoading(false)
    }
  }

  const handleWatched = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    const previousWatched = isWatched

    try {
      setLoading(true)

      const newWatchedState = !isWatched
      setIsWatched(newWatchedState)

      const updatedActivity = await markAsWatched(
        filmId,
        localActivity,
        newWatchedState
      )

      if (updatedActivity) {
        setLocalActivity(updatedActivity)
        setIsWatched(updatedActivity.is_watched || false)
        setIsPlanned(updatedActivity.is_planned || false)
        setUserRating(
          updatedActivity.current_user_rating ||
          updatedActivity.rating ||
          userRating
        )
      }
    } catch (error) {
      console.error('Error marking as watched:', error)
      setIsWatched(previousWatched)
    } finally {
      setLoading(false)
    }
  }

  const handleWatchlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    const previousPlanned = isPlanned

    try {
      setLoading(true)

      const newIsPlanned = !isPlanned
      setIsPlanned(newIsPlanned)

      const updatedActivity = await addToWatchlist(
        filmId,
        localActivity,
        newIsPlanned
      )

      if (updatedActivity) {
        setLocalActivity(updatedActivity)
        setIsWatched(updatedActivity.is_watched || false)
        setIsPlanned(updatedActivity.is_planned || false)
        setUserRating(
          updatedActivity.current_user_rating ||
          updatedActivity.rating ||
          userRating
        )
      }
    } catch (error) {
      console.error('Error updating watchlist:', error)
      setIsPlanned(previousPlanned)
    } finally {
      setLoading(false)
    }
  }

  const openCompilationModal = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setIsCompilationModalOpen(true)
      setCompilationsLoading(true)
      setCompilationsError('')

      const data = await getMyCompilations()
      const compilationsList = normalizeCompilations(data)

      setCompilations(compilationsList)

      const currentFilmId = Number(filmId)
      const selectedIds = compilationsList
        .filter((compilation) => (
          getCompilationFilmIds(compilation).includes(currentFilmId)
        ))
        .map((compilation) => compilation.id)

      setSelectedCompilationIds(selectedIds)
    } catch (error) {
      console.error('Error loading compilations:', error)
      setCompilationsError('Не удалось загрузить подборки')
    } finally {
      setCompilationsLoading(false)
    }
  }

  const closeCompilationModal = () => {
    if (compilationsSaving) return

    setIsCompilationModalOpen(false)
    setCompilationsError('')
  }

  const toggleCompilationSelection = (compilationId) => {
    setSelectedCompilationIds((prev) => {
      if (prev.includes(compilationId)) {
        return prev.filter((id) => id !== compilationId)
      }

      return [...prev, compilationId]
    })
  }

  const saveCompilationSelection = async () => {
    try {
      setCompilationsSaving(true)
      setCompilationsError('')

      const currentFilmId = Number(filmId)
      const selectedIdsSet = new Set(
        selectedCompilationIds.map((id) => Number(id))
      )

      const requests = compilations
        .map((compilation) => {
          const compilationId = Number(compilation.id)
          const currentFilmIds = getCompilationFilmIds(compilation)
          const hasFilm = currentFilmIds.includes(currentFilmId)
          const shouldHaveFilm = selectedIdsSet.has(compilationId)

          if (hasFilm === shouldHaveFilm) {
            return null
          }

          const nextFilmIds = shouldHaveFilm
            ? [...new Set([...currentFilmIds, currentFilmId])]
            : currentFilmIds.filter((id) => id !== currentFilmId)

          return patchCompilation(compilation.id, {
            films: nextFilmIds,
          })
        })
        .filter(Boolean)

      if (requests.length > 0) {
        await Promise.all(requests)
      }

      setIsCompilationModalOpen(false)
    } catch (error) {
      console.error('Error saving film compilations:', error)
      setCompilationsError('Не удалось сохранить изменения')
    } finally {
      setCompilationsSaving(false)
    }
  }

  return (
    <div className="film-actions">
      <div className="rating-section">
        <div className="rating-label">Ваша оценка:</div>

        <div className="rating-stars">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${userRating >= star ? 'active' : ''} ${hoverRating >= star ? 'hover' : ''}`}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={loading}
            >
              ★
            </button>
          ))}
        </div>

        {userRating > 0 && (
          <span className="current-rating">{userRating}/10</span>
        )}
      </div>

      <div className="action-buttons">
        <button
          type="button"
          className={`action-btn action-btn--watched ${isWatched ? 'active' : ''}`}
          onClick={handleWatched}
          disabled={loading}
        >
          <span className="action-icon">{isWatched ? '✓✓' : '✓'}</span>
          {isWatched ? 'Просмотрено' : 'Отметить просмотренным'}
        </button>

        <button
          type="button"
          className={`action-btn action-btn--planned ${isPlanned ? 'active' : ''}`}
          onClick={handleWatchlist}
          disabled={loading}
        >
          <span className="action-icon">{isPlanned ? '📌' : '📋'}</span>
          {isPlanned ? 'В списке к просмотру' : 'Буду смотреть'}
        </button>

        <button
          type="button"
          className="action-btn action-btn--collection"
          onClick={openCompilationModal}
          disabled={loading}
        >
          <span className="action-icon">＋</span>
          В подборку
        </button>
      </div>

      {isCompilationModalOpen && (
        <div
          className="compilation-picker"
          role="presentation"
          onClick={closeCompilationModal}
        >
          <div
            className="compilation-picker__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compilation-picker-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="compilation-picker__head">
              <div>
                <h3
                  id="compilation-picker-title"
                  className="compilation-picker__title"
                >
                  Добавить в подборки
                </h3>

                <p className="compilation-picker__text">
                  Выбери одну или несколько подборок для этого фильма.
                </p>
              </div>

              <button
                type="button"
                className="compilation-picker__close"
                onClick={closeCompilationModal}
                disabled={compilationsSaving}
              >
                ×
              </button>
            </div>

            <div className="compilation-picker__body">
              {compilationsLoading ? (
                <div className="compilation-picker__state">
                  Загрузка подборок...
                </div>
              ) : compilations.length > 0 ? (
                <div className="compilation-picker__list">
                  {compilations.map((compilation) => {
                    const isChecked = selectedCompilationIds.includes(
                      compilation.id
                    )

                    return (
                      <label
                        key={compilation.id}
                        className={`compilation-picker__row ${
                          isChecked ? 'compilation-picker__row--active' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCompilationSelection(compilation.id)}
                          disabled={compilationsSaving}
                        />

                        <span className="compilation-picker__check">
                          {isChecked ? '✓' : ''}
                        </span>

                        <span className="compilation-picker__info">
                          <span className="compilation-picker__name">
                            {compilation.title || 'Без названия'}
                          </span>

                          <span className="compilation-picker__meta">
                            Фильмов: {
                              compilation.films_count ??
                              getCompilationFilmIds(compilation).length
                            }
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="compilation-picker__state">
                  Подборок пока нет. Создай подборку на странице подборок.
                </div>
              )}

              {compilationsError && (
                <p className="compilation-picker__error">
                  {compilationsError}
                </p>
              )}
            </div>

            <div className="compilation-picker__actions">
              <button
                type="button"
                className="compilation-picker__btn compilation-picker__btn--ghost"
                onClick={closeCompilationModal}
                disabled={compilationsSaving}
              >
                Отмена
              </button>

              <button
                type="button"
                className="compilation-picker__btn compilation-picker__btn--save"
                onClick={saveCompilationSelection}
                disabled={compilationsLoading || compilationsSaving}
              >
                {compilationsSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilmActions