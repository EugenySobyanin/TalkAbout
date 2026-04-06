import api from './config'

export const searchFilms = async (searchTerm) => {
    try {
        const response = await api.get('/films', {
            params: { search: searchTerm }
        })
        
        return Array.isArray(response.data) ? response.data : []
    } catch (error) {
        console.error('Search error:', error)
        return []
    }
}

export const getFilmDetails = async (id) => {
    const response = await api.get(`/films/${id}/`)
    return response.data
}