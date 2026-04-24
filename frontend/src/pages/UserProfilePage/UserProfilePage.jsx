import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUserProfile } from '../../api/users'
import ProfileView from '../../components/ProfileView/ProfileView'

function UserProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile(id)
        setProfile(data)
      } catch (error) {
        console.error('Ошибка загрузки профиля пользователя:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [id])

  if (loading) {
    return <div className="profile-loading">Загрузка профиля...</div>
  }

  if (!profile) {
    return <div className="profile-loading">Профиль не найден</div>
  }

  return <ProfileView profile={profile} isOwner={false} />
}

export default UserProfilePage