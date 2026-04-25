// src/components/FilmsGridSection/FilmsGridSection.jsx

import FilmCard from '../FilmCard/FilmCard'
import './FilmsGridSection.css'

function FilmsGridSection({
  title,
  subtitle,
  films = [],
  loading = false,
  emptyText = 'Ничего не найдено',
  hasMore = false,
  loadingMore = false,
  onLoadMore = null,
  showHeader = true,
  count = null,
}) {
  if (loading) {
    return <div className="films-section__loading">Загрузка...</div>
  }

  return (
    <section className="films-section">
      {showHeader && (title || subtitle || typeof count === 'number') && (
        <div className="films-section__head">
          {title && <h1 className="films-section__title">{title}</h1>}
          {subtitle && <p className="films-section__subtitle">{subtitle}</p>}
          {typeof count === 'number' && (
            <p className="films-section__count">Найдено: {count}</p>
          )}
        </div>
      )}

      {films.length > 0 ? (
        <>
          <div className="films-section__grid">
            {films.map((film) => (
              <FilmCard key={film.id} film={film} />
            ))}
          </div>

          {hasMore && onLoadMore && (
            <button
              className="films-section__load-more"
              onClick={onLoadMore}
              disabled={loadingMore}
              type="button"
            >
              {loadingMore ? 'Загрузка...' : 'Показать ещё'}
            </button>
          )}
        </>
      ) : (
        <div className="films-section__empty">{emptyText}</div>
      )}
    </section>
  )
}

export default FilmsGridSection