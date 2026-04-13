// src/pages/CompilationsPage/CompilationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMyCompilations, createCompilation, deleteCompilation } from '../../api/compilations';
import CompilationsTabs from './components/CompilationsTabs';
import CompilationsTable from './components/CompilationsTable';
import CompilationDialog from './components/CompilationDialog';
import './CompilationsPage.css';

const CompilationsPage = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [compilations, setCompilations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompilation, setEditingCompilation] = useState(null);

  useEffect(() => {
    fetchCompilations();
  }, []);

  const fetchCompilations = async () => {
    setLoading(true);
    try {
      const data = await getMyCompilations();
      setCompilations(data);
    } catch (error) {
      console.error('Ошибка загрузки подборок:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleCreateCompilation = async (formData) => {
    try {
      const newCompilation = await createCompilation(formData);
      setCompilations(prev => [...prev, newCompilation]);
      setDialogOpen(false);
    } catch (error) {
      console.error('Ошибка создания подборки:', error);
    }
  };

  const handleDeleteCompilation = async (compilationId) => {
    if (!window.confirm('Точно удалить эту подборку?')) return;
    
    try {
      await deleteCompilation(compilationId);
      setCompilations(prev => prev.filter(item => item.id !== compilationId));
      if (expandedRow === compilationId) {
        setExpandedRow(null);
      }
    } catch (error) {
      console.error('Ошибка удаления подборки:', error);
    }
  };

  const handleToggleExpand = (compilationId) => {
    setExpandedRow(expandedRow === compilationId ? null : compilationId);
  };

  const handleNavigateToFilm = (filmId) => {
    navigate(`/films/${filmId}`);
  };

  const handleOpenCreateDialog = () => {
    setEditingCompilation(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCompilation(null);
  };

  if (loading) {
    return (
      <Box className="compilations-container">
        <Box className="compilations-loading">
          <CircularProgress className="compilations-loading-spinner" />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="compilations-container">
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box className="compilations-title-wrapper">
          <h1 className="compilations-title">МОИ ПОДБОРКИ</h1>
        </Box>

        <CompilationsTabs 
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />

        <CompilationsTable 
          compilations={compilations}
          loading={loading}
          expandedRow={expandedRow}
          onToggleExpand={handleToggleExpand}
          onDelete={handleDeleteCompilation}
          onNavigateToFilm={handleNavigateToFilm}
        />

        <Fab 
          color="primary" 
          className="compilations-fab"
          onClick={handleOpenCreateDialog}
        >
          <AddIcon />
        </Fab>
      </Box>

      <CompilationDialog 
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleCreateCompilation}
        compilation={editingCompilation}
      />
    </Box>
  );
};

export default CompilationsPage;