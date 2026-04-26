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

  const getStatusLabel = (item) => {
    return item.rating ? `${item.rating}/10` : '—'
  }

  return (
    <section className={`profile-table-block profile-table-block--${mode}`}>
      <div className="profile-block__head">
        <div>
          <h2 className="profile-block__title">{title}</h2>
          <p className="profile-block__count">Всего: {items.length}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="profile-table">
          <div className="profile-table__head-row">
            <div>Фильм</div>
            <div>Год</div>
            <div>Оценка</div>
          </div>

          <div className="profile-table__body profile-table__body--scroll">
            {items.map((item) => (
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