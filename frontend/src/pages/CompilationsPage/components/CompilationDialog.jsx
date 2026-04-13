// src/pages/CompilationsPage/components/CompilationDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#1C2128',
    border: '2px solid #FFD700',
    borderRadius: 8,
    minWidth: 500,
  },
  '& .MuiDialogTitle-root': {
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#E6EDF3',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #30363D',
  },
  '& .MuiInputLabel-root': {
    color: '#8B949E',
  },
  '& .MuiOutlinedInput-root': {
    color: '#E6EDF3',
    '& fieldset': {
      borderColor: '#30363D',
    },
    '&:hover fieldset': {
      borderColor: '#FFD700',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
    },
  },
  '& .MuiFormControlLabel-label': {
    color: '#E6EDF3',
  },
}));

const CompilationDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  compilation = null 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: false,
    films: []
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (compilation) {
      setFormData({
        title: compilation.title || '',
        description: compilation.description || '',
        is_public: compilation.is_public || false,
        films: compilation.films || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        is_public: false,
        films: []
      });
    }
  }, [compilation, open]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'is_public' ? checked : value
    }));
    
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    }
    
    if (formData.title.length > 255) {
      newErrors.title = 'Название не может быть длиннее 255 символов';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Описание не может быть длиннее 500 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const submitData = {
      ...formData,
      films: formData.films.map(f => f.id)
    };
    
    onSubmit(submitData);
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <DialogTitle>
        {compilation ? 'РЕДАКТИРОВАТЬ ПОДБОРКУ' : 'НОВАЯ ПОДБОРКА'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Название подборки"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            required
            placeholder="Мои любимые фильмы"
          />
          
          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description || `${formData.description.length}/500`}
            multiline
            rows={3}
            placeholder="Опишите вашу подборку..."
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_public}
                onChange={handleChange}
                name="is_public"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#FFD700',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#FFD700',
                  },
                }}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  {formData.is_public ? '🌍 Публичная подборка' : '🔒 Приватная подборка'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8B949E', display: 'block' }}>
                  {formData.is_public 
                    ? 'Все пользователи смогут видеть эту подборку'
                    : 'Только вы сможете видеть эту подборку'
                  }
                </Typography>
              </Box>
            }
          />
          
          <Alert 
            severity="info" 
            sx={{ 
              backgroundColor: '#21262D',
              color: '#E6EDF3',
              border: '1px solid #30363D',
              '& .MuiAlert-icon': {
                color: '#FFD700'
              }
            }}
          >
            <Typography variant="body2">
              💡 Фильмы можно будет добавить позже из карточки фильма или при редактировании подборки.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <button 
          onClick={onClose}
          className="compilations-dialog-button cancel"
        >
          ОТМЕНА
        </button>
        <button 
          onClick={handleSubmit}
          className="compilations-dialog-button submit"
        >
          {compilation ? 'СОХРАНИТЬ' : 'СОЗДАТЬ'}
        </button>
      </DialogActions>
      
      <style jsx>{`
        .compilations-dialog-button {
          padding: 10px 20px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .compilations-dialog-button.cancel {
          background-color: transparent;
          color: #8B949E;
          border: 1px solid #30363D;
        }
        
        .compilations-dialog-button.cancel:hover {
          background-color: #21262D;
          color: #E6EDF3;
        }
        
        .compilations-dialog-button.submit {
          background-color: #FFD700;
          color: #0D1117;
        }
        
        .compilations-dialog-button.submit:hover {
          background-color: #FFC700;
          transform: translateY(-1px);
        }
      `}</style>
    </StyledDialog>
  );
};

export default CompilationDialog;