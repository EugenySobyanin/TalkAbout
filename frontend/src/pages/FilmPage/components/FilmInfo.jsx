function FilmInfo({ film }) {
  return (
    <section className="film-info-section">
      <div className="film-section-head">
        <div>
          <h2>О фильме</h2>
          <p>Описание и основные детали</p>
        </div>
      </div>

      {film.slogan && (
        <div className="film-slogan">
          «{film.slogan}»
        </div>
      )}

      {film.description && (
        <div className="film-description">
          <h3>Описание</h3>
          <p className="description-text">
            {film.description}
          </p>
        </div>
      )}

      <div className="film-details">
        <h3>Детали</h3>

        <div className="details-grid">
          {film.formatted_budget && (
            <div className="detail-item">
              <span className="detail-label">Бюджет</span>
              <span className="detail-value">{film.formatted_budget}</span>
            </div>
          )}

          {film.type && (
            <div className="detail-item">
              <span className="detail-label">Тип</span>
              <span className="detail-value">{film.type.name}</span>
            </div>
          )}

          {film.formatted_duration && (
            <div className="detail-item">
              <span className="detail-label">Длительность</span>
              <span className="detail-value">{film.formatted_duration}</span>
            </div>
          )}

          {film.age_rating && (
            <div className="detail-item">
              <span className="detail-label">Возраст</span>
              <span className="detail-value">{film.age_rating}+</span>
            </div>
          )}

          {film.rating_mpaa && (
            <div className="detail-item">
              <span className="detail-label">MPAA</span>
              <span className="detail-value">{film.rating_mpaa}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FilmInfo