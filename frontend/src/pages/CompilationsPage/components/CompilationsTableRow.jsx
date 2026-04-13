// src/pages/CompilationsPage/components/CompilationsTableRow.jsx
import React from 'react';
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  IconButton,
  Collapse,
  Chip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const CompilationsTableRow = ({ 
  compilation, 
  index, 
  expanded,
  onToggleExpand,
  onDelete,
  onNavigateToFilm
}) => {
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <>
      <TableRow className="compilations-table-row">
        <TableCell onClick={() => onToggleExpand(compilation.id)}>
          <Typography className="compilations-number">
            #{index + 1}
          </Typography>
        </TableCell>
        
        <TableCell onClick={() => onToggleExpand(compilation.id)}>
          <Typography className="compilations-name">
            {compilation.title || 'Без названия'}
          </Typography>
          {compilation.description && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'var(--comp-text-secondary)',
                display: 'block',
                fontSize: '0.8rem',
                mt: 0.5
              }}
            >
              {compilation.description.length > 50 
                ? compilation.description.substring(0, 50) + '...'
                : compilation.description
              }
            </Typography>
          )}
        </TableCell>
        
        <TableCell onClick={() => onToggleExpand(compilation.id)}>
          <Typography className="compilations-count">
            {compilation.films_count || 0}
          </Typography>
        </TableCell>
        
        <TableCell onClick={() => onToggleExpand(compilation.id)}>
          <Box className="compilations-visibility">
            {compilation.is_public ? (
              <VisibilityIcon sx={{ fontSize: 20, color: 'var(--comp-success)' }} />
            ) : (
              <VisibilityOffIcon sx={{ fontSize: 20, color: 'var(--comp-text-secondary)' }} />
            )}
            <Typography className="compilations-visibility-status">
              {compilation.is_public ? 'ПУБЛИЧНЫЙ' : 'ПРИВАТНЫЙ'}
            </Typography>
          </Box>
        </TableCell>
        
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton 
              className="compilations-icon-button"
              onClick={() => onToggleExpand(compilation.id)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            
            <IconButton 
              className="compilations-icon-button delete"
              onClick={() => onDelete(compilation.id)}
              title="УДАЛИТЬ ПОДБОРКУ"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell colSpan={5} sx={{ p: 0 }}>
          <Collapse in={expanded}>
            <Box className="compilations-collapse-box">
              <Typography className="compilations-collapse-title">
                📋 ИНФОРМАЦИЯ О ПОДБОРКЕ
              </Typography>
              
              <Typography className="compilations-description">
                {compilation.description || 'Описание отсутствует. Здесь могло быть ваше описание.'}
              </Typography>
              
              <Box className="compilations-info-chips">
                <Chip 
                  icon={<CalendarIcon />}
                  label={`Создана: ${compilation.created_at || '—'}`}
                  size="small"
                  className="compilations-chip"
                />
                {compilation.updated_at && (
                  <Chip 
                    icon={<CalendarIcon />}
                    label={`Обновлена: ${compilation.updated_at}`}
                    size="small"
                    className="compilations-chip"
                  />
                )}
                <Chip 
                  label={`Фильмов: ${compilation.films_count || 0}`}
                  size="small"
                  className="compilations-chip"
                />
              </Box>
              
              {compilation.films && compilation.films.length > 0 && (
                <>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'var(--comp-text)',
                      mt: 3,
                      mb: 2
                    }}
                  >
                    🎬 ФИЛЬМЫ В ПОДБОРКЕ
                  </Typography>
                  
                  <Box className="compilations-films-grid">
                    {compilation.films.map(film => (
                      <Box 
                        key={film.id} 
                        className="compilations-film-card"
                        onClick={() => onNavigateToFilm(film.id)}
                      >
                        <img 
                          src={film.poster} 
                          alt={film.name}
                          className="compilations-film-poster"
                        />
                        <Box className="compilations-film-info">
                          <Typography className="compilations-film-title">
                            {film.name}
                          </Typography>
                          <Typography className="compilations-film-year">
                            {film.year || '—'}
                          </Typography>
                          <Box className="compilations-film-rating">
                            <StarIcon sx={{ fontSize: 16 }} />
                            <span>
                              {film.kinopoisk_rating 
                                ? `KP: ${film.kinopoisk_rating}`
                                : film.imdb_rating 
                                  ? `IMDb: ${film.imdb_rating}`
                                  : 'Нет рейтинга'
                              }
                            </span>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default CompilationsTableRow;