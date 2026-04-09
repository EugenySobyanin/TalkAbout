// src/pages/FilmPage/components/FilmHeader.jsx

function FilmHeader({ film }) {
  return (
    <div className="film-header">
      {/* Фоновое изображение */}
      {film.backdrop_url && (
        <div 
          className="film-backdrop"
          style={{ backgroundImage: `url(${film.backdrop_url})` }}
        >
          <div className="backdrop-overlay"></div>
        </div>
      )}
      
      <div className="film-header-content">
        {/* Постер */}
        <div className="film-poster-wrapper">
          {film.poster_url ? (
            <img 
              src={film.poster_url} 
              alt={film.name}
              className="film-poster"
            />
          ) : (
            <div className="film-poster-placeholder">📽️</div>
          )}
        </div>
        
        {/* Основная информация */}
        <div className="film-title-section">
          <h1 className="film-title">
            {film.name || film.alternative_name}
            {film.year && <span className="film-year"> ({film.year})</span>}
          </h1>
          
          {film.alternative_name && film.alternative_name !== film.name && (
            <div className="film-alternative-name">
              {film.alternative_name}
            </div>
          )}
          
          {film.en_name && film.en_name !== film.name && (
            <div className="film-en-name">{film.en_name}</div>
          )}
          
          <div className="film-meta">
            {film.formatted_duration && (
              <span className="meta-item">🕐 {film.formatted_duration}</span>
            )}
            {film.age_rating && (
              <span className="meta-item age-rating">{film.age_rating}+</span>
            )}
            {film.rating_mpaa && (
              <span className="meta-item">{film.rating_mpaa}</span>
            )}
          </div>
          
          {/* Жанры */}
          {film.genres && film.genres.length > 0 && (
            <div className="film-genres">
              {film.genres.map(genre => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Страны */}
          {film.countries && film.countries.length > 0 && (
            <div className="film-countries">
              {film.countries.map(country => (
                <span key={country.id} className="country-item">
                  {country.name}
                </span>
              ))}
            </div>
          )}
          
          {/* Рейтинги */}
          <div className="film-ratings">
            {film.kinopoisk_rating && (
              <div className="rating-item kp">
                <span className="rating-label">Кинопоиск</span>
                <span className="rating-value">{film.kinopoisk_rating.toFixed(1)}</span>
              </div>
            )}
            {film.imdb_rating && (
              <div className="rating-item imdb">
                <span className="rating-label">IMDb</span>
                <span className="rating-value">{film.imdb_rating.toFixed(1)}</span>
              </div>
            )}
            {film.user_rating && (
              <div className="rating-item user">
                <span className="rating-label">Пользователи</span>
                <span className="rating-value">{film.user_rating}</span>
                {film.rating_votes_count > 0 && (
                  <span className="rating-votes">({film.rating_votes_count})</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilmHeader