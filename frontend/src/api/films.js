import api from './config'

export const searchFilms = async (serchTerm) => {
    const response = await api.get('/films', {
        params: {serch: serchTerm}
    })
    return response.data
}

export const getFilmDetails = async (id) => {
    const response = await api.get(`/films/${id}/`)
    return response.data
}