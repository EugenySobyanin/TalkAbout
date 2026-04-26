function getFilmBackdrop(film) {
  return (
    film.backdrop_url ||
    film.backdrop ||
    film.backdrop_preview_url ||
    film.poster_url ||
    ''
  )
}

function FilmHeader({ film }) {
  const backdropUrl = getFilmBackdrop(film)

  return (
    <div className="film-header">
      {backdropUrl && (
        <div
          className="film-backdrop"
          style={{ backgroundImage: `url("${backdropUrl}")` }}
        >
          <div className="backdrop-overlay" />
        </div>
      )}

      <div className="film-header-content">
        <div className="film-poster-wrapper">
          {film.poster_url ? (
            <img
              src={film.poster_url}
              alt={film.name || film.alternative_name}
              className="film-poster"
            />
          ) : (
            <div className="film-poster-placeholder">📽️</div>
          )}
        </div>

        <div className="film-title-section">
          <h1 className="film-title">
            {film.name || film.alternative_name}
          </h1>

          {film.year && (
            <div className="film-year">
              {film.year}
            </div>
          )}

          {film.alternative_name && film.alternative_name !== film.name && (
            <div className="film-alternative-name">
              {film.alternative_name}
            </div>
          )}

          {film.en_name && film.en_name !== film.name && film.en_name !== film.alternative_name && (
            <div className="film-en-name">
              {film.en_name}
            </div>
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

          {film.genres && film.genres.length > 0 && (
            <div className="film-genres-section">
              <span className="genres-label">Жанр:</span>
              <div className="film-genres">
                {film.genres.map((genre, index) => (
                  <span key={genre.id}>
                    <span className="genre-text">{genre.name}</span>
                    {index < film.genres.length - 1 && (
                      <span className="genre-separator">, </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {film.countries && film.countries.length > 0 && (
            <div className="film-countries-section">
              <span className="countries-label">Страна:</span>
              <div className="film-countries">
                {film.countries.map((country, index) => (
                  <span key={country.id}>
                    <span className="country-text">{country.name}</span>
                    {index < film.countries.length - 1 && (
                      <span className="country-separator">, </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {film.short_description && (
            <div className="film-short-description">
              {film.short_description}
            </div>
          )}

          <div className="film-ratings">
            {film.kinopoisk_rating && (
              <div className="rating-item kp">
                <span className="rating-label">Кинопоиск</span>
                <span className="rating-value">
                  {Number(film.kinopoisk_rating).toFixed(1)}
                </span>
              </div>
            )}

            {film.imdb_rating && (
              <div className="rating-item imdb">
                <span className="rating-label">IMDb</span>
                <span className="rating-value">
                  {Number(film.imdb_rating).toFixed(1)}
                </span>
              </div>
            )}

            {film.user_rating && (
              <div className="rating-item user">
                <span className="rating-label">FR-25</span>
                <span className="rating-value">{film.user_rating}</span>

                {film.rating_votes_count > 0 && (
                  <span className="rating-votes">
                    ({film.rating_votes_count})
                  </span>
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