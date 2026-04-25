import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  createCompilation,
  deleteCompilation,
  getMyCompilations,
  patchCompilation,
  updateCompilation,
} from '../../api/compilations'
import CompilationsTabs from './components/CompilationsTabs'
import CompilationsTable from './components/CompilationsTable'
import CompilationDialog from './components/CompilationDialog'
import './CompilationsPage.css'

const CompilationsPage = () => {
  const navigate = useNavigate()

  const [currentTab, setCurrentTab] = useState(0)
  const [compilations, setCompilations] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCompilation, setEditingCompilation] = useState(null)

  useEffect(() => {
    fetchCompilations()
  }, [])

  const fetchCompilations = async () => {
    setLoading(true)

    try {
      const data = await getMyCompilations()
      setCompilations(data)
    } catch (error) {
      console.error('Ошибка загрузки подборок:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  const handleSubmitCompilation = async (formData) => {
    try {
      if (editingCompilation) {
        await updateCompilation(editingCompilation.id, formData)
      } else {
        await createCompilation(formData)
      }

      await fetchCompilations()
      setDialogOpen(false)
      setEditingCompilation(null)
    } catch (error) {
      console.error('Ошибка сохранения подборки:', error)
    }
  }

  const handleToggleVisibility = async (compilation) => {
    try {
      const newValue = !compilation.is_public

      await patchCompilation(compilation.id, {
        is_public: newValue,
      })

      setCompilations((prev) =>
        prev.map((item) =>
          item.id === compilation.id
            ? { ...item, is_public: newValue }
            : item
        )
      )
    } catch (error) {
      console.error('Ошибка изменения приватности подборки:', error)
    }
  }

  const handleUpdateCompilationFilms = async (compilation, films) => {
    try {
      await patchCompilation(compilation.id, {
        films: films.map((film) => film.id),
      })

      await fetchCompilations()
    } catch (error) {
      console.error('Ошибка обновления фильмов подборки:', error)
      throw error
    }
  }

  const handleDeleteCompilation = async (compilationId) => {
    if (!window.confirm('Точно удалить эту подборку?')) return

    try {
      await deleteCompilation(compilationId)

      setCompilations((prev) =>
        prev.filter((item) => item.id !== compilationId)
      )

      if (expandedRow === compilationId) {
        setExpandedRow(null)
      }
    } catch (error) {
      console.error('Ошибка удаления подборки:', error)
    }
  }

  const handleToggleExpand = (compilationId) => {
    setExpandedRow((prev) => (prev === compilationId ? null : compilationId))
  }

  const handleNavigateToFilm = (filmId) => {
    navigate(`/film/${filmId}`)
  }

  const handleOpenCreateDialog = () => {
    setEditingCompilation(null)
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (compilation) => {
    setEditingCompilation(compilation)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCompilation(null)
  }

  if (loading) {
    return (
      <div className="compilations-container">
        <div className="compilations-loading">
          <CircularProgress className="compilations-loading-spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="compilations-container">
      <div className="compilations-page-inner">
        <div className="compilations-title-wrapper">
          <button
            type="button"
            className="compilations-create-button"
            onClick={handleOpenCreateDialog}
          >
            Добавить подборку
          </button>
        </div>

        <CompilationsTabs
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />

        <CompilationsTable
          compilations={compilations}
          loading={loading}
          expandedRow={expandedRow}
          onToggleExpand={handleToggleExpand}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleDeleteCompilation}
          onEdit={handleOpenEditDialog}
          onNavigateToFilm={handleNavigateToFilm}
          onUpdateFilms={handleUpdateCompilationFilms}
        />
      </div>

      <CompilationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitCompilation}
        compilation={editingCompilation}
      />
    </div>
  )
}

export default CompilationsPage