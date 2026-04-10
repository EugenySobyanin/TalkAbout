import api from './config'

// const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000' 
const BASE_URL = 'http://localhost:8000' 


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
    const data = response.data
    
    // Добавляем базовый URL ко всем путям изображений
    return {
        ...data,
        poster_url: data.poster_url ? BASE_URL + data.poster_url : null,
        logo_url: data.logo_url ? BASE_URL + data.logo_url : null,
        backdrop_url: data.backdrop_url ? BASE_URL + data.backdrop_url : null,
        // Если есть другие поля с изображениями, добавьте их здесь
    }
}