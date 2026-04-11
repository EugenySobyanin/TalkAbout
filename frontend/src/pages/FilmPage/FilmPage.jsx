// src/pages/FilmPage/FilmPage.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFilmDetails } from '../../api/films'
import { useAuth } from '../../contexts/AuthContext'
import FilmHeader from './components/FilmHeader'
import FilmActions from './components/FilmActions'
import FilmInfo from './components/FilmInfo'
import FilmPersons from './components/FilmPersons'
import FilmVideos from './components/FilmVideos'
import FilmFacts from './components/FilmFacts'
import SimilarFilms from './components/SimilarFilms'
import './FilmPage.css'

function FilmPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [film, setFilm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFilmData()
    // Прокрутка страницы вверх при загрузке
    window.scrollTo(0, 0)
  }, [id])

  const loadFilmData = async () => {
    try {
      setLoading(true)
      setError(null)
      const filmData = await getFilmDetails(id)
      setFilm(filmData)
    } catch (err) {
      console.error('Error loading film:', err)
      setError('Не удалось загрузить информацию о фильме')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="film-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error || !film) {
    return (
      <div className="film-page error">
        <div className="error-container">
          <h2>😕 {error || 'Фильм не найден'}</h2>
          <button onClick={handleBack} className="back-btn">
            ← Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="film-page">
      <button onClick={handleBack} className="back-button">
        ← Назад
      </button>
      
      <FilmHeader film={film} />
      
      <div className="film-content">
        <div className="film-main">
          <FilmActions filmId={film.id} activity={film.activity} />
          
          <FilmInfo film={film} />
          
          {film.persons_by_profession && Object.keys(film.persons_by_profession).length > 0 && (
            <FilmPersons personsByProfession={film.persons_by_profession} />
          )}
          
          {film.videos && film.videos.length > 0 && (
            <FilmVideos videos={film.videos} />
          )}
          
          {film.facts && film.facts.length > 0 && (
            <FilmFacts facts={film.facts} />
          )}
        </div>
        
        <div className="film-sidebar">
          {film.similar_films && film.similar_films.length > 0 && (
            <SimilarFilms similarFilms={film.similar_films} />
          )}
        </div>
      </div>
    </div>
  )
}

export default FilmPage