import React from 'react'
import {
  Collapse,
  IconButton,
  Rating,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material'
import {
  CheckCircle as WatchedIcon,
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material'

const DiaryTableRow = ({
  activity,
  index,
  currentTab,
  expanded,
  onToggleExpand,
  onToggleVisibility,
  onUpdateRating,
  onMarkAsWatched,
  onRemove,
  onNavigateToFilm,
}) => {
  const film = activity.film
  const posterSrc = film.poster_preview_url || film.poster_url

  const isPublic = currentTab === 0
    ? activity.is_public_for_planned
    : activity.is_public_for_watched

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('ru-RU')
  }

  const formatRating = (rating) => {
    if (rating === null || rating === undefined || rating === '') {
      return '—'
    }

    const numericRating = Number(rating)

    if (Number.isNaN(numericRating)) {
      return '—'
    }

    return numericRating.toFixed(1)
  }

  const formatVotes = (votes) => {
    if (votes === null || votes === undefined || votes === '') {
      return '—'
    }

    return Number(votes).toLocaleString('ru-RU')
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '—'

    const hours = Math.floor(minutes / 60)
    const restMinutes = minutes % 60

    if (hours === 0) return `${restMinutes} мин`
    if (restMinutes === 0) return `${hours} ч`

    return `${hours} ч ${restMinutes} мин`
  }

  const handleRowClick = () => {
    onToggleExpand(activity.id)
  }

  const handlePosterClick = (event) => {
    event.stopPropagation()
    onNavigateToFilm(film.id)
  }

  const handleTitleClick = (event) => {
    event.stopPropagation()
    onNavigateToFilm(film.id)
  }

  const handleRatingClick = (event) => {
    event.stopPropagation()
  }

  const handleVisibilityClick = (event) => {
    event.stopPropagation()

    onToggleVisibility(
      activity,
      currentTab === 0 ? 'planned' : 'watched'
    )
  }

  const handleActionClick = (event, callback) => {
    event.stopPropagation()
    callback(activity)
  }

  return (
    <>
      <TableRow
        className={`pulp-table-row ${expanded ? 'pulp-table-row--expanded' : ''}`}
        onClick={handleRowClick}
      >
        <TableCell className="pulp-cell-number">
          <Typography className="pulp-film-number">
            #{index + 1}
          </Typography>
        </TableCell>

        <TableCell className="pulp-cell-poster">
          <button
            type="button"
            className="pulp-poster-button"
            onClick={handlePosterClick}
            aria-label={`Открыть фильм ${film.name}`}
          >
            <img
              src={posterSrc}
              alt={film.name}
              className="pulp-poster"
            />
          </button>
        </TableCell>

        <TableCell className="pulp-cell-name">
          <button
            type="button"
            className="pulp-film-name-button"
            onClick={handleTitleClick}
          >
            {film.name}
          </button>
        </TableCell>

        <TableCell className="pulp-cell-year">
          <Typography className="pulp-film-year">
            {film.year || '—'}
          </Typography>
        </TableCell>

        <TableCell className="pulp-cell-rating" onClick={handleRatingClick}>
          <div className="pulp-rating-control">
            <Rating
              className="pulp-rating"
              value={activity.rating || 0}
              max={10}
              onChange={(event, newValue) => onUpdateRating(activity, newValue)}
              icon={<StarIcon fontSize="small" />}
              emptyIcon={<StarBorderIcon fontSize="small" />}
            />

            {activity.rating && (
              <Typography variant="caption" className="pulp-rating-value">
                {activity.rating}/10
              </Typography>
            )}
          </div>
        </TableCell>

        <TableCell
          className={`pulp-cell-visibility pulp-visibility ${
            isPublic ? 'pulp-visibility--public' : 'pulp-visibility--private'
          }`}
        >
          <IconButton
            className="pulp-icon-button pulp-visibility-button"
            onClick={handleVisibilityClick}
            title={isPublic ? 'Сделать приватным' : 'Сделать публичным'}
          >
            {isPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>

          <Typography className="pulp-visibility-status">
            {isPublic ? 'Публичный' : 'Приватный'}
          </Typography>
        </TableCell>

        <TableCell className="pulp-cell-date">
          <Typography className="pulp-film-date">
            {currentTab === 0
              ? formatDate(activity.planned_at)
              : formatDate(activity.watched_at)}
          </Typography>
        </TableCell>

        <TableCell className="pulp-cell-actions">
          <div className="pulp-actions">
            <IconButton
              className="pulp-icon-button"
              onClick={(event) => {
                event.stopPropagation()
                onToggleExpand(activity.id)
              }}
              title={expanded ? 'Свернуть' : 'Подробнее'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>

            {currentTab === 0 && (
              <>
                <IconButton
                  className="pulp-icon-button watched"
                  onClick={(event) => handleActionClick(event, onMarkAsWatched)}
                  title="Отметить как просмотренное"
                >
                  <WatchedIcon />
                </IconButton>

                <IconButton
                  className="pulp-icon-button delete"
                  onClick={(event) => handleActionClick(event, onRemove)}
                  title="Удалить из списка"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </div>
        </TableCell>
      </TableRow>

      <TableRow className="pulp-collapse-row">
        <TableCell colSpan={8} className="pulp-collapse-cell">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <div className="pulp-collapse-box">
              <div className="pulp-duration-line">
                <span className="pulp-duration-label">Длительность</span>
                <span className="pulp-duration-value">
                  {formatDuration(film.movie_length)}
                </span>
              </div>

              <Typography className="pulp-collapse-description">
                {film.description || 'Описание отсутствует.'}
              </Typography>

              <div className="pulp-entry-meta-line">
                <div className="pulp-entry-meta-item">
                  <span>Моя оценка</span>
                  <strong>{activity.rating ? `${activity.rating}/10` : '—'}</strong>
                </div>

                <div className="pulp-entry-meta-item">
                  <span>Добавлен</span>
                  <strong>{formatDate(activity.planned_at)}</strong>
                </div>

                {activity.watched_at && (
                  <div className="pulp-entry-meta-item">
                    <span>Просмотрен</span>
                    <strong>{formatDate(activity.watched_at)}</strong>
                  </div>
                )}
              </div>

              <table className="pulp-scores-table">
                <thead>
                  <tr>
                    <th>Источник</th>
                    <th>Оценка</th>
                    <th>Количество оценок</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Кинопоиск</td>
                    <td>{formatRating(film.kinopoisk_rating)}</td>
                    <td>{formatVotes(film.kinopoisk_votes)}</td>
                  </tr>

                  <tr>
                    <td>IMDb</td>
                    <td>{formatRating(film.imdb_rating)}</td>
                    <td>{formatVotes(film.imdb_votes)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default DiaryTableRow