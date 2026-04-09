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

// Создание или обновление активности
export const createOrUpdateActivity = async (activityData) => {
  try {
    const existingActivity = await getUserFilmActivity(activityData.film)
    
    if (existingActivity) {
      const response = await api.patch(`/activities/${existingActivity.id}/`, activityData)
      return response.data
    } else {
      const response = await api.post('/activities/', activityData)
      return response.data
    }
  } catch (error) {
    console.error('Error creating/updating activity:', error)
    throw error
  }
}

// Установка оценки
export const rateFilm = async (filmId, rating) => {
  return await createOrUpdateActivity({
    film: filmId,
    rating: rating
  })
}

// Добавление в "Буду смотреть"
export const addToWatchlist = async (filmId) => {
  return await createOrUpdateActivity({
    film: filmId,
    is_planned: true
  })
}

// Отметка как "Просмотрено"
export const markAsWatched = async (filmId) => {
  return await createOrUpdateActivity({
    film: filmId,
    is_watched: true,
    is_planned: false
  })
}