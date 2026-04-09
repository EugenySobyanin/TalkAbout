// src/pages/FilmPage/components/FilmVideos.jsx

import { useState } from 'react'

function FilmVideos({ videos }) {
  const [activeVideo, setActiveVideo] = useState(null)
  
  // Фильтруем видео по типам
  const trailers = videos.filter(v => 
    v.type?.toLowerCase().includes('trailer') || 
    v.name?.toLowerCase().includes('трейлер')
  )
  
  const teasers = videos.filter(v => 
    v.type?.toLowerCase().includes('teaser') || 
    v.name?.toLowerCase().includes('тизер')
  )
  
  const otherVideos = videos.filter(v => 
    !trailers.includes(v) && !teasers.includes(v)
  )
  
  // Если нет видео
  if (!videos || videos.length === 0) {
    return null
  }

  // Функция для получения ID видео из YouTube URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    
    return null
  }

  // Рендер карточки видео
  const renderVideoCard = (video, index) => {
    const videoId = getYouTubeVideoId(video.url)
    const isActive = activeVideo === video.id
    
    return (
      <div key={video.id} className={`video-card ${isActive ? 'active' : ''}`}>
        {isActive && videoId ? (
          <div className="video-player">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={video.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button 
              className="close-video-btn"
              onClick={() => setActiveVideo(null)}
            >
              ✕
            </button>
          </div>
        ) : (
          <div 
            className="video-thumbnail"
            onClick={() => videoId && setActiveVideo(video.id)}
          >
            {videoId ? (
              <>
                <img 
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt={video.name}
                  className="thumbnail-img"
                />
                <div className="play-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </>
            ) : (
              <div className="external-link">
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link-btn"
                >
                  🎬 Смотреть на {video.site || 'внешнем сайте'}
                </a>
              </div>
            )}
          </div>
        )}
        
        <div className="video-info">
          <div className="video-name">{video.name || 'Без названия'}</div>
          <div className="video-meta">
            {video.type && <span className="video-type">{video.type}</span>}
            {video.site && <span className="video-site">{video.site}</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="film-videos-section">
      <h2>Видео и трейлеры</h2>
      
      {activeVideo && (
        <div className="video-modal-overlay" onClick={() => setActiveVideo(null)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setActiveVideo(null)}>
              ✕
            </button>
            {(() => {
              const video = videos.find(v => v.id === activeVideo)
              const videoId = video ? getYouTubeVideoId(video.url) : null
              
              if (videoId) {
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title={video?.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="modal-video-player"
                  ></iframe>
                )
              }
              return null
            })()}
          </div>
        </div>
      )}
      
      {/* Трейлеры */}
      {trailers.length > 0 && (
        <div className="video-category">
          <h3 className="category-title">Трейлеры</h3>
          <div className="videos-grid">
            {trailers.slice(0, 4).map(renderVideoCard)}
          </div>
        </div>
      )}
      
      {/* Тизеры */}
      {teasers.length > 0 && (
        <div className="video-category">
          <h3 className="category-title">Тизеры</h3>
          <div className="videos-grid">
            {teasers.slice(0, 4).map(renderVideoCard)}
          </div>
        </div>
      )}
      
      {/* Другие видео */}
      {otherVideos.length > 0 && (
        <div className="video-category">
          <h3 className="category-title">Другие видео</h3>
          <div className="videos-grid">
            {otherVideos.slice(0, 4).map(renderVideoCard)}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilmVideos