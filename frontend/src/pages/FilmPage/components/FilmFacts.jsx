// src/pages/FilmPage/components/FilmFacts.jsx

import { useState } from 'react'

function FilmFacts({ facts }) {
  const [showSpoilers, setShowSpoilers] = useState(false)
  const visibleFacts = facts.filter(f => !f.spoiler || showSpoilers)

  return (
    <div className="film-facts-section">
      <h2>Интересные факты</h2>
      <div className="facts-list">
        {visibleFacts.slice(0, 5).map(fact => (
          <div key={fact.id} className={`fact-item ${fact.spoiler ? 'spoiler' : ''}`}>
            {fact.spoiler && <span className="spoiler-badge">СПОЙЛЕР</span>}
            <p>{fact.text}</p>
          </div>
        ))}
      </div>
      {facts.some(f => f.spoiler) && (
        <button 
          className="toggle-spoilers-btn"
          onClick={() => setShowSpoilers(!showSpoilers)}
        >
          {showSpoilers ? 'Скрыть спойлеры' : 'Показать спойлеры'}
        </button>
      )}
    </div>
  )
}

export default FilmFacts  // ✅ обязательно!