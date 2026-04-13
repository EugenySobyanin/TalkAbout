// src/pages/CompilationsPage/components/CompilationsTable.jsx
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
import CompilationsTableRow from './CompilationsTableRow';

const CompilationsTable = ({ 
  compilations, 
  loading,
  expandedRow,
  onToggleExpand,
  onDelete,
  onNavigateToFilm
}) => {
  const columns = [
    { id: 'number', label: '№', width: '50px' },
    { id: 'name', label: 'Название', width: 'auto' },
    { id: 'count', label: 'Фильмов', width: '100px' },
    { id: 'visibility', label: 'Приватность', width: '120px' },
    { id: 'actions', label: '', width: '100px' },
  ];

  return (
    <TableContainer component={Paper} className="compilations-table-container">
      <Table>
        <TableHead className="compilations-table-head">
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
          {compilations.map((compilation, index) => (
            <CompilationsTableRow
              key={compilation.id}
              compilation={compilation}
              index={index}
              expanded={expandedRow === compilation.id}
              onToggleExpand={onToggleExpand}
              onDelete={onDelete}
              onNavigateToFilm={onNavigateToFilm}
            />
          ))}
          
          {compilations.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Typography className="compilations-empty-message">
                  🚫 У ТЕБЯ НЕТ ПОДБОРОК. СОЗДАЙ ПЕРВУЮ!
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CompilationsTable;