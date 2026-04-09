// src/pages/FilmPage/components/FilmActions.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { getUserFilmActivity, rateFilm, addToWatchlist, markAsWatched } from '../../../api/activities'

function FilmActions({ filmId }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isWatched, setIsWatched] = useState(false)
  const [isPlanned, setIsPlanned] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserActivity()
    }
  }, [user, filmId])

  const loadUserActivity = async () => {
    try {
      const activity = await getUserFilmActivity(filmId)
      if (activity) {
        setUserRating(activity.rating || 0)
        setIsWatched(activity.is_watched || false)
        setIsPlanned(activity.is_planned || false)
      }
    } catch (error) {
      console.error('Error loading user activity:', error)
    }
  }

  const handleRate = async (rating) => {
    if (!user) {
      navigate('/login')
      return
    }
    
    try {
      setLoading(true)
      setUserRating(rating)
      await rateFilm(filmId, rating)
    } catch (error) {
      console.error('Error rating film:', error)
      setUserRating(0)
    } finally {
      setLoading(false)
    }
  }

  const handleWatched = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    try {
      setLoading(true)
      setIsWatched(!isWatched)
      if (!isWatched) {
        setIsPlanned(false)
      }
      await markAsWatched(filmId)
    } catch (error) {
      console.error('Error marking as watched:', error)
      setIsWatched(!isWatched)
    } finally {
      setLoading(false)
    }
  }

  const handleWatchlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    try {
      setLoading(true)
      setIsPlanned(!isPlanned)
      if (!isPlanned) {
        setIsWatched(false)
      }
      await addToWatchlist(filmId)
    } catch (error) {
      console.error('Error updating watchlist:', error)
      setIsPlanned(!isPlanned)
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
          className={`action-btn ${isWatched ? 'active' : ''}`}
          onClick={handleWatched}
          disabled={loading}
        >
          <span className="action-icon">{isWatched ? '✓✓' : '✓'}</span>
          {isWatched ? 'Просмотрено' : 'Отметить просмотренным'}
        </button>
        
        <button 
          className={`action-btn ${isPlanned ? 'active' : ''}`}
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