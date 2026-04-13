// src/pages/FilmPage/components/FilmInfo.jsx

import { useState } from 'react'

function FilmInfo({ film }) {
  const [showFullDescription, setShowFullDescription] = useState(false)

  return (
    <div className="film-info-section">
      {film.slogan && (
        <div className="film-slogan">"{film.slogan}"</div>
      )}
      
      {/* {film.short_description && (
        <div className="film-short-description">
          {film.short_description}
        </div>
      )} */}
      
      {film.description && (
        <div className="film-description">
          <h3>Описание</h3>
          <div className={`description-text ${!showFullDescription ? 'collapsed' : ''}`}>
            {film.description}
          </div>
          {film.description.length > 300 && (
            <button 
              className="show-more-btn"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Свернуть' : 'Развернуть'}
            </button>
          )}
        </div>
      )}
      
      {/* Дополнительная информация */}
      <div className="film-details">
        <h3>Детали</h3>
        <div className="details-grid">
          {film.formatted_budget && (
            <div className="detail-item">
              <span className="detail-label">Бюджет:</span>
              <span className="detail-value">{film.formatted_budget}</span>
            </div>
          )}
          
          {film.type && (
            <div className="detail-item">
              <span className="detail-label">Тип:</span>
              <span className="detail-value">{film.type.name}</span>
            </div>
          )}
          
          {film.networks && film.networks.length > 0 && (
            <div className="detail-item">
              <span className="detail-label">Стриминг:</span>
              <span className="detail-value">
                {film.networks.map(n => n.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilmInfo