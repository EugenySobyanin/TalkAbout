import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { createReview } from '../../../api/reviews'

const REVIEW_TYPES = [
  {
    value: 'positive',
    label: 'Положительная',
  },
  {
    value: 'neutral',
    label: 'Нейтральная',
  },
  {
    value: 'negative',
    label: 'Отрицательная',
  },
]

function ReviewForm({
  filmId,
  onSuccess,
  submitLabel = 'Опубликовать рецензию',
}) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [reviewType, setReviewType] = useState('neutral')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!user) {
      navigate('/login')
      return
    }

    if (!text.trim()) {
      setError('Напишите текст рецензии.')
      return
    }

    try {
      setSaving(true)
      setError('')

      const createdReview = await createReview({
        film: filmId,
        title: title.trim(),
        text: text.trim(),
        review_type: reviewType,
        is_spoiler: isSpoiler,
      })

      setTitle('')
      setText('')
      setReviewType('neutral')
      setIsSpoiler(false)

      if (onSuccess) {
        onSuccess(createdReview)
      }
    } catch (err) {
      console.error('Review create error:', err)

      const apiError =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Не удалось сохранить рецензию.'

      setError(apiError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="review-form__head">
        <h3 className="review-form__title">Написать рецензию</h3>
      </div>

      <input
        type="text"
        className="review-form__input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Заголовок рецензии"
        maxLength={160}
      />

      <div className="review-form__types">
        {REVIEW_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            className={`review-form__type review-form__type--${type.value} ${
              reviewType === type.value ? 'review-form__type--active' : ''
            }`}
            onClick={() => setReviewType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <textarea
        className="review-form__textarea"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Ваши мысли о фильме..."
        rows={6}
      />

      <label className="review-form__spoiler">
        <input
          type="checkbox"
          checked={isSpoiler}
          onChange={(event) => setIsSpoiler(event.target.checked)}
        />
        <span>В рецензии есть спойлеры</span>
      </label>

      {error && (
        <p className="review-form__error">
          {error}
        </p>
      )}

      <div className="review-form__actions">
        <button
          type="submit"
          className="review-form__submit"
          disabled={saving}
        >
          {saving ? 'Сохраняю...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ReviewForm