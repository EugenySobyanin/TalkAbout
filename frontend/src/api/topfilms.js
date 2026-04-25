import api from './config'

export const getMyTopFilms = async () => {
  const response = await api.get('/profile/top-films/')
  return response.data
}

export const updateMyTopFilms = async (filmIds) => {
  const response = await api.put('/profile/top-films/', {
    film_ids: filmIds,
  })

  return response.data
}

export const getUserTopFilms = async (userId) => {
  const response = await api.get(`/users/${userId}/top-films/`)
  return response.data
}