import React from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import DiaryTableRow from './DiaryTableRow'

const DiaryTable = ({
  activities,
  currentTab,
  loading,
  expandedRow,
  onToggleExpand,
  onToggleVisibility,
  onUpdateRating,
  onMarkAsWatched,
  onRemove,
  onNavigateToFilm,
}) => {
  const emptyText = currentTab === 0
    ? 'У тебя нет планируемых фильмов'
    : 'Ты ещё ничего не посмотрел'

  return (
    <TableContainer component={Paper} className="pulp-table-container">
      <Table className="pulp-table">
        <TableHead className="pulp-table-head">
          <TableRow>
            <TableCell className="pulp-cell-number">№</TableCell>
            <TableCell className="pulp-cell-poster">Постер</TableCell>
            <TableCell className="pulp-cell-name">Название</TableCell>
            <TableCell className="pulp-cell-year">Год</TableCell>
            <TableCell className="pulp-cell-rating">Оценка</TableCell>
            <TableCell className="pulp-cell-visibility">Приватность</TableCell>
            <TableCell className="pulp-cell-date">
              {currentTab === 0 ? 'Дата добавления' : 'Дата просмотра'}
            </TableCell>
            <TableCell className="pulp-cell-actions" />
          </TableRow>
        </TableHead>

        <TableBody>
          {activities.map((activity, index) => (
            <DiaryTableRow
              key={activity.id}
              activity={activity}
              index={index}
              currentTab={currentTab}
              expanded={expandedRow === activity.id}
              onToggleExpand={onToggleExpand}
              onToggleVisibility={onToggleVisibility}
              onUpdateRating={onUpdateRating}
              onMarkAsWatched={onMarkAsWatched}
              onRemove={onRemove}
              onNavigateToFilm={onNavigateToFilm}
            />
          ))}

          {activities.length === 0 && !loading && (
            <TableRow>
              <TableCell
                colSpan={8}
                align="center"
                className="pulp-empty-cell"
              >
                <Typography className="pulp-empty-message">
                  {emptyText}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default DiaryTable