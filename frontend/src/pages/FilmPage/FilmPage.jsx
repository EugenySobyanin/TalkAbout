import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFilmDetails } from '../../api/films'
import FilmActions from './components/FilmActions'
import FilmFacts from './components/FilmFacts'
import FilmHeader from './components/FilmHeader'
import FilmInfo from './components/FilmInfo'
import FilmPersons from './components/FilmPersons'
import FilmReviewsPreview from './components/FilmReviewsPreview'
import FilmVideos from './components/FilmVideos'
import SimilarFilms from './components/SimilarFilms'
import './FilmPage.css'

function FilmPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [film, setFilm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  useEffect(() => {
    loadFilmData()
    window.scrollTo(0, 0)
  }, [id])

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="film-page film-page--loading">
        <div className="film-loading">
          <div className="film-loading__spinner" />
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error || !film) {
    return (
      <div className="film-page film-page--error">
        <div className="film-error">
          <h2>{error || 'Фильм не найден'}</h2>

          <button
            type="button"
            onClick={handleBack}
            className="film-error__button"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="film-page">
      <FilmHeader film={film} />

      <div className="film-content">
        <main className="film-main">
          <FilmActions
            filmId={film.id}
            activity={film.activity}
          />

          <FilmInfo film={film} />

          {film.persons_by_profession &&
            Object.keys(film.persons_by_profession).length > 0 && (
              <FilmPersons personsByProfession={film.persons_by_profession} />
            )}

          <FilmReviewsPreview
            film={film}
            onReviewCreated={loadFilmData}
          />

          {film.videos && film.videos.length > 0 && (
            <FilmVideos videos={film.videos} />
          )}

          {film.facts && film.facts.length > 0 && (
            <FilmFacts facts={film.facts} />
          )}
        </main>

        <aside className="film-sidebar">
          {film.similar_films && film.similar_films.length > 0 && (
            <SimilarFilms similarFilms={film.similar_films} />
          )}
        </aside>
      </div>
    </div>
  )
}

export default FilmPage