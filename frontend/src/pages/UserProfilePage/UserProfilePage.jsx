import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUserProfile, followUser, unfollowUser } from '../../api/users'
import ProfileView from '../../components/ProfileView/ProfileView'

function UserProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)

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

  const handleFollowToggle = async () => {
    if (!profile || followLoading || profile.is_own_profile) {
      return
    }

    try {
      setFollowLoading(true)

      const isSubscribed = Boolean(profile.is_subscribed)

      const response = isSubscribed
        ? await unfollowUser(profile.id)
        : await followUser(profile.id)

      setProfile((currentProfile) => {
        if (!currentProfile) {
          return currentProfile
        }

        const fallbackSubscribersCount = Math.max(
          0,
          Number(currentProfile.subscribers_count || 0) + (isSubscribed ? -1 : 1)
        )

        return {
          ...currentProfile,
          is_subscribed: Boolean(response.is_subscribed),
          subscribers_count:
            typeof response.subscribers_count === 'number'
              ? response.subscribers_count
              : fallbackSubscribersCount,
        }
      })
    } catch (error) {
      console.error('Ошибка изменения подписки:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return <div className="profile-loading">Загрузка профиля...</div>
  }

  if (!profile) {
    return <div className="profile-loading">Профиль не найден</div>
  }

  return (
    <ProfileView
      profile={profile}
      isOwner={Boolean(profile.is_own_profile)}
      onFollowToggle={handleFollowToggle}
      followLoading={followLoading}
    />
  )
}

export default UserProfilePage