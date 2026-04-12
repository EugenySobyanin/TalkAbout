// src/pages/DiaryPage/components/RatingDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Rating
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import PulpButton from './PulpButton';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#F5E6CA',
    border: '3px solid #FFD700',
    borderRadius: 0,
    boxShadow: `
      0 0 0 2px #1A1A1A,
      10px 10px 0 rgba(255, 0, 0, 0.8)
    `,
  },
  '& .MuiDialogTitle-root': {
    fontFamily: '"Impact", sans-serif',
    fontSize: '1.8rem',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #FF0000',
  },
}));

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

const RatingDialog = ({ 
  open, 
  onClose, 
  filmName, 
  rating, 
  onRatingChange, 
  onSubmit 
}) => {
  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        ОЦЕНИ ЭТО ДЕРЬМО
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography sx={{ 
            fontFamily: '"Courier New", monospace',
            fontSize: '1.2rem',
            fontWeight: 600,
            mb: 2,
            color: '#1A1A1A'
          }}>
            {filmName}
          </Typography>
          <StyledRating
            value={rating}
            onChange={(e, newValue) => onRatingChange(newValue)}
            max={10}
            size="large"
            icon={<Star fontSize="inherit" />}
            emptyIcon={<StarBorder fontSize="inherit" />}
          />
          <Typography sx={{ 
            fontFamily: '"Impact", sans-serif',
            fontSize: '1.5rem',
            color: rating > 0 ? '#FF0000' : '#1A1A1A',
            mt: 1
          }}>
            {rating}/10
          </Typography>
          {rating === 0 && (
            <Typography sx={{ 
              fontFamily: '"Courier New", monospace',
              color: 'rgba(26, 26, 26, 0.6)',
              mt: 1
            }}>
              Да ладно, поставь хоть какую-то оценку!
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <PulpButton onClick={onClose}>
          ОТМЕНА
        </PulpButton>
        <PulpButton 
          onClick={onSubmit} 
          variant="contained"
        >
          ОТМЕТИТЬ КАК ПРОСМОТРЕННОЕ
        </PulpButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default RatingDialog;