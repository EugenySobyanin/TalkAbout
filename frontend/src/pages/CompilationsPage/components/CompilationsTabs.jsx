import React from 'react'
import { Tab, Tabs } from '@mui/material'

const CompilationsTabs = ({ currentTab, onTabChange }) => {
  return (
    <Tabs
      value={currentTab}
      onChange={onTabChange}
      className="compilations-tabs"
    >
      <Tab
        className="compilations-tab"
        label={
          <span className="compilations-tab-label">
            <span className="compilations-tab-icon" aria-hidden="true">
              📚
            </span>
            Мои подборки
          </span>
        }
      />

      <Tab
        className="compilations-tab"
        disabled
        label={
          <span className="compilations-tab-label">
            <span className="compilations-tab-icon" aria-hidden="true">
              🔥
            </span>
            Популярные
          </span>
        }
      />
    </Tabs>
  )
}

export default CompilationsTabs