import { useRef } from 'react'

const PROFESSION_GROUPS = [
  {
    key: 'actors',
    title: 'Актёры',
    aliases: ['актеры', 'актёры', 'актер', 'актёр', 'actor', 'actors'],
    scroll: true,
  },
  {
    key: 'directors',
    title: 'Режиссёры',
    aliases: ['режиссеры', 'режиссёры', 'режиссер', 'режиссёр', 'director', 'directors'],
  },
  {
    key: 'writers',
    title: 'Сценаристы',
    aliases: ['сценаристы', 'сценарист', 'writer', 'writers'],
  },
  {
    key: 'composers',
    title: 'Композиторы',
    aliases: ['композиторы', 'композитор', 'composer', 'composers'],
  },
]

const normalize = (value) => String(value || '').trim().toLowerCase()

const getPersonsByAliases = (personsByProfession, aliases) => {
  const result = []

  Object.entries(personsByProfession || {}).forEach(([profession, persons]) => {
    const normalizedProfession = normalize(profession)

    const matched = aliases.some((alias) => (
      normalizedProfession.includes(normalize(alias))
    ))

    if (!matched || !Array.isArray(persons)) return

    persons.forEach((person) => {
      if (!result.some((item) => item.id === person.id)) {
        result.push(person)
      }
    })
  })

  return result
}

function PersonCard({ person }) {
  return (
    <article className="person-card">
      <div className="person-photo-wrapper">
        {person.photo_url ? (
          <img
            src={person.photo_url}
            alt={person.name || 'Персона'}
            className="person-photo"
            onError={(event) => {
              event.target.onerror = null
              event.target.src = '/placeholder-avatar.jpg'
            }}
          />
        ) : (
          <div className="person-photo-placeholder">
            {person.name?.charAt(0) || '?'}
          </div>
        )}
      </div>

      <div className="person-info">
        <div className="person-name">
          {person.name || 'Неизвестно'}
        </div>

        {person.en_name && person.en_name !== person.name && (
          <div className="person-en-name">
            {person.en_name}
          </div>
        )}

        {person.role_description && (
          <div className="person-role">
            {person.role_description}
          </div>
        )}
      </div>
    </article>
  )
}

function ActorsScroller({ persons }) {
  const scrollRef = useRef(null)

  const scrollActors = (direction) => {
    if (!scrollRef.current) return

    scrollRef.current.scrollBy({
      left: direction * 520,
      behavior: 'smooth',
    })
  }

  return (
    <div className="persons-scroll-wrap">
      <button
        type="button"
        className="persons-scroll-btn persons-scroll-btn--prev"
        onClick={() => scrollActors(-1)}
        aria-label="Прокрутить актёров назад"
      >
        ‹
      </button>

      <div ref={scrollRef} className="persons-scroll">
        {persons.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      <button
        type="button"
        className="persons-scroll-btn persons-scroll-btn--next"
        onClick={() => scrollActors(1)}
        aria-label="Прокрутить актёров вперёд"
      >
        ›
      </button>
    </div>
  )
}

function FilmPersons({ personsByProfession }) {
  const groups = PROFESSION_GROUPS
    .map((group) => ({
      ...group,
      persons: getPersonsByAliases(personsByProfession, group.aliases),
    }))
    .filter((group) => group.persons.length > 0)

  if (groups.length === 0) {
    return null
  }

  return (
    <section className="film-persons-section">
      <div className="film-section-head">
        <div>
          <h2>Съёмочная группа</h2>
          <p>Актёры, режиссёры, сценаристы и композиторы</p>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.key} className={`profession-group profession-group--${group.key}`}>
          <h3 className="profession-title">
            {group.title}
            <span className="person-count">
              {group.persons.length}
            </span>
          </h3>

          {group.scroll ? (
            <ActorsScroller persons={group.persons} />
          ) : (
            <div className="persons-grid">
              {group.persons.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

export default FilmPersons