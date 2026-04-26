import { useState } from 'react'
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

function ProfileCompilationsTable({
  items = [],
  emptyText = 'Подборок пока нет',
}) {
  const navigate = useNavigate()
  const [openedIds, setOpenedIds] = useState([])

  const toggleCompilation = (id) => {
    setOpenedIds((prev) => (
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    ))
  }

  return (
    <section className="profile-table-block">
      <div className="profile-block__head">
        <div>
          <h2 className="profile-block__title">Подборки</h2>
          <p className="profile-block__count">Всего: {items.length}</p>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="profile-table">
          <div className="profile-table__head-row profile-table__head-row--compilation">
            <div>Название</div>
            <div>Описание</div>
            <div>Фильмов</div>
            <div />
          </div>

          <div className="profile-table__body profile-table__body--scroll profile-table__body--compilations-scroll">
            {items.map((item) => {
              const isOpen = openedIds.includes(item.id)

              return (
                <div key={item.id} className="profile-compilation">
                  <div className="profile-table__row profile-table__row--compilation">
                    <div className="profile-compilation__title-wrap">
                      <span className="profile-compilation__title">
                        {item.title || 'Без названия'}
                      </span>
                    </div>

                    <div className="profile-compilation__description">
                      {item.description || '—'}
                    </div>

                    <div className="profile-compilation__count">
                      {item.films_count ?? item.films?.length ?? 0}
                    </div>

                    <div className="profile-compilation__action">
                      <button
                        type="button"
                        className="profile-compilation__toggle"
                        onClick={() => toggleCompilation(item.id)}
                      >
                        {isOpen ? 'Скрыть' : 'Раскрыть'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="profile-compilation__films">
                      {Array.isArray(item.films) && item.films.length > 0 ? (
                        item.films.map((film) => (
                          <button
                            key={film.id}
                            type="button"
                            className="profile-compilation__film-row"
                            onClick={() => navigate(`/film/${film.id}`)}
                          >
                            <div className="profile-compilation__film-main">
                              <img
                                src={getFilmPoster(film)}
                                alt={film.name}
                                className="profile-compilation__poster"
                                onError={(event) => {
                                  event.target.onerror = null
                                  event.target.src = '/placeholder-poster.jpg'
                                }}
                              />

                              <span className="profile-compilation__film-name">
                                {film.name || film.alternative_name || 'Без названия'}
                              </span>
                            </div>

                            <span className="profile-compilation__film-year">
                              {film.year || '—'}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="profile-table-block__empty">
                          В подборке пока нет фильмов
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="profile-table-block__empty">{emptyText}</p>
      )}
    </section>
  )
}

export default ProfileCompilationsTable