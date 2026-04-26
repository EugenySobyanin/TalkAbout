import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'

const STAT_ITEMS = [
  {
    key: 'positive',
    label: 'Положительные',
  },
  {
    key: 'neutral',
    label: 'Нейтральные',
  },
  {
    key: 'negative',
    label: 'Отрицательные',
  },
]

function FilmReviewsPreview({
  film,
  onReviewCreated,
}) {
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)

  const reviews = film.latest_reviews || []
  const stats = film.reviews_stats || {}

  const handleSuccess = async () => {
    setFormOpen(false)

    if (onReviewCreated) {
      await onReviewCreated()
    }
  }

  return (
    <section className="film-reviews-section">
      <div className="film-section-head film-section-head--reviews">
        <div>
          <h2>Рецензии</h2>
          <p>
            Последние отзывы зрителей о фильме
          </p>
        </div>

        <div className="film-section-head__actions">
          <button
            type="button"
            className="film-section-btn"
            onClick={() => setFormOpen((prev) => !prev)}
          >
            {formOpen ? 'Скрыть форму' : 'Написать рецензию'}
          </button>

          <button
            type="button"
            className="film-section-btn"
            onClick={() => navigate(`/film/${film.id}/reviews`)}
          >
            Читать все
          </button>
        </div>
      </div>

      <div className="film-review-stats-inline">
        <div className="film-review-stats-inline__total">
          Всего: <strong>{stats.total || 0}</strong>
        </div>

        {STAT_ITEMS.map((item) => (
          <div key={item.key} className={`film-review-stats-inline__item film-review-stats-inline__item--${item.key}`}>
            <span>{item.label}</span>
            <strong>{stats[item.key]?.count || 0}</strong>
            <small>{stats[item.key]?.percent || 0}%</small>
          </div>
        ))}
      </div>

      {formOpen && (
        <ReviewForm
          filmId={film.id}
          onSuccess={handleSuccess}
        />
      )}

      {reviews.length > 0 ? (
        <div className="film-reviews-list">
          {reviews.slice(0, 7).map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              compact
            />
          ))}
        </div>
      ) : (
        <div className="film-empty-block">
          Рецензий пока нет. Будьте первым, кто напишет мнение о фильме.
        </div>
      )}
    </section>
  )
}

export default FilmReviewsPreview