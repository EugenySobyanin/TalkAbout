import { useEffect, useState, useCallback } from 'react'
import { getRandomTopFilms } from '../../api/films'
import FilmsGridSection from '../../components/FilmsGridSection/FilmsGridSection'
import Hero from './components/Hero'
import './HomePage.css'

const FILMS_PER_PAGE = 12

let homePageCache = {
  films: [],
  hasMore: true,
  isLoaded: false,
}

function HomePage() {
  const [films, setFilms] = useState(homePageCache.films)
  const [loading, setLoading] = useState(!homePageCache.isLoaded)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(homePageCache.hasMore)

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
          const updatedFilms = [...prev, ...uniqueNewFilms]

          homePageCache = {
            ...homePageCache,
            films: updatedFilms,
            hasMore: newFilms.length >= FILMS_PER_PAGE,
            isLoaded: true,
          }

          return updatedFilms
        })
      } else {
        const initialFilms = newFilms.slice(0, FILMS_PER_PAGE)

        setFilms(initialFilms)

        homePageCache = {
          films: initialFilms,
          hasMore: newFilms.length >= FILMS_PER_PAGE,
          isLoaded: true,
        }
      }

      setHasMore(newFilms.length >= FILMS_PER_PAGE)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      setHasMore(false)

      homePageCache = {
        ...homePageCache,
        hasMore: false,
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    if (homePageCache.isLoaded) {
      setFilms(homePageCache.films)
      setHasMore(homePageCache.hasMore)
      setLoading(false)
      return
    }

    setLoading(true)
    loadFilms(false)
  }, [loadFilms])

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    await loadFilms(true)
  }

  return (
    <div className="home-page">
      {/* <Hero /> */}

      <div className="home-page__content">
        <FilmsGridSection
          eyebrow="Подборка вечера"
          title="Фильмы с высоким рейтингом"
          subtitle="Выбирайте из сильных работ, о которых хочется говорить после титров."
          films={films}
          loading={loading}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
          emptyText="Фильмы пока не найдены"
        />
      </div>
    </div>
  )
}

export default HomePage