import { useNavigate } from 'react-router-dom'
import './FilmCard.css'

const DEFAULT_POSTER = '/placeholder-poster.jpg'

function formatRating(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return null
  }

  return numericValue.toFixed(1)
}

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

  const title = film.name || film.alternative_name || film.en_name || 'Без названия'
  const genres = film.genres || []

  const ratings = [
    {
      label: 'KP',
      value: formatRating(film.kinopoisk_rating),
      className: 'film-card__rating-chip--kp',
    },
    {
      label: 'IMDb',
      value: formatRating(film.imdb_rating),
      className: 'film-card__rating-chip--imdb',
    },
    {
      label: 'FR-25',
      value: formatRating(film.rating),
      className: 'film-card__rating-chip--fr',
    },
  ].filter((rating) => rating.value)

  return (
    <div
      className="film-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="film-card__poster">
        <img
          src={film.poster_url || film.poster || DEFAULT_POSTER}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = DEFAULT_POSTER
          }}
        />

        {ratings.length > 0 && (
          <div className="film-card__ratings" aria-label="Рейтинги фильма">
            {ratings.map((rating) => (
              <span
                key={rating.label}
                className={`film-card__rating-chip ${rating.className}`}
              >
                <span className="film-card__rating-label">
                  {rating.label}
                </span>

                <span className="film-card__rating-value">
                  {rating.value}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="film-card__info">
        <h3 className="film-card__title">{title}</h3>

        <div className="film-card__meta">
          <span className="film-card__year">{film.year || '—'}</span>

          {genres.length > 0 && (
            <div className="film-card__genres">
              {genres.slice(0, 2).map((genre, idx) => (
                <span key={genre.id || idx} className="film-card__genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilmCard