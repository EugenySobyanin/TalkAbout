function ProfileSummaryCard({
  profile,
  isOwner = false,
  onAvatarChange,
  avatarUploading = false,
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

  return (
    <section className="profile-summary">
      <div className="profile-summary__main">
        <div className="profile-summary__avatar-wrap">
          <img
            src={profile.avatar_url || profile.avatar || ''}
            alt={profile.full_name || profile.username}
            className="profile-summary__avatar"
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
          <p className="profile-summary__eyebrow">Frame25</p>
          <h1 className="profile-summary__title">
            {profile.full_name || profile.username}
          </h1>
          <p className="profile-summary__username">@{profile.username}</p>

          <div className="profile-summary__meta">
            <span>Дата регистрации: {registeredLabel}</span>
            {profile.email ? <span>Email: {profile.email}</span> : null}
          </div>
        </div>
      </div>

      <div className="profile-summary__stats">
        <div className="profile-stat">
          <span className="profile-stat__value">{profile.subscriptions_count ?? 0}</span>
          <span className="profile-stat__label">Подписок</span>
        </div>

        <div className="profile-stat">
          <span className="profile-stat__value">{profile.subscribers_count ?? 0}</span>
          <span className="profile-stat__label">Подписчиков</span>
        </div>

        <div className="profile-stat">
          <span className="profile-stat__value">{profile.watched_count ?? 0}</span>
          <span className="profile-stat__label">Просмотрено</span>
        </div>

        <div className="profile-stat">
          <span className="profile-stat__value">{profile.planned_count ?? 0}</span>
          <span className="profile-stat__label">Планируемых</span>
        </div>

        <div className="profile-stat">
          <span className="profile-stat__value">{profile.compilations_count ?? 0}</span>
          <span className="profile-stat__label">Подборок</span>
        </div>
      </div>
    </section>
  )
}

export default ProfileSummaryCard