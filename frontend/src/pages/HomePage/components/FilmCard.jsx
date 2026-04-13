import { useNavigate } from 'react-router-dom'
import './FilmCard.css'

const DEFAULT_POSTER = '/placeholder-poster.jpg'

function FilmCard({ film }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    navigate(`/film/${film.id}`)
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
  
  const genres = film.genres || []
  
  return (
    <div 
      className="film-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="film-poster">
        <img 
          src={film.poster || DEFAULT_POSTER}
          alt={film.name || 'Постер'}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = DEFAULT_POSTER
          }}
        />
        {film.kinopoisk_rating && (
          <span className="film-rating">{film.kinopoisk_rating.toFixed(1)}</span>
        )}
      </div>
      
      <div className="film-info">
        <h3 className="film-title">
          {film.name || film.alternative_name || film.en_name || 'Без названия'}
        </h3>
        <span className="film-year">{film.year || '—'}</span>
        {genres.length > 0 && (
          <div className="film-genres">
            {genres.slice(0, 2).map((genre, idx) => (
              <span key={genre.id || idx} className="genre-tag">{genre.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FilmCard