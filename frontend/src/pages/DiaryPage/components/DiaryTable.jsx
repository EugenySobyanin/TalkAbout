// src/pages/DiaryPage/components/DiaryTable.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import DiaryTableRow from './DiaryTableRow';

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
  onNavigateToFilm
}) => {
  const columns = [
    { id: 'number', label: '№', width: '50px' },
    { id: 'poster', label: 'Постер', width: '100px' },
    { id: 'name', label: 'Название', width: 'auto' },
    { id: 'year', label: 'Год', width: '80px' },
    { id: 'rating', label: 'Оценка', width: '150px' },
    { id: 'visibility', label: 'Приватность', width: '120px' },
    { 
      id: 'date', 
      label: currentTab === 0 ? 'Дата добавления' : 'Дата просмотра',
      width: '180px' 
    },
    { id: 'actions', label: '', width: '100px' },
  ];

  return (
    <TableContainer component={Paper} className="pulp-table-container">
      <Table>
        <TableHead className="pulp-table-head">
          <TableRow>
            {columns.map(column => (
              <TableCell 
                key={column.id}
                sx={{ width: column.width }}
              >
                {column.label}
              </TableCell>
            ))}
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
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Typography className="pulp-empty-message">
                  {currentTab === 0 
                    ? '🚫 У ТЕБЯ НЕТ ПЛАНИРУЕМЫХ ФИЛЬМОВ, ЧУВАК'
                    : '🚫 ТЫ ЕЩЕ НИЧЕГО НЕ ПОСМОТРЕЛ, ПРИЯТЕЛЬ'
                  }
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DiaryTable;