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
export const createOrUpdateActivity = async (activityData, activiy) => {
  console.log('Попали в createOrUpdateActivity')
  try {
    // const existingActivity = await getUserFilmActivity(activityData.film)
    
    if (activiy) {
      const response = await api.patch(`/activities/${activiy.id}/`, activityData)
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
export const rateFilm = async (filmId, rating, activity) => {
  return await createOrUpdateActivity({
    film: filmId,
    rating: rating
  }, activity)
}

// Добавление в "Буду смотреть"
export const addToWatchlist = async (filmId, activity, isPlanned) => {
  return await createOrUpdateActivity({
    film: filmId,
    is_planned: isPlanned,
  }, activity)
}

// Отметка как "Просмотрено"
export const markAsWatched = async (filmId, activity, isWatched) => {
  console.log('Попали в markAsWatched.')
  return await createOrUpdateActivity({
    film: filmId,
    is_watched: isWatched,
    // is_planned: false
  }, activity)
}