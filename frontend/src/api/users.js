import api from './config'

export const getMyProfile = async () => {
  try {
    const response = await api.get('/users/me/profile/')
    return response.data
  } catch (error) {
    console.error('My profile fetch error:', error)
    throw error
  }
}

export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/profile/`)
    return response.data
  } catch (error) {
    console.error('User profile fetch error:', error)
    throw error
  }
}

export const updateMyAvatar = async (formData) => {
  try {
    const response = await api.patch('/users/me/profile/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Avatar update error:', error)
    throw error
  }
}

export const getMyTopFilms = async () => {
  try {
    const response = await api.get('/users/me/top-films/')
    return response.data
  } catch (error) {
    console.error('My top films fetch error:', error)
    return []
  }
}

export const updateMyTopFilms = async (filmIds) => {
  try {
    const response = await api.put('/users/me/top-films/', {
      film_ids: filmIds,
    })

    return response.data
  } catch (error) {
    console.error('My top films update error:', error)
    throw error
  }
}

export const getUserTopFilms = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/top-films/`)
    return response.data
  } catch (error) {
    console.error('User top films fetch error:', error)
    return []
  }
}