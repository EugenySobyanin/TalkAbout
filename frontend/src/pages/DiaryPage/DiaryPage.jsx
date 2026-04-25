import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getPlannedFilms,
  getWatchedFilms,
  toggleVisibility,
  removeFromPlanned,
  updateRating,
  markAsWatchedWithRating,
} from '../../api/activities'
import DiaryTabs from './components/DiaryTabs'
import DiaryTable from './components/DiaryTable'
import RatingDialog from './components/RatingDialog'
import './DiaryPage.css'

const DiaryPage = () => {
  const navigate = useNavigate()

  const [currentTab, setCurrentTab] = useState(0)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [tempRating, setTempRating] = useState(0)

  useEffect(() => {
    fetchActivities()
  }, [currentTab])

  const fetchActivities = async () => {
    setLoading(true)

    try {
      const data = currentTab === 0
        ? await getPlannedFilms()
        : await getWatchedFilms()

      setActivities(data)
    } catch (error) {
      console.error('Ошибка загрузки активностей:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
    setExpandedRow(null)
  }

  const handleToggleVisibility = async (activity, type) => {
    try {
      const field = type === 'planned'
        ? 'is_public_for_planned'
        : 'is_public_for_watched'

      const newValue = !activity[field]

      await toggleVisibility(activity.id, field, newValue)

      setActivities((prev) =>
        prev.map((item) =>
          item.id === activity.id
            ? { ...item, [field]: newValue }
            : item
        )
      )
    } catch (error) {
      console.error('Ошибка изменения публичности:', error)
    }
  }

  const handleRemoveFromPlanned = async (activity) => {
    try {
      await removeFromPlanned(activity.id)

      setActivities((prev) =>
        prev.filter((item) => item.id !== activity.id)
      )
    } catch (error) {
      console.error('Ошибка удаления из планируемых:', error)
    }
  }

  const handleUpdateRating = async (activity, newRating) => {
    try {
      await updateRating(activity.id, newRating)

      setActivities((prev) =>
        prev.map((item) =>
          item.id === activity.id
            ? { ...item, rating: newRating }
            : item
        )
      )
    } catch (error) {
      console.error('Ошибка обновления оценки:', error)
    }
  }

  const handleMarkAsWatched = (activity) => {
    setSelectedActivity(activity)
    setTempRating(activity.rating || 0)
    setRatingDialogOpen(true)
  }

  const handleMarkAsWatchedSubmit = async () => {
    try {
      await markAsWatchedWithRating(selectedActivity.id, tempRating)

      setActivities((prev) =>
        prev.filter((item) => item.id !== selectedActivity.id)
      )

      setRatingDialogOpen(false)
      setSelectedActivity(null)
    } catch (error) {
      console.error('Ошибка отметки как просмотренного:', error)
    }
  }

  const handleNavigateToFilm = (filmId) => {
    navigate(`/film/${filmId}`)
  }

  const handleToggleExpand = (activityId) => {
    setExpandedRow((prev) => (prev === activityId ? null : activityId))
  }

  if (loading) {
    return (
      <div className="pulp-container">
        <div className="pulp-loading">
          <div className="pulp-loading-spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="pulp-container">
      <div className="pulp-page-inner">
        <DiaryTabs
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />

        <DiaryTable
          activities={activities}
          currentTab={currentTab}
          loading={loading}
          expandedRow={expandedRow}
          onToggleExpand={handleToggleExpand}
          onToggleVisibility={handleToggleVisibility}
          onUpdateRating={handleUpdateRating}
          onMarkAsWatched={handleMarkAsWatched}
          onRemove={handleRemoveFromPlanned}
          onNavigateToFilm={handleNavigateToFilm}
        />
      </div>

      <RatingDialog
        open={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        filmName={selectedActivity?.film.name}
        rating={tempRating}
        onRatingChange={setTempRating}
        onSubmit={handleMarkAsWatchedSubmit}
      />
    </div>
  )
}

export default DiaryPage