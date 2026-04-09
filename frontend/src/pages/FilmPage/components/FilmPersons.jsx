// src/pages/FilmPage/components/FilmPersons.jsx

import { useState } from 'react'

function FilmPersons({ personsByProfession }) {
  const [showAll, setShowAll] = useState(false)
  
  // Если нет данных
  if (!personsByProfession || Object.keys(personsByProfession).length === 0) {
    return null
  }

  return (
    <div className="film-persons-section">
      <h2>Съемочная группа</h2>
      
      {Object.entries(personsByProfession).map(([profession, persons]) => {
        const displayPersons = showAll ? persons : persons.slice(0, 6)
        const hasMore = persons.length > 6
        
        return (
          <div key={profession} className="profession-group">
            <h3 className="profession-title">
              {profession} <span className="person-count">({persons.length})</span>
            </h3>
            
            <div className="persons-grid">
              {displayPersons.map(person => (
                <div key={person.id} className="person-card">
                  <div className="person-photo-wrapper">
                    {person.photo_url ? (
                      <img 
                        src={person.photo_url} 
                        alt={person.name}
                        className="person-photo"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png'
                        }}
                      />
                    ) : (
                      <div className="person-photo-placeholder">
                        {person.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="person-info">
                    <div className="person-name">{person.name || 'Неизвестно'}</div>
                    {person.en_name && person.en_name !== person.name && (
                      <div className="person-en-name">{person.en_name}</div>
                    )}
                    {person.role_description && (
                      <div className="person-role">{person.role_description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <button 
                className="show-more-persons-btn"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Скрыть' : `Показать ещё ${persons.length - 6}`}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default FilmPersons