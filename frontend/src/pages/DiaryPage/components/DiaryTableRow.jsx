// src/pages/DiaryPage/components/DiaryTableRow.jsx
import React from 'react';
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Rating,
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
  CheckCircle as WatchedIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#FFD700',
    filter: 'drop-shadow(0 0 4px #FF0000)',
  },
  '& .MuiRating-iconEmpty': {
    color: 'rgba(26, 26, 26, 0.3)',
  },
  '& .MuiRating-iconHover': {
    color: '#FF0000',
  },
});

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
  onNavigateToFilm
}) => {
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <>
      <TableRow className="pulp-table-row">
        <TableCell>
          <Typography className="pulp-film-number">
            #{index + 1}
          </Typography>
        </TableCell>
        
        <TableCell onClick={() => onNavigateToFilm(activity.film.id)}>
          <img 
            src={activity.film.poster} 
            alt={activity.film.name}
            className="pulp-poster"
          />
        </TableCell>
        
        <TableCell onClick={() => onNavigateToFilm(activity.film.id)}>
          <Typography className="pulp-film-name">
            {activity.film.name}
          </Typography>
        </TableCell>
        
        <TableCell onClick={() => onNavigateToFilm(activity.film.id)}>
          <Typography className="pulp-film-year">
            {activity.film.year || '—'}
          </Typography>
        </TableCell>
        
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StyledRating
              value={activity.rating || 0}
              max={10}
              onChange={(e, newValue) => onUpdateRating(activity, newValue)}
              icon={<StarIcon fontSize="small" />}
              emptyIcon={<StarBorderIcon fontSize="small" />}
            />
            {activity.rating && (
              <Typography variant="caption" className="pulp-rating-value">
                {activity.rating}/10
              </Typography>
            )}
          </Box>
        </TableCell>
        
        <TableCell>
          <IconButton
            className="pulp-icon-button"
            onClick={() => onToggleVisibility(
              activity, 
              currentTab === 0 ? 'planned' : 'watched'
            )}
          >
            {(currentTab === 0 && activity.is_public_for_planned) ||
             (currentTab === 1 && activity.is_public_for_watched)
              ? <VisibilityIcon />
              : <VisibilityOffIcon />
            }
          </IconButton>
          <Typography className="pulp-visibility-status">
            {(currentTab === 0 && activity.is_public_for_planned) ||
             (currentTab === 1 && activity.is_public_for_watched)
              ? 'ПУБЛИЧНЫЙ'
              : 'ПРИВАТНЫЙ'}
          </Typography>
        </TableCell>
        
        <TableCell>
          <Typography className="pulp-film-date">
            {currentTab === 0 
              ? formatDate(activity.planned_at)
              : formatDate(activity.watched_at)
            }
          </Typography>
        </TableCell>
        
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton 
              className="pulp-icon-button"
              onClick={() => onToggleExpand(activity.id)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            
            {currentTab === 0 && (
              <>
                <IconButton 
                  className="pulp-icon-button watched"
                  onClick={() => onMarkAsWatched(activity)}
                  title="ОТМЕТИТЬ КАК ПРОСМОТРЕННОЕ"
                >
                  <WatchedIcon />
                </IconButton>
                <IconButton 
                  className="pulp-icon-button delete"
                  onClick={() => onRemove(activity)}
                  title="УДАЛИТЬ ИЗ СПИСКА"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        </TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell colSpan={8} sx={{ p: 0 }}>
          <Collapse in={expanded}>
            <Box className="pulp-collapse-box">
              <Typography className="pulp-collapse-title">
                СЮЖЕТ
              </Typography>
              <Typography className="pulp-collapse-description">
                {activity.film.description || 'Описание отсутствует. Фильм настолько крутой, что не нуждается в описании.'}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Добавлен: ${formatDate(activity.planned_at)}`}
                  size="small"
                  className="pulp-chip"
                />
                {activity.watched_at && (
                  <Chip 
                    label={`Просмотрен: ${formatDate(activity.watched_at)}`}
                    size="small"
                    className="pulp-chip"
                  />
                )}
                <Chip 
                  label={`Рейтинг: ${activity.rating || 'Нет'}/10`}
                  size="small"
                  className="pulp-chip"
                  icon={<StarIcon />}
                />
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default DiaryTableRow;