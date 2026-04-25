import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const getFilmPoster = (film) => {
  return (
    film?.poster_preview_url ||
    film?.poster_url ||
    film?.poster ||
    film?.logo_preview_url ||
    '/placeholder-poster.jpg'
  )
}

function ProfileFilmsTable({
  title,
  items = [],
  emptyText = 'Список пуст',
  mode = 'watched',
}) {
  const navigate = useNavigate()
  const [visibleCount, setVisibleCount] = useState(7)

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  )

  const canShowMore = items.length > visibleCount

  const getStatusLabel = (item) => {
    if (mode === 'watched') {
      return item.rating ? `${item.rating}/10` : '—'
    }

    return item.rating ? `${item.rating}/10` : '—'
  }

  return (
    <section className="profile-table-block">
      <div className="profile-block__head">
        <div>
          <h2 className="profile-block__title">{title}</h2>
          <p className="profile-block__count">Всего: {items.length}</p>
        </div>

        {canShowMore && (
          <button
            type="button"
            className="profile-block__btn"
            onClick={() => setVisibleCount((prev) => prev + 7)}
          >
            Показать ещё
          </button>
        )}
      </div>

      {visibleItems.length > 0 ? (
        <div className="profile-table">
          <div className="profile-table__head-row">
            <div>Фильм</div>
            <div>Год</div>
            <div>Оценка</div>
          </div>

          <div className="profile-table__body">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="profile-table__row profile-table__row--clickable"
                onClick={() => navigate(`/film/${item.film.id}`)}
              >
                <div className="profile-table__film">
                  <img
                    src={getFilmPoster(item.film)}
                    alt={item.film.name}
                    className="profile-table__poster"
                    onError={(event) => {
                      event.target.onerror = null
                      event.target.src = '/placeholder-poster.jpg'
                    }}
                  />

                  <span className="profile-table__film-name">
                    {item.film.name || item.film.alternative_name || 'Без названия'}
                  </span>
                </div>

                <div className="profile-table__year">
                  {item.film.year || '—'}
                </div>

                <div className="profile-table__rating">
                  {getStatusLabel(item)}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="profile-table-block__empty">{emptyText}</p>
      )}
    </section>
  )
}

export default ProfileFilmsTable