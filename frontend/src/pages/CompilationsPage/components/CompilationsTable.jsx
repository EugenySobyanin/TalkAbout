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
import CompilationsTableRow from './CompilationsTableRow'

const CompilationsTable = ({
  compilations = [],
  loading = false,
  expandedRow = null,
  onToggleExpand,
  onToggleVisibility,
  onDelete,
  onEdit,
  onNavigateToFilm,
  onUpdateFilms,
}) => {
  const safeCompilations = Array.isArray(compilations) ? compilations : []

  return (
    <TableContainer component={Paper} className="compilations-table-container">
      <Table className="compilations-table">
        <TableHead className="compilations-table-head">
          <TableRow>
            <TableCell className="compilations-cell-number">№</TableCell>
            <TableCell className="compilations-cell-name">Название</TableCell>
            <TableCell className="compilations-cell-posters">Фильмы</TableCell>
            <TableCell className="compilations-cell-count">Всего</TableCell>
            <TableCell className="compilations-cell-visibility">Приватность</TableCell>
            <TableCell className="compilations-cell-actions" />
          </TableRow>
        </TableHead>

        <TableBody>
          {safeCompilations.map((compilation, index) => (
            <CompilationsTableRow
              key={compilation.id}
              compilation={compilation}
              index={index}
              expanded={expandedRow === compilation.id}
              onToggleExpand={onToggleExpand}
              onToggleVisibility={onToggleVisibility}
              onDelete={onDelete}
              onEdit={onEdit}
              onNavigateToFilm={onNavigateToFilm}
              onUpdateFilms={onUpdateFilms}
            />
          ))}

          {safeCompilations.length === 0 && !loading && (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
                className="compilations-empty-cell"
              >
                <Typography className="compilations-empty-message">
                  У тебя пока нет подборок. Создай первую.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CompilationsTable