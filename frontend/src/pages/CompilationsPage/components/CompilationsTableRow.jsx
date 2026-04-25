import React, { useEffect, useMemo, useState } from 'react'
import {
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'
import CompilationFilmSelector from './CompilationFilmSelector'

const getFilmPoster = (film) => {
  return (
    film.poster_preview_url ||
    film.poster_url ||
    film.poster ||
    '/placeholder-poster.jpg'
  )
}

const getFilmTitle = (film) => {
  return film.name || film.alternative_name || film.en_name || 'Без названия'
}

const formatRating = (rating) => {
  if (rating === null || rating === undefined || rating === '') {
    return null
  }

  const numericRating = Number(rating)

  if (Number.isNaN(numericRating)) {
    return null
  }

  return numericRating.toFixed(1)
}

const getIdsSignature = (films) => {
  return films
    .map((film) => film.id)
    .sort((a, b) => a - b)
    .join(',')
}

const CompilationsTableRow = ({
  compilation,
  index,
  expanded,
  onToggleExpand,
  onToggleVisibility,
  onDelete,
  onEdit,
  onNavigateToFilm,
  onUpdateFilms,
}) => {
  const [draftFilms, setDraftFilms] = useState(compilation.films || [])
  const [savingFilms, setSavingFilms] = useState(false)

  useEffect(() => {
    setDraftFilms(compilation.films || [])
  }, [compilation.id, compilation.films])

  const filmsChanged = useMemo(() => {
    return getIdsSignature(draftFilms) !== getIdsSignature(compilation.films || [])
  }, [draftFilms, compilation.films])

  const previewFilms = (compilation.films || []).slice(0, 5)
  const hiddenFilmsCount = Math.max((compilation.films_count || 0) - previewFilms.length, 0)

  const handleRowClick = () => {
    onToggleExpand(compilation.id)
  }

  const handleActionClick = (event, callback) => {
    event.stopPropagation()
    callback()
  }

  const handleFilmClick = (event, filmId) => {
    event.stopPropagation()
    onNavigateToFilm(filmId)
  }

  const handleVisibilityClick = (event) => {
    event.stopPropagation()
    onToggleVisibility(compilation)
  }

  const handleSaveFilms = async () => {
    setSavingFilms(true)

    try {
      await onUpdateFilms(compilation, draftFilms)
    } catch (error) {
      console.error('Ошибка сохранения фильмов подборки:', error)
    } finally {
      setSavingFilms(false)
    }
  }

  return (
    <>
      <TableRow
        className={`compilations-table-row ${expanded ? 'compilations-table-row--expanded' : ''}`}
        onClick={handleRowClick}
      >
        <TableCell className="compilations-cell-number">
          <Typography className="compilations-number">
            #{index + 1}
          </Typography>
        </TableCell>

        <TableCell className="compilations-cell-name">
          <Typography className="compilations-name">
            {compilation.title || 'Без названия'}
          </Typography>

          {compilation.description && (
            <Typography className="compilations-description-preview">
              {compilation.description.length > 70
                ? `${compilation.description.substring(0, 70)}...`
                : compilation.description}
            </Typography>
          )}
        </TableCell>

        <TableCell className="compilations-cell-posters">
          <div className="compilations-preview-posters">
            {previewFilms.length > 0 ? (
              <>
                {previewFilms.map((film) => (
                  <img
                    key={film.id}
                    src={getFilmPoster(film)}
                    alt={getFilmTitle(film)}
                    className="compilations-preview-poster"
                    onError={(event) => {
                      event.target.onerror = null
                      event.target.src = '/placeholder-poster.jpg'
                    }}
                  />
                ))}

                {hiddenFilmsCount > 0 && (
                  <span className="compilations-preview-more">
                    +{hiddenFilmsCount}
                  </span>
                )}
              </>
            ) : (
              <span className="compilations-preview-empty">
                —
              </span>
            )}
          </div>
        </TableCell>

        <TableCell className="compilations-cell-count">
          <Typography className="compilations-count">
            {compilation.films_count || 0}
          </Typography>
        </TableCell>

        <TableCell className="compilations-cell-visibility">
          <div
            className={`compilations-visibility ${
              compilation.is_public
                ? 'compilations-visibility--public'
                : 'compilations-visibility--private'
            }`}
          >
            <IconButton
              className="compilations-icon-button compilations-visibility-button"
              onClick={handleVisibilityClick}
              title={compilation.is_public ? 'Сделать приватной' : 'Сделать публичной'}
            >
              {compilation.is_public ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>

            <Typography className="compilations-visibility-status">
              {compilation.is_public ? 'Публичная' : 'Приватная'}
            </Typography>
          </div>
        </TableCell>

        <TableCell className="compilations-cell-actions">
          <div className="compilations-actions">
            <IconButton
              className="compilations-icon-button"
              onClick={(event) =>
                handleActionClick(event, () => onToggleExpand(compilation.id))
              }
              title={expanded ? 'Свернуть' : 'Подробнее'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>

            <IconButton
              className="compilations-icon-button"
              onClick={(event) =>
                handleActionClick(event, () => onEdit(compilation))
              }
              title="Редактировать подборку"
            >
              <EditIcon />
            </IconButton>

            <IconButton
              className="compilations-icon-button delete"
              onClick={(event) =>
                handleActionClick(event, () => onDelete(compilation.id))
              }
              title="Удалить подборку"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>

      <TableRow className="compilations-collapse-row">
        <TableCell colSpan={6} className="compilations-collapse-cell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <div className="compilations-collapse-box">
              <div className="compilations-collapse-meta">
                <span>
                  Создана: <strong>{compilation.created_at || '—'}</strong>
                </span>

                {compilation.updated_at && (
                  <span>
                    Обновлена: <strong>{compilation.updated_at}</strong>
                  </span>
                )}

                <span>
                  Фильмов: <strong>{compilation.films_count || 0}</strong>
                </span>
              </div>

              <Typography className="compilations-description">
                {compilation.description || 'Описание отсутствует.'}
              </Typography>

              {compilation.films && compilation.films.length > 0 && (
                <div className="compilations-films-grid">
                  {compilation.films.map((film) => (
                    <button
                      type="button"
                      key={film.id}
                      className="compilations-film-card"
                      onClick={(event) => handleFilmClick(event, film.id)}
                    >
                      <img
                        src={getFilmPoster(film)}
                        alt={getFilmTitle(film)}
                        className="compilations-film-poster"
                        onError={(event) => {
                          event.target.onerror = null
                          event.target.src = '/placeholder-poster.jpg'
                        }}
                      />

                      <span className="compilations-film-info">
                        <span className="compilations-film-title">
                          {getFilmTitle(film)}
                        </span>

                        <span className="compilations-film-year">
                          {film.year || '—'}
                        </span>

                        <span className="compilations-film-rating">
                          <StarIcon />
                          {formatRating(film.kinopoisk_rating)
                            ? `KP ${formatRating(film.kinopoisk_rating)}`
                            : formatRating(film.imdb_rating)
                              ? `IMDb ${formatRating(film.imdb_rating)}`
                              : 'Нет рейтинга'}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="compilations-films-editor">
                <div className="compilations-films-editor__head">
                  <Typography className="compilations-collapse-title">
                    Управление фильмами
                  </Typography>

                  <button
                    type="button"
                    className="compilations-save-films-button"
                    onClick={handleSaveFilms}
                    disabled={!filmsChanged || savingFilms}
                  >
                    {savingFilms ? 'Сохранение...' : 'Сохранить фильмы'}
                  </button>
                </div>

                <CompilationFilmSelector
                  selectedFilms={draftFilms}
                  onChange={setDraftFilms}
                  compact
                />
              </div>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default CompilationsTableRow