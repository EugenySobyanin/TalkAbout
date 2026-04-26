import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyProfile } from '../../api/users'
import './SubscriptionsPage.css'

const TABS = {
  subscriptions: 'subscriptions',
  subscribers: 'subscribers',
}

const getUserFromFollowItem = (item, type) => {
  if (!item) return null

  if (type === TABS.subscriptions) {
    return item.following || item.user || item
  }

  return item.follower || item.user || item
}

const getUserFullName = (user) => {
  const fullName = user?.full_name?.trim()

  if (fullName) return fullName

  const firstName = user?.first_name || ''
  const lastName = user?.last_name || ''
  const name = `${firstName} ${lastName}`.trim()

  return name || user?.username || 'Пользователь'
}

const getUserAvatar = (user) => {
  return user?.avatar_url || user?.avatar || '/placeholder-avatar.jpg'
}

const normalizeUsersList = (items = [], type) => {
  if (!Array.isArray(items)) return []

  return items
    .map((item) => getUserFromFollowItem(item, type))
    .filter(Boolean)
}

function SubscriptionsPage() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState(TABS.subscriptions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile()
        setProfile(data)
      } catch (error) {
        console.error('Ошибка загрузки подписок:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const subscriptions = useMemo(() => {
    return normalizeUsersList(
      profile?.user_subscriptions ||
        profile?.subscriptions ||
        profile?.following ||
        [],
      TABS.subscriptions
    )
  }, [profile])

  const subscribers = useMemo(() => {
    return normalizeUsersList(
      profile?.user_subscribers ||
        profile?.subscribers ||
        profile?.followers ||
        [],
      TABS.subscribers
    )
  }, [profile])

  const activeUsers = activeTab === TABS.subscriptions
    ? subscriptions
    : subscribers

  const activeEmptyText = activeTab === TABS.subscriptions
    ? 'Вы пока ни на кого не подписаны'
    : 'У вас пока нет подписчиков'

  const handleOpenProfile = (userId) => {
    navigate(`/users/${userId}`)
  }

  if (loading) {
    return (
      <div className="subscriptions-page">
        <div className="subscriptions-loading">
          <div className="subscriptions-loading-spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="subscriptions-page">
      <div className="subscriptions-page-inner">
        <div className="subscriptions-tabs">
          <button
            type="button"
            className={`subscriptions-tab ${
              activeTab === TABS.subscriptions ? 'subscriptions-tab--active' : ''
            }`}
            onClick={() => setActiveTab(TABS.subscriptions)}
          >
            <span className="subscriptions-tab__icon" aria-hidden="true">
              🎬
            </span>
            <span>Подписки</span>
            <span className="subscriptions-tab__count">
              {subscriptions.length}
            </span>
          </button>

          <button
            type="button"
            className={`subscriptions-tab ${
              activeTab === TABS.subscribers ? 'subscriptions-tab--active' : ''
            }`}
            onClick={() => setActiveTab(TABS.subscribers)}
          >
            <span className="subscriptions-tab__icon" aria-hidden="true">
              👥
            </span>
            <span>Подписчики</span>
            <span className="subscriptions-tab__count">
              {subscribers.length}
            </span>
          </button>
        </div>

        <div className="subscriptions-table-container">
          <div className="subscriptions-table">
            <div className="subscriptions-table-head">
              <div className="subscriptions-cell-number">№</div>
              <div className="subscriptions-cell-user">Пользователь</div>
              <div className="subscriptions-cell-username">Никнейм</div>
              <div className="subscriptions-cell-action" />
            </div>

            <div className="subscriptions-table-body">
              {activeUsers.length > 0 ? (
                activeUsers.map((user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    className="subscriptions-table-row"
                    onClick={() => handleOpenProfile(user.id)}
                  >
                    <div className="subscriptions-cell-number">
                      <span className="subscriptions-user-number">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="subscriptions-cell-user">
                      <img
                        src={getUserAvatar(user)}
                        alt={getUserFullName(user)}
                        className="subscriptions-user-avatar"
                        onError={(event) => {
                          event.target.onerror = null
                          event.target.src = '/placeholder-avatar.jpg'
                        }}
                      />

                      <span className="subscriptions-user-info">
                        <span className="subscriptions-user-name">
                          {getUserFullName(user)}
                        </span>

                        <span className="subscriptions-user-meta">
                          {user.registered
                            ? `На сайте с ${new Date(user.registered).toLocaleDateString('ru-RU')}`
                            : 'Профиль пользователя'}
                        </span>
                      </span>
                    </div>

                    <div className="subscriptions-cell-username">
                      <span className="subscriptions-username">
                        @{user.username || 'unknown'}
                      </span>
                    </div>

                    <div className="subscriptions-cell-action">
                      <span className="subscriptions-open-profile">
                        Открыть профиль
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="subscriptions-empty">
                  {activeEmptyText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionsPage