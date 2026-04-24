import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProfileCompilationsTable({
  items = [],
  emptyText = 'Подборок пока нет',
}) {
  const navigate = useNavigate()
  const [visibleCount, setVisibleCount] = useState(7)
  const [openedIds, setOpenedIds] = useState([])

  const visibleItems = items.slice(0, visibleCount)
  const canShowMore = items.length > visibleCount

  const toggleCompilation = (id) => {
    setOpenedIds((prev) => (
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    ))
  }

  return (
    <section className="profile-table-block">
      <div className="profile-table-block__head">
        <div>
          <h2 className="profile-table-block__title">Подборки</h2>
          <p className="profile-table-block__count">Всего: {items.length}</p>
        </div>

        {canShowMore && (
          <button
            type="button"
            className="profile-table-block__btn"
            onClick={() => setVisibleCount((prev) => prev + 7)}
          >
            Показать ещё
          </button>
        )}
      </div>

      {visibleItems.length > 0 ? (
        <div className="profile-table">
          <div className="profile-table__head-row profile-table__head-row--compilation">
            <div>Название</div>
            <div>Описание</div>
            <div>Фильмов</div>
            <div />
          </div>

          <div className="profile-table__body">
            {visibleItems.map((item) => {
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
                            onClick={() => navigate(`/films/${film.id}`)}
                          >
                            <div className="profile-compilation__film-main">
                              <div className="profile-compilation__film-logo-wrap">
                                {film.logo_preview_url ? (
                                  <img
                                    src={film.logo_preview_url}
                                    alt={film.name}
                                    className="profile-compilation__film-logo"
                                  />
                                ) : (
                                  <div className="profile-compilation__film-logo-placeholder">
                                    {film.name?.slice(0, 1) || 'F'}
                                  </div>
                                )}
                              </div>

                              <span className="profile-compilation__film-name">
                                {film.name}
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