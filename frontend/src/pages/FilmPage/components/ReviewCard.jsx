import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import {
  createReviewComment,
  getReviewComments,
} from '../../../api/reviews'

const REVIEW_TYPE_LABELS = {
  positive: 'Положительная',
  neutral: 'Нейтральная',
  negative: 'Отрицательная',
}

const getAuthorName = (author) => {
  const fullName = author?.full_name?.trim()

  if (fullName) return fullName

  const firstName = author?.first_name || ''
  const lastName = author?.last_name || ''
  const name = `${firstName} ${lastName}`.trim()

  return name || author?.username || 'Пользователь'
}

const getAuthorAvatar = (author) => {
  return author?.avatar_url || author?.avatar || '/placeholder-avatar.jpg'
}

const formatDate = (date) => {
  if (!date) return '—'

  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function ReviewCard({
  review,
  compact = false,
  allowComments = false,
}) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentSaving, setCommentSaving] = useState(false)

  const reviewType = review.review_type || 'neutral'

  const loadComments = async () => {
    if (!review.id) return

    try {
      setCommentsLoading(true)

      const data = await getReviewComments(review.id)
      setComments(data.results || [])
    } catch (error) {
      console.error('Comments load error:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleToggleComments = async () => {
    const nextOpen = !commentsOpen
    setCommentsOpen(nextOpen)

    if (nextOpen && comments.length === 0) {
      await loadComments()
    }
  }

  const handleCreateComment = async (event) => {
    event.preventDefault()

    if (!user) {
      navigate('/login')
      return
    }

    if (!commentText.trim()) return

    try {
      setCommentSaving(true)

      const createdComment = await createReviewComment(
        review.id,
        commentText.trim()
      )

      setComments((prev) => [...prev, createdComment])
      setCommentText('')
    } catch (error) {
      console.error('Comment create error:', error)
    } finally {
      setCommentSaving(false)
    }
  }

  return (
    <article className={`review-card review-card--${reviewType} ${compact ? 'review-card--compact' : ''}`}>
      <div className="review-card__side" />

      <div className="review-card__content">
        <div className="review-card__top">
          <button
            type="button"
            className="review-card__author"
            onClick={() => review.author?.id && navigate(`/users/${review.author.id}`)}
          >
            <img
              src={getAuthorAvatar(review.author)}
              alt={getAuthorName(review.author)}
              className="review-card__avatar"
              onError={(event) => {
                event.target.onerror = null
                event.target.src = '/placeholder-avatar.jpg'
              }}
            />

            <span className="review-card__author-info">
              <span className="review-card__author-name">
                {getAuthorName(review.author)}
              </span>

              <span className="review-card__date">
                {formatDate(review.created_at)}
              </span>
            </span>
          </button>

          <span className={`review-card__type review-card__type--${reviewType}`}>
            {REVIEW_TYPE_LABELS[reviewType]}
          </span>
        </div>

        {review.title && (
          <h3 className="review-card__title">
            {review.title}
          </h3>
        )}

        {review.is_spoiler && (
          <span className="review-card__spoiler">
            Есть спойлеры
          </span>
        )}

        <p className="review-card__text">
          {review.text}
        </p>

        <div className="review-card__footer">
          {allowComments ? (
            <button
              type="button"
              className="review-card__comments-btn"
              onClick={handleToggleComments}
            >
              Комментарии: {comments.length || review.comments_count || 0}
            </button>
          ) : (
            <span className="review-card__comments-count">
              Комментарии: {review.comments_count || 0}
            </span>
          )}
        </div>

        {allowComments && commentsOpen && (
          <div className="review-comments">
            {commentsLoading ? (
              <p className="review-comments__empty">
                Загружаю комментарии...
              </p>
            ) : comments.length > 0 ? (
              <div className="review-comments__list">
                {comments.map((comment) => (
                  <div key={comment.id} className="review-comment">
                    <div className="review-comment__author">
                      <img
                        src={getAuthorAvatar(comment.author)}
                        alt={getAuthorName(comment.author)}
                        className="review-comment__avatar"
                        onError={(event) => {
                          event.target.onerror = null
                          event.target.src = '/placeholder-avatar.jpg'
                        }}
                      />

                      <span>
                        {getAuthorName(comment.author)}
                      </span>
                    </div>

                    <p className="review-comment__text">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="review-comments__empty">
                Комментариев пока нет.
              </p>
            )}

            <form className="review-comment-form" onSubmit={handleCreateComment}>
              <input
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Написать комментарий..."
                className="review-comment-form__input"
              />

              <button
                type="submit"
                className="review-comment-form__submit"
                disabled={commentSaving}
              >
                {commentSaving ? '...' : 'Отправить'}
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  )
}

export default ReviewCard