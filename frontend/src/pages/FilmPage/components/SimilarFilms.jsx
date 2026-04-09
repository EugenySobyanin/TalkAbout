// src/pages/FilmPage/components/SimilarFilms.jsx

import { Link } from 'react-router-dom'

function SimilarFilms({ similarFilms }) {
  // Если нет данных
  if (!similarFilms || similarFilms.length === 0) {
    return null
  }

  return (
    <div className="similar-films-section">
      <h2>Похожие фильмы</h2>
      
      <div className="similar-films-list">
        {similarFilms.slice(0, 8).map(item => {
          const film = item.similar_film
          
          return (
            <Link 
              key={item.id} 
              to={`/film/${film.id}`}
              className="similar-film-card"
            >
              <div className="similar-film-poster">
                {film.poster_url ? (
                  <img 
                    src={film.poster_url} 
                    alt={film.name || film.alternative_name}
                    onError={(e) => {
                      e.target.src = '/placeholder-poster.jpg'
                    }}
                  />
                ) : (
                  <div className="no-poster">📽️</div>
                )}
              </div>
              
              <div className="similar-film-info">
                <div className="similar-film-name">
                  {film.name || film.alternative_name || 'Без названия'}
                </div>
                
                <div className="similar-film-meta">
                  {film.year && (
                    <span className="similar-film-year">{film.year}</span>
                  )}
                  {film.movie_length && (
                    <span className="similar-film-duration">
                      {Math.floor(film.movie_length / 60)}ч {film.movie_length % 60}мин
                    </span>
                  )}
                </div>
                
                <div className="similar-film-ratings">
                  {film.kinopoisk_rating && (
                    <span className="rating kp" title="Кинопоиск">
                      🎬 {film.kinopoisk_rating.toFixed(1)}
                    </span>
                  )}
                  {film.imdb_rating && (
                    <span className="rating imdb" title="IMDb">
                      ⭐ {film.imdb_rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      
      {similarFilms.length > 8 && (
        <button className="show-more-films-btn">
          Показать ещё ({similarFilms.length - 8})
        </button>
      )}
    </div>
  )
}

export default SimilarFilms