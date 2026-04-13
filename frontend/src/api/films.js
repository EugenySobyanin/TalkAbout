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
    }
}

export const getRandomTopFilms = async (params = {}) => {
  const response = await api.get('/films/discover/', { params })
  return response.data
}