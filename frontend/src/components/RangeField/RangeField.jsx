function RangeField({
  label,
  minName,
  maxName,
  minValue,
  maxValue,
  onChange,
  minPlaceholder = 'От',
  maxPlaceholder = 'До',
  step,
}) {
  return (
    <div className="range-field">
      <label className="range-field__label">{label}</label>

      <div className="range-field__inputs">
        <input
          type="number"
          name={minName}
          value={minValue}
          onChange={onChange}
          placeholder={minPlaceholder}
          step={step}
          className="range-field__input"
        />

        <span className="range-field__divider">—</span>

        <input
          type="number"
          name={maxName}
          value={maxValue}
          onChange={onChange}
          placeholder={maxPlaceholder}
          step={step}
          className="range-field__input"
        />
      </div>
    </div>
  )
}

export default RangeField