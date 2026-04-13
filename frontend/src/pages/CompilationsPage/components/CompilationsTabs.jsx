// src/pages/CompilationsPage/components/CompilationsTabs.jsx
import React from 'react';
import { Tabs, Tab } from '@mui/material';

const CompilationsTabs = ({ currentTab, onTabChange }) => {
  return (
    <Tabs 
      value={currentTab} 
      onChange={onTabChange}
      className="compilations-tabs"
    >
      <Tab 
        label="📚 МОИ ПОДБОРКИ" 
        className="compilations-tab"
      />
      <Tab 
        label="🔥 ПОПУЛЯРНЫЕ" 
        className="compilations-tab"
        disabled
      />
    </Tabs>
  );
};

export default CompilationsTabs;