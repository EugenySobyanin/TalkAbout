import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFilmDetails } from '../../api/films'
import { getFilmReviews } from '../../api/reviews'
import ReviewCard from '../FilmPage/components/ReviewCard'
import ReviewForm from '../FilmPage/components/ReviewForm'
import '../FilmPage/FilmPage.css'
import './FilmReviewsPage.css'

const LONG_REVIEW_LIMIT = 520

const FILTERS = [
  {
    value: '',
    label: 'Все',
  },
  {
    value: 'positive',
    label: 'Положительные',
  },
  {
    value: 'neutral',
    label: 'Нейтральные',
  },
  {
    value: 'negative',
    label: 'Отрицательные',
  },
]

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

function FilmReviewsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const sentinelRef = useRef(null)

  const [film, setFilm] = useState(null)
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [expandedReviewIds, setExpandedReviewIds] = useState([])

  const loadFilm = async () => {
    const filmData = await getFilmDetails(id)

    setFilm(filmData)
    setStats(filmData.reviews_stats || null)
  }

  const loadReviews = async ({
    targetPage = 1,
    replace = false,
  } = {}) => {
    const data = await getFilmReviews({
      filmId: id,
      page: targetPage,
      reviewType: filter,
    })

    setReviews((prev) => (
      replace ? data.results : [...prev, ...data.results]
    ))

    setPage(targetPage)
    setHasNext(Boolean(data.next))

    if (data.stats) {
      setStats(data.stats)
    }
  }

  const loadInitial = async () => {
    try {
      setLoading(true)
      setExpandedReviewIds([])

      await Promise.all([
        loadFilm(),
        loadReviews({
          targetPage: 1,
          replace: true,
        }),
      ])
    } catch (error) {
      console.error('Film reviews page load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = useCallback(async () => {
    if (!hasNext || loadingMore || loading) return

    try {
      setLoadingMore(true)

      await loadReviews({
        targetPage: page + 1,
        replace: false,
      })
    } catch (error) {
      console.error('Reviews load more error:', error)
    } finally {
      setLoadingMore(false)
    }
  }, [hasNext, loadingMore, loading, page, id, filter])

  useEffect(() => {
    window.scrollTo(0, 0)
    loadInitial()
  }, [id, filter])

  useEffect(() => {
    const node = sentinelRef.current

    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0]

        if (firstEntry.isIntersecting) {
          loadMore()
        }
      },
      {
        rootMargin: '260px',
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [loadMore])

  const handleReviewCreated = async () => {
    setFormOpen(false)

    await loadFilm()
    await loadReviews({
      targetPage: 1,
      replace: true,
    })
  }

  const toggleReviewExpanded = (reviewId) => {
    setExpandedReviewIds((prev) => {
      if (prev.includes(reviewId)) {
        return prev.filter((id) => id !== reviewId)
      }

      return [...prev, reviewId]
    })
  }

  if (loading) {
    return (
      <div className="film-reviews-page">
        <div className="film-loading">
          <div className="film-loading__spinner" />
          <p>Загрузка рецензий...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="film-reviews-page">
      <div className="film-reviews-page__head">
        <button
          type="button"
          className="film-back-link"
          onClick={() => navigate(`/film/${id}`)}
        >
          ← К фильму
        </button>

        <h1>
          Рецензии
        </h1>

        {film && (
          <p>
            {film.name || film.alternative_name || 'Фильм'}
            {film.year ? `, ${film.year}` : ''}
          </p>
        )}
      </div>

      <div className="film-reviews-page__layout">
        <main className="film-reviews-page__main">
          <div className="film-reviews-toolbar">
            <div className="film-reviews-filters">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`film-reviews-filter film-reviews-filter--${item.value || 'all'} ${
                    filter === item.value ? 'film-reviews-filter--active' : ''
                  }`}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="film-section-btn"
              onClick={() => setFormOpen((prev) => !prev)}
            >
              {formOpen ? 'Скрыть форму' : 'Написать рецензию'}
            </button>
          </div>

          {formOpen && (
            <ReviewForm
              filmId={Number(id)}
              onSuccess={handleReviewCreated}
            />
          )}

          {reviews.length > 0 ? (
            <div className="film-reviews-list film-reviews-list--page">
              {reviews.map((review) => {
                const isLongReview = String(review.text || '').length > LONG_REVIEW_LIMIT
                const isExpanded = expandedReviewIds.includes(review.id)

                return (
                  <div
                    key={review.id}
                    className={`film-review-preview film-review-preview--${review.review_type} ${
                      isExpanded ? 'film-review-preview--expanded' : 'film-review-preview--collapsed'
                    }`}
                  >
                    <ReviewCard
                      review={review}
                      allowComments
                    />

                    {isLongReview && (
                      <div className="film-review-preview__actions">
                        <button
                          type="button"
                          className={`film-review-read-more film-review-read-more--${review.review_type}`}
                          onClick={() => toggleReviewExpanded(review.id)}
                        >
                          {isExpanded ? 'Свернуть' : 'Читать полностью'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="film-empty-block">
              Рецензий пока нет.
            </div>
          )}

          <div ref={sentinelRef} className="film-reviews-sentinel">
            {loadingMore && 'Загружаю ещё...'}
            {!hasNext && reviews.length > 0 && 'Все рецензии загружены'}
          </div>
        </main>

        <aside className="film-reviews-page__aside">
          <div className="reviews-stats-panel">
            <h2>Статистика</h2>

            <div className="reviews-stats-panel__total">
              <span>Всего рецензий</span>
              <strong>{stats?.total || 0}</strong>
            </div>

            {STAT_ITEMS.map((item) => (
              <div
                key={item.key}
                className={`reviews-stats-panel__item reviews-stats-panel__item--${item.key}`}
              >
                <div className="reviews-stats-panel__row">
                  <span>{item.label}</span>
                  <strong>{stats?.[item.key]?.count || 0}</strong>
                </div>

                <div className="reviews-stats-panel__bar">
                  <span
                    style={{
                      width: `${stats?.[item.key]?.percent || 0}%`,
                    }}
                  />
                </div>

                <small>
                  {stats?.[item.key]?.percent || 0}%
                </small>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default FilmReviewsPage