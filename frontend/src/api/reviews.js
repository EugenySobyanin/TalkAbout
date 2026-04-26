import api from './config'

export const getFilmReviews = async ({
  filmId,
  page = 1,
  reviewType = '',
} = {}) => {
  try {
    const params = {
      film_id: filmId,
      page,
    }

    if (reviewType) {
      params.review_type = reviewType
    }

    const response = await api.get('/reviews/', { params })

    return {
      count: response.data?.count || 0,
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      results: response.data?.results || [],
      stats: response.data?.stats || null,
    }
  } catch (error) {
    console.error('Reviews fetch error:', error)

    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
      stats: null,
    }
  }
}

export const createReview = async (payload) => {
  const response = await api.post('/reviews/', payload)
  return response.data
}

export const updateReview = async (reviewId, payload) => {
  const response = await api.patch(`/reviews/${reviewId}/`, payload)
  return response.data
}

export const deleteReview = async (reviewId) => {
  await api.delete(`/reviews/${reviewId}/`)
}

export const getReviewComments = async (reviewId, page = 1) => {
  try {
    const response = await api.get(`/reviews/${reviewId}/comments/`, {
      params: { page },
    })

    return {
      count: response.data?.count || 0,
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      results: response.data?.results || [],
    }
  } catch (error) {
    console.error('Review comments fetch error:', error)

    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    }
  }
}

export const createReviewComment = async (reviewId, text) => {
  const response = await api.post(`/reviews/${reviewId}/comments/`, {
    text,
  })

  return response.data
}