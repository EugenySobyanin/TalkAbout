import React from 'react'
import { Tab, Tabs } from '@mui/material'

const DiaryTabs = ({ currentTab, onTabChange }) => {
  return (
    <Tabs
      value={currentTab}
      onChange={onTabChange}
      className="pulp-tabs"
    >
      <Tab
        className="pulp-tab"
        label={
          <span className="pulp-tab-label">
            <span className="pulp-tab-icon" aria-hidden="true">
              🎬
            </span>
            Планируемые
          </span>
        }
      />

      <Tab
        className="pulp-tab"
        label={
          <span className="pulp-tab-label">
            <span className="pulp-tab-icon" aria-hidden="true">
              🍿
            </span>
            Просмотренные
          </span>
        }
      />
    </Tabs>
  )
}

export default DiaryTabs