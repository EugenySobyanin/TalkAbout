import { useMemo, useState } from 'react'

function SearchableMultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Начните вводить...',
  emptyText = 'Ничего не найдено',
}) {
  const [query, setQuery] = useState('')

  const selectedSet = useMemo(
    () => new Set(selectedValues.map(String)),
    [selectedValues]
  )

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return options.filter((option) => {
      if (!normalizedQuery) return true
      return option.name.toLowerCase().includes(normalizedQuery)
    })
  }, [options, query])

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(String(option.id))),
    [options, selectedSet]
  )

  const toggleOption = (id) => {
    const stringId = String(id)

    if (selectedSet.has(stringId)) {
      onChange(selectedValues.filter((value) => String(value) !== stringId))
      return
    }

    onChange([...selectedValues, stringId])
  }

  const removeOption = (id) => {
    const stringId = String(id)
    onChange(selectedValues.filter((value) => String(value) !== stringId))
  }

  return (
    <div className="search-multi">
      <label className="search-multi__label">{label}</label>

      <div className="search-multi__box">
        <input
          type="text"
          className="search-multi__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />

        {selectedOptions.length > 0 && (
          <div className="search-multi__chips">
            {selectedOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className="search-multi__chip"
                onClick={() => removeOption(option.id)}
              >
                <span>{option.name}</span>
                <span className="search-multi__chip-x">×</span>
              </button>
            ))}
          </div>
        )}

        <div className="search-multi__options">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = selectedSet.has(String(option.id))

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`search-multi__option ${isSelected ? 'search-multi__option--selected' : ''}`}
                  onClick={() => toggleOption(option.id)}
                >
                  <span>{option.name}</span>
                  {isSelected && <span className="search-multi__check">✓</span>}
                </button>
              )
            })
          ) : (
            <div className="search-multi__empty">{emptyText}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchableMultiSelect