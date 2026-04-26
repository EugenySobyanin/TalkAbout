// src/pages/FilmPage/components/FilmActions.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import {
  rateFilm,
  addToWatchlist,
  markAsWatched
} from '../../../api/activities'

function FilmActions({ filmId, activity }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [localActivity, setLocalActivity] = useState(activity)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isWatched, setIsWatched] = useState(false)
  const [isPlanned, setIsPlanned] = useState(false)
  const [loading, setLoading] = useState(false)

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
      </div>
    </div>
  )
}

export default FilmActions