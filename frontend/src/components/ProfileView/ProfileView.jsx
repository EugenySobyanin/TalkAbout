import ProfileSummaryCard from '../ProfileSummaryCard/ProfileSummaryCard'
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
      <ProfileSummaryCard
        profile={profile}
        isOwner={isOwner}
        onAvatarChange={onAvatarChange}
        avatarUploading={avatarUploading}
      />

      <div className="profile-page__content">
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

        <ProfileCompilationsTable
          items={profile.compilations || []}
          emptyText="Подборок пока нет"
        />
      </div>
    </div>
  )
}

export default ProfileView