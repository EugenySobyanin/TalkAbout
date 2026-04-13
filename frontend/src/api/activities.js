// src/api/activities.js

import api from './config'

// Получение активности пользователя для фильма
export const getUserFilmActivity = async (filmId) => {
  try {
    const response = await api.get('/activities/', {
      params: { film_id: filmId }
    })
    return response.data[0] || null
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return null
  }
}

// Получение всех активностей пользователя
export const getUserActivities = async (params = {}) => {
  try {
    const response = await api.get('/activities/', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching user activities:', error)
    return []
  }
}

// Получение планируемых фильмов
export const getPlannedFilms = async () => {
  return getUserActivities({ is_planned: true })
}

// Получение просмотренных фильмов
export const getWatchedFilms = async () => {
  return getUserActivities({ is_watched: true })
}

// Создание или обновление активности
export const createOrUpdateActivity = async (activityData, activity) => {
  try {
    if (activity) {
      const response = await api.patch(`/activities/${activity.id}/`, activityData)
      return response.data
    } else {
      console.log('Отправляется OPTIONS вместо POST')
      const response = await api.post('/activities/', activityData)
      return response.data
    }
  } catch (error) {
    console.error('Error creating/updating activity:', error)
    throw error
  }
}

// Обновление публичности
export const toggleVisibility = async (activityId, field, value) => {
  try {
    const response = await api.patch(`/activities/${activityId}/`, {
      [field]: value
    })
    return response.data
  } catch (error) {
    console.error('Error toggling visibility:', error)
    throw error
  }
}

// Удаление из планируемых
export const removeFromPlanned = async (activityId) => {
  try {
    const response = await api.patch(`/activities/${activityId}/`, {
      is_planned: false
    })
    return response.data
  } catch (error) {
    console.error('Error removing from planned:', error)
    throw error
  }
}

// Установка оценки
export const rateFilm = async (filmId, rating, activity) => {
  return await createOrUpdateActivity({
    film_id: filmId,
    rating: rating
  }, activity)
}

// Добавление в "Буду смотреть"
export const addToWatchlist = async (filmId, activity, isPlanned) => {
  return await createOrUpdateActivity({
    film_id: filmId,
    is_planned: isPlanned,
  }, activity)
}

// Отметка как "Просмотрено"
export const markAsWatched = async (filmId, activity, isWatched) => {
  return await createOrUpdateActivity({
    film_id: filmId,
    is_watched: isWatched,
  }, activity)
}

// Обновление оценки
export const updateRating = async (activityId, rating) => {
  try {
    const response = await api.patch(`/activities/${activityId}/`, {
      rating: rating
    })
    return response.data
  } catch (error) {
    console.error('Error updating rating:', error)
    throw error
  }
}

// Отметить как просмотренное с оценкой
export const markAsWatchedWithRating = async (activityId, rating) => {
  try {
    const response = await api.patch(`/activities/${activityId}/`, {
      is_planned: false,
      is_watched: true,
      rating: rating
    })
    return response.data
  } catch (error) {
    console.error('Error marking as watched:', error)
    throw error
  }
}