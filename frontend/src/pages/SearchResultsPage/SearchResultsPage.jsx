import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchFilmsFull } from '../../api/films'
import FilmsGridSection from '../../components/FilmsGridSection/FilmsGridSection'
import './SearchResultsPage.css'

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const page = Number(searchParams.get('page') || 1)

  const [films, setFilms] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [previous, setPrevious] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      if (!query.trim()) {
        setFilms([])
        setCount(0)
        setNext(null)
        setPrevious(null)
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const data = await searchFilmsFull(query, page)
        setFilms(data.results || [])
        setCount(data.count || 0)
        setNext(data.next)
        setPrevious(data.previous)
      } catch (error) {
        console.error('Ошибка загрузки результатов поиска:', error)
        setFilms([])
        setCount(0)
        setNext(null)
        setPrevious(null)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [query, page])

  const goToPage = (newPage) => {
    setSearchParams({
      q: query,
      page: String(newPage),
    })
  }

  return (
    <div className="search-results-page">
      <FilmsGridSection
        title="Результаты поиска"
        subtitle={query ? `По запросу: “${query}”` : ''}
        count={count}
        films={films}
        loading={loading}
        emptyText="По вашему запросу ничего не найдено"
      />

      {!loading && count > 0 && (
        <div className="search-pagination">
          <button
            type="button"
            className="search-pagination__btn"
            disabled={!previous}
            onClick={() => goToPage(page - 1)}
          >
            Назад
          </button>

          <span className="search-pagination__info">Страница {page}</span>

          <button
            type="button"
            className="search-pagination__btn"
            disabled={!next}
            onClick={() => goToPage(page + 1)}
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchResultsPage