import { useEffect, useState, useCallback, useRef } from 'react'
import { getRandomTopFilms } from '../../api/films'
import FilmsGridSection from '../../components/FilmsGridSection/FilmsGridSection'
import './HomePage.css'

const FILMS_PER_PAGE = 12
const FILMS_PER_REQUEST = FILMS_PER_PAGE * 2
const MIN_RATING = 7.0

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

  const sentinelRef = useRef(null)

  const filmsRef = useRef(homePageCache.films)
  const hasMoreRef = useRef(homePageCache.hasMore)
  const requestInProgressRef = useRef(false)

  const updateFilmsState = useCallback((nextFilms, nextHasMore) => {
    filmsRef.current = nextFilms
    hasMoreRef.current = nextHasMore

    setFilms(nextFilms)
    setHasMore(nextHasMore)

    homePageCache = {
      films: nextFilms,
      hasMore: nextHasMore,
      isLoaded: true,
    }
  }, [])

  const getHasMoreValue = useCallback((response, currentFilmsCount, receivedFilmsCount, addedFilmsCount) => {
    const totalAvailable = response.total_available ?? response.total_matching

    if (typeof totalAvailable === 'number') {
      return currentFilmsCount < totalAvailable
    }

    return receivedFilmsCount >= FILMS_PER_PAGE && addedFilmsCount > 0
  }, [])

  const loadFilms = useCallback(async (append = false) => {
    if (requestInProgressRef.current) return

    if (append && !hasMoreRef.current) return

    requestInProgressRef.current = true

    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await getRandomTopFilms({
        count: FILMS_PER_REQUEST,
        min_rating: MIN_RATING,
      })

      const receivedFilms = response.results || []

      if (append) {
        const currentFilms = filmsRef.current
        const existingIds = new Set(currentFilms.map(film => film.id))

        const uniqueNewFilms = receivedFilms
          .filter(film => !existingIds.has(film.id))
          .slice(0, FILMS_PER_PAGE)

        const updatedFilms = [
          ...currentFilms,
          ...uniqueNewFilms,
        ]

        const nextHasMore = getHasMoreValue(
          response,
          updatedFilms.length,
          receivedFilms.length,
          uniqueNewFilms.length,
        )

        updateFilmsState(updatedFilms, nextHasMore)
      } else {
        const initialFilms = receivedFilms.slice(0, FILMS_PER_PAGE)

        const nextHasMore = getHasMoreValue(
          response,
          initialFilms.length,
          receivedFilms.length,
          initialFilms.length,
        )

        updateFilmsState(initialFilms, nextHasMore)
      }
    } catch (error) {
      console.error('Ошибка загрузки фильмов:', error)

      hasMoreRef.current = false
      setHasMore(false)

      homePageCache = {
        ...homePageCache,
        hasMore: false,
      }
    } finally {
      requestInProgressRef.current = false
      setLoading(false)
      setLoadingMore(false)
    }
  }, [getHasMoreValue, updateFilmsState])

  useEffect(() => {
    if (homePageCache.isLoaded) {
      filmsRef.current = homePageCache.films
      hasMoreRef.current = homePageCache.hasMore

      setFilms(homePageCache.films)
      setHasMore(homePageCache.hasMore)
      setLoading(false)

      return
    }

    loadFilms(false)
  }, [loadFilms])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel) return

    const observer = new IntersectionObserver(
      entries => {
        const firstEntry = entries[0]

        if (firstEntry.isIntersecting) {
          loadFilms(true)
        }
      },
      {
        root: null,
        rootMargin: '400px 0px',
        threshold: 0,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [loadFilms])

  return (
    <div className="home-page">
      <div className="home-page__content">
        <FilmsGridSection
          eyebrow="Подборка вечера"
          title="Фильмы с высоким рейтингом"
          subtitle=""
          films={films}
          loading={loading}
          hasMore={false}
          loadingMore={false}
          onLoadMore={undefined}
          emptyText="Фильмы пока не найдены"
        />

        <div
          ref={sentinelRef}
          className="home-page__scroll-sentinel"
          aria-hidden="true"
        />

        {!loading && loadingMore && (
          <div className="home-page__scroll-loader">
            Загружаем ещё фильмы...
          </div>
        )}

        {!loading && !loadingMore && films.length > 0 && !hasMore && (
          <div className="home-page__scroll-end">
            Больше фильмов пока нет
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage