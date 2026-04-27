import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPickedFilms } from '../../api/films'
import FilmsGridSection from '../../components/FilmsGridSection/FilmsGridSection'
import './PickerResultsPage.css'

function PickerResultsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)

  const [films, setFilms] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [previous, setPrevious] = useState(null)
  const [loading, setLoading] = useState(true)

  const filtersSummary = useMemo(() => {
    const items = []

    if (searchParams.get('year_min') || searchParams.get('year_max')) {
      items.push(`Годы: ${searchParams.get('year_min') || '—'}–${searchParams.get('year_max') || '—'}`)
    }

    if (searchParams.get('movie_length_min') || searchParams.get('movie_length_max')) {
      items.push(`Длительность: ${searchParams.get('movie_length_min') || '—'}–${searchParams.get('movie_length_max') || '—'} мин`)
    }

    if (searchParams.get('kinopoisk_rating_min')) {
      items.push(`КП от ${searchParams.get('kinopoisk_rating_min')}`)
    }

    if (searchParams.get('imdb_rating_min')) {
      items.push(`IMDb от ${searchParams.get('imdb_rating_min')}`)
    }

    if (searchParams.get('age_rating')) {
      items.push(`${searchParams.get('age_rating')}+`)
    }

    if (searchParams.getAll('genres').length > 0) {
      items.push(`Жанры: ${searchParams.getAll('genres').length}`)
    }

    if (searchParams.getAll('countries').length > 0) {
      items.push(`Страны: ${searchParams.getAll('countries').length}`)
    }

    return items
  }, [searchParams])

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true)

      try {
        const filters = {
          year_min: searchParams.get('year_min') || '',
          year_max: searchParams.get('year_max') || '',
          movie_length_min: searchParams.get('movie_length_min') || '',
          movie_length_max: searchParams.get('movie_length_max') || '',
          kinopoisk_rating_min: searchParams.get('kinopoisk_rating_min') || '',
          kinopoisk_rating_max: searchParams.get('kinopoisk_rating_max') || '',
          imdb_rating_min: searchParams.get('imdb_rating_min') || '',
          imdb_rating_max: searchParams.get('imdb_rating_max') || '',
          age_rating: searchParams.get('age_rating') || '',
          genres: searchParams.getAll('genres'),
          countries: searchParams.getAll('countries'),
          persons: searchParams.getAll('persons'),
        }

        const data = await getPickedFilms(filters, page)

        setFilms(data.results || [])
        setCount(data.count || 0)
        setNext(data.next)
        setPrevious(data.previous)
      } catch (error) {
        console.error('Ошибка загрузки подборки:', error)
        setFilms([])
        setCount(0)
        setNext(null)
        setPrevious(null)
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [searchParams, page])

  const goToPage = (newPage) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('page', String(newPage))
    setSearchParams(nextParams)
  }

  return (
    <div className="picker-results-page">
      <div className="picker-results-toolbar">
        <div>
          {/* <p className="picker-results-eyebrow">Frame25</p> */}
          <h1 className="picker-results-title">Результаты подбора</h1>

          {filtersSummary.length > 0 && (
            <div className="picker-results-filters">
              {filtersSummary.map((item) => (
                <span key={item} className="picker-results-filter">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="picker-results-back"
          onClick={() => navigate('/films/picker')}
        >
          Изменить фильтры
        </button>
      </div>

      <FilmsGridSection
        title=""
        subtitle=""
        count={count}
        films={films}
        loading={loading}
        emptyText="По этим фильтрам ничего не найдено"
        showHeader={false}
      />

      {!loading && count > 0 && (
        <div className="picker-pagination">
          <button
            type="button"
            className="picker-pagination__btn"
            disabled={!previous}
            onClick={() => goToPage(page - 1)}
          >
            Назад
          </button>

          <span className="picker-pagination__info">Страница {page}</span>

          <button
            type="button"
            className="picker-pagination__btn"
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

export default PickerResultsPage