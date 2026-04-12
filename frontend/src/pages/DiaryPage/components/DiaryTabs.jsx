// src/pages/DiaryPage/components/DiaryTabs.jsx
import React from 'react';
import { Tabs, Tab } from '@mui/material';

const DiaryTabs = ({ currentTab, onTabChange }) => {
  return (
    <Tabs 
      value={currentTab} 
      onChange={onTabChange}
      className="pulp-tabs"
    >
      <Tab 
        label="🎬 Планируемые" 
        className="pulp-tab"
      />
      <Tab 
        label="🍿 Просмотренные" 
        className="pulp-tab"
      />
    </Tabs>
  );
};

export default DiaryTabs;