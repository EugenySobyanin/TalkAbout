import api from './config'

const BASE_URL = 'http://localhost:8000'


/**
 * 🔍 Быстрый поиск (для dropdown)
 * Возвращает:
 * {
 *   total: number,
 *   results: Film[]
 * }
 */
export const searchFilms = async (query) => {
  try {
    const response = await api.get('/films/search-suggestions/', {
      params: { q: query }
    })

    return {
      total: response.data?.total || 0,
      results: response.data?.results || []
    }
  } catch (error) {
    console.error('Search suggestions error:', error)
    return {
      total: 0,
      results: []
    }
  }
}


/**
 * 🔎 Полный поиск (страница результатов)
 * Возвращает стандартную DRF пагинацию:
 * {
 *   count,
 *   next,
 *   previous,
 *   results
 * }
 */
export const searchFilmsFull = async (query, page = 1) => {
  try {
    const response = await api.get('/films/search/', {
      params: {
        q: query,
        page
      }
    })

    return response.data
  } catch (error) {
    console.error('Full search error:', error)
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    }
  }
}


/**
 * 🎬 Детали фильма
 */
export const getFilmDetails = async (id) => {
  try {
    const response = await api.get(`/films/${id}/`)
    return response.data
  } catch (error) {
    console.error('Film details error:', error)
    throw error
  }
}


/**
 * 🎲 Случайные топ-фильмы (главная)
 */
export const getRandomTopFilms = async (params = {}) => {
  try {
    const response = await api.get('/films/discover/', { params })
    return response.data
  } catch (error) {
    console.error('Random films error:', error)
    return {
      count: 0,
      results: []
    }
  }
}

export const getFilmGenres = async () => {
  try {
    const response = await api.get('/genres/')
    return response.data || []
  } catch (error) {
    console.error('Genres fetch error:', error)
    return []
  }
}

export const getFilmCountries = async () => {
  try {
    const response = await api.get('/countries/')
    return response.data || []
  } catch (error) {
    console.error('Countries fetch error:', error)
    return []
  }
}

export const getPickedFilms = async (filters = {}, page = 1) => {
  try {
    const params = new URLSearchParams()

    if (filters.year_min) params.append('year_min', filters.year_min)
    if (filters.year_max) params.append('year_max', filters.year_max)

    if (filters.movie_length_min) params.append('movie_length_min', filters.movie_length_min)
    if (filters.movie_length_max) params.append('movie_length_max', filters.movie_length_max)

    if (filters.kinopoisk_rating_min) params.append('kinopoisk_rating_min', filters.kinopoisk_rating_min)
    if (filters.kinopoisk_rating_max) params.append('kinopoisk_rating_max', filters.kinopoisk_rating_max)

    if (filters.imdb_rating_min) params.append('imdb_rating_min', filters.imdb_rating_min)
    if (filters.imdb_rating_max) params.append('imdb_rating_max', filters.imdb_rating_max)

    if (filters.age_rating) params.append('age_rating', filters.age_rating)

    if (Array.isArray(filters.genres)) {
      filters.genres.forEach((id) => params.append('genres', id))
    }

    if (Array.isArray(filters.countries)) {
      filters.countries.forEach((id) => params.append('countries', id))
    }

    if (Array.isArray(filters.persons)) {
      filters.persons.forEach((id) => params.append('persons', id))
    }

    params.append('page', page)

    const response = await api.get(`/films/?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Picked films fetch error:', error)
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    }
  }
}