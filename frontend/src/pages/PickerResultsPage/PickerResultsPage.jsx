import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPickedFilms } from '../../api/films'
import FilmsGridSection from '../../components/FilmsGridSection/FilmsGridSection'
import './PickerResultsPage.css'

function PickerResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') || 1)

  const [films, setFilms] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [previous, setPrevious] = useState(null)
  const [loading, setLoading] = useState(true)

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
          budget_value_min: searchParams.get('budget_value_min') || '',
          budget_value_max: searchParams.get('budget_value_max') || '',
          type: searchParams.getAll('type'),
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
      <FilmsGridSection
        title="Результаты подбора"
        subtitle="Фильмы, подходящие под выбранные параметры"
        count={count}
        films={films}
        loading={loading}
        emptyText="По этим фильтрам ничего не найдено"
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