import { useEffect, useState } from 'react'
import { searchFilms } from "../../api/films";
import './HomePage.css'

function HomePage() {
  const [newReleases, setNewReleases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const response = await searchFilms('2024')
        // API возвращает объект с полем results, содержащим массив
        const films = response.results || []
        setNewReleases(films.slice(0, 10))
      } catch (error) {
        console.error('Ошибка загрузки:', error)
        setNewReleases([])
      } finally {
        setLoading(false)
      }
    }

    fetchNewReleases()
  }, [])

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Добро пожаловать в TalkAbout!</h1>
        <p>Обсуждайте фильмы, делитесь впечатлениями и находите новых друзей</p>
      </section>

      <section className="new-releases">
        <h2>Новинки кино</h2>
        <div className="films-grid">
          {newReleases.map((film) => (
            <div key={film.id} className="film-card">
              {film.poster && (
                <img src={film.poster} alt={film.name} className="film-poster" />
              )}
              <div className="film-info">
                <h3>{film.name || film.alternative_name || 'Без названия'}</h3>
                <p>Год: {film.year || 'Не указан'}</p>
                {film.rating && <p>Рейтинг: ⭐ {film.rating}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage