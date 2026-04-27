function ProfileSummaryCard({
  profile,
  isOwner = false,
  onAvatarChange,
  avatarUploading = false,
  onFollowToggle,
  followLoading = false,
}) {
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !onAvatarChange) return

    await onAvatarChange(file)
    e.target.value = ''
  }

  const registeredLabel = profile?.registered
    ? new Date(profile.registered).toLocaleDateString('ru-RU')
    : '—'

  const stats = [
    {
      label: 'Подписок',
      value: profile.subscriptions_count ?? 0,
    },
    {
      label: 'Подписчиков',
      value: profile.subscribers_count ?? 0,
    },
    {
      label: 'Просмотрено',
      value: profile.watched_count ?? 0,
    },
    {
      label: 'Планируемых',
      value: profile.planned_count ?? 0,
    },
    {
      label: 'Подборок',
      value: profile.compilations_count ?? 0,
    },
  ]

  return (
    <section className="profile-summary">
      <div className="profile-summary__main">
        <div className="profile-summary__avatar-wrap">
          <img
            src={profile.avatar_url || profile.avatar || '/placeholder-avatar.jpg'}
            alt={profile.full_name || profile.username}
            className="profile-summary__avatar"
            onError={(event) => {
              event.target.onerror = null
              event.target.src = '/placeholder-avatar.jpg'
            }}
          />

          {isOwner && (
            <label className="profile-summary__avatar-btn">
              {avatarUploading ? 'Загрузка...' : 'Сменить аватар'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        <div className="profile-summary__identity">
          <h1 className="profile-summary__title">
            {profile.full_name || profile.username}
          </h1>

          <p className="profile-summary__username">
            @{profile.username}
          </p>

          <div className="profile-summary__meta">
            <span>Дата регистрации: {registeredLabel}</span>
            {profile.email ? <span>Email: {profile.email}</span> : null}
          </div>

          <div className="profile-summary__stats">
            {stats.map((item) => (
              <div key={item.label} className="profile-stat">
                <span className="profile-stat__label">{item.label}</span>
                <span className="profile-stat__value">{item.value}</span>
              </div>
            ))}
          </div>

          {!isOwner && typeof onFollowToggle === 'function' && (
            <div className="profile-summary__actions">
              <button
                type="button"
                className={`profile-follow-btn ${
                  profile.is_subscribed ? 'profile-follow-btn--subscribed' : ''
                }`}
                onClick={onFollowToggle}
                disabled={followLoading}
              >
                {followLoading
                  ? 'Обработка...'
                  : profile.is_subscribed
                    ? 'Отписаться'
                    : 'Подписаться'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProfileSummaryCard