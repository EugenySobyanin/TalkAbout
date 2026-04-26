import ProfileSummaryCard from '../ProfileSummaryCard/ProfileSummaryCard'
import ProfileTopFilms from '../ProfileTopFilms/ProfileTopFilms'
import ProfileFilmsTable from '../ProfileFilmsTable/ProfileFilmsTable'
import ProfileCompilationsTable from '../ProfileCompilationsTable/ProfileCompilationsTable'
import './ProfileView.css'

function ProfileView({
  profile,
  isOwner = false,
  onAvatarChange,
  avatarUploading = false,
}) {
  return (
    <div className="profile-page">
      <div className="profile-page__layout">
        <main className="profile-page__main">
          <ProfileSummaryCard
            profile={profile}
            isOwner={isOwner}
            onAvatarChange={onAvatarChange}
            avatarUploading={avatarUploading}
          />

          <div className="profile-page__films-grid">
            <ProfileFilmsTable
              title="Просмотренные фильмы"
              items={profile.watched_activities || []}
              emptyText="Просмотренных фильмов пока нет"
              mode="watched"
            />

            <ProfileFilmsTable
              title="Планируемые фильмы"
              items={profile.planned_activities || []}
              emptyText="Планируемых фильмов пока нет"
              mode="planned"
            />
          </div>

          <div className="profile-page__compilations-row">
            <ProfileCompilationsTable
              items={profile.compilations || []}
              emptyText="Подборок пока нет"
            />
          </div>
        </main>

        <aside className="profile-page__aside">
          <ProfileTopFilms
            isOwner={isOwner}
            userId={profile.id || profile.user_id}
            initialItems={profile.top_films || []}
          />
        </aside>
      </div>
    </div>
  )
}

export default ProfileView