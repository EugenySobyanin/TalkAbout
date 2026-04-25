import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import CompilationFilmSelector from './CompilationFilmSelector'

const CompilationDialog = ({
  open,
  onClose,
  onSubmit,
  compilation = null,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: false,
    films: [],
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (compilation) {
      setFormData({
        title: compilation.title || '',
        description: compilation.description || '',
        is_public: Boolean(compilation.is_public),
        films: compilation.films || [],
      })
    } else {
      setFormData({
        title: '',
        description: '',
        is_public: false,
        films: [],
      })
    }

    setErrors({})
  }, [compilation, open])

  const handleChange = (event) => {
    const { name, value, checked } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'is_public' ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFilmsChange = (films) => {
    setFormData((prev) => ({
      ...prev,
      films,
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно'
    }

    if (formData.title.length > 255) {
      newErrors.title = 'Название не может быть длиннее 255 символов'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Описание не может быть длиннее 500 символов'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      is_public: formData.is_public,
      films: formData.films.map((film) => film.id),
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="compilations-dialog"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="compilations-dialog__title">
        {compilation ? 'Редактировать подборку' : 'Новая подборка'}
      </DialogTitle>

      <DialogContent className="compilations-dialog__content">
        <div className="compilations-dialog__form">
          <TextField
            fullWidth
            label="Название подборки"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={Boolean(errors.title)}
            helperText={errors.title}
            required
            placeholder="Мои любимые фильмы"
            className="compilations-dialog__field"
          />

          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={Boolean(errors.description)}
            helperText={errors.description || `${formData.description.length}/500`}
            multiline
            rows={3}
            placeholder="Опишите вашу подборку..."
            className="compilations-dialog__field"
          />

          <FormControlLabel
            className="compilations-dialog__switch-row"
            control={
              <Switch
                checked={formData.is_public}
                onChange={handleChange}
                name="is_public"
                className="compilations-switch"
              />
            }
            label={
              <div className="compilations-dialog__switch-label">
                <Typography className="compilations-dialog__switch-title">
                  {formData.is_public ? 'Публичная подборка' : 'Приватная подборка'}
                </Typography>

                <Typography className="compilations-dialog__switch-hint">
                  {formData.is_public
                    ? 'Все пользователи смогут видеть эту подборку'
                    : 'Только вы сможете видеть эту подборку'}
                </Typography>
              </div>
            }
          />

          <div className="compilations-dialog__films-block">
            <Typography className="compilations-dialog__section-title">
              Фильмы в подборке
            </Typography>

            <CompilationFilmSelector
              selectedFilms={formData.films}
              onChange={handleFilmsChange}
            />
          </div>

          <Alert className="compilations-dialog__alert" severity="info">
            Фильмы можно добавить сейчас или позже внутри раскрытой подборки.
          </Alert>
        </div>
      </DialogContent>

      <DialogActions className="compilations-dialog__actions">
        <button
          type="button"
          onClick={onClose}
          className="compilations-dialog-button compilations-dialog-button--cancel"
        >
          Отмена
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="compilations-dialog-button compilations-dialog-button--submit"
        >
          {compilation ? 'Сохранить' : 'Создать'}
        </button>
      </DialogActions>
    </Dialog>
  )
}

export default CompilationDialog