import { useEffect, useState } from 'react'
import { getMyProfile, updateMyAvatar } from '../../api/users'
import ProfileView from '../../components/ProfileView/ProfileView'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile()
        setProfile(data)
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleAvatarChange = async (file) => {
    try {
      setAvatarUploading(true)

      const formData = new FormData()
      formData.append('avatar', file)

      const updatedProfile = await updateMyAvatar(formData)
      setProfile(updatedProfile)
    } catch (error) {
      console.error('Ошибка обновления аватара:', error)
    } finally {
      setAvatarUploading(false)
    }
  }

  if (loading) {
    return <div className="profile-loading">Загрузка профиля...</div>
  }

  if (!profile) {
    return <div className="profile-loading">Не удалось загрузить профиль</div>
  }

  return (
    <ProfileView
      profile={profile}
      isOwner
      onAvatarChange={handleAvatarChange}
      avatarUploading={avatarUploading}
    />
  )
}

export default ProfilePage