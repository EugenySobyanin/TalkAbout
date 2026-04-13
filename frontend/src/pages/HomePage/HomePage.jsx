import { useEffect, useState, useCallback } from 'react'
import { getRandomTopFilms } from "../../api/films"
import FilmCard from './components/FilmCard'
import './HomePage.css'

const FILMS_PER_PAGE = 12

function HomePage() {
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadFilms = useCallback(async (append = false) => {
    try {
      const response = await getRandomTopFilms({
        count: FILMS_PER_PAGE * 2,
        min_rating: 7.0
      })
      
      const newFilms = response.results || []
      
      if (append) {
        setFilms(prev => {
          const existingIds = new Set(prev.map(f => f.id))
          const uniqueNewFilms = newFilms.filter(f => !existingIds.has(f.id))
          return [...prev, ...uniqueNewFilms]
        })
      } else {
        setFilms(newFilms.slice(0, FILMS_PER_PAGE))
      }
      
      setHasMore(newFilms.length >= FILMS_PER_PAGE)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    loadFilms(false)
  }, [loadFilms])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    await loadFilms(true)
  }

  if (loading) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="home-page">
      <div className="films-grid">
        {films.map((film) => (
          <FilmCard key={film.id} film={film} />
        ))}
      </div>
      
      {hasMore && (
        <button 
          className="load-more"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? 'Загрузка...' : 'Показать ещё'}
        </button>
      )}
    </div>
  )
}

export default HomePage