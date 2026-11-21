import { useState } from 'react'

// One form component used by every pop-up in the app, so they all look and act the same.
//
// fields: what to show, e.g.
//   [{ name: 'title', label: 'Title' },
//    { name: 'amount', label: 'Amount ($)', type: 'number' },
//    { name: 'paidBy', label: 'Paid by', type: 'select', options: ['You', 'Alex'] },
//    { name: 'splitWith', label: 'Split with', type: 'checkboxes', options: ['You', 'Alex'] }]
// initialValues: starting values when editing, e.g. { title: 'Rent' }
// validate(values): return an error message (string), or the cleaned-up values to save
// onSubmit(cleanValues): called when everything is valid
// onDelete: optional; shows a Delete button when given
// Select options can be plain strings ('You') or objects ({ value: 1, label: 'Rent' }).
function optionValue(option) {
  return option.value ?? option
}

function SimpleForm({ fields, initialValues = {}, submitLabel, validate, onSubmit, onDelete }) {
  // Start every field from initialValues, or empty ('' or [] for checkboxes).
  const [values, setValues] = useState(() => {
    const start = {}
    for (const field of fields) {
      let empty = ''
      if (field.type === 'checkboxes') empty = []
      if (field.type === 'select') empty = optionValue(field.options[0]) // first option
      start[field.name] = initialValues[field.name] ?? empty
    }
    return start
  })
  const [error, setError] = useState('')

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  // For checkboxes: add the option if it's not ticked yet, remove it if it is.
  function toggleOption(name, option) {
    const list = values[name]
    setValue(name, list.includes(option) ? list.filter((o) => o !== option) : [...list, option])
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = validate(values)
    if (typeof result === 'string') {
      setError(result) // it's an error message
    } else {
      onSubmit(result)
    }
  }

  function renderInput(field, index) {
    const value = values[field.name]
    const autoFocus = index === 0

    if (field.type === 'select') {
      return (
        <select aria-label={field.label} value={value} onChange={(e) => setValue(field.name, e.target.value)} autoFocus={autoFocus}>
          {field.options.map((option) => {
            const v = optionValue(option)
            return <option key={v} value={v}>{option.label ?? option}</option>
          })}
        </select>
      )
    }

    if (field.type === 'checkboxes') {
      return (
        <div className='checkbox-row'>
          {field.options.map((option) => (
            <label key={option} className='checkbox-label'>
              <input type='checkbox' checked={value.includes(option)} onChange={() => toggleOption(field.name, option)} />
              {option}
            </label>
          ))}
        </div>
      )
    }

    return (
      <input
        aria-label={field.label}
        type={field.type ?? 'text'}
        step={field.type === 'number' ? '0.01' : undefined}
        min={field.type === 'number' ? '0' : undefined}
        value={value}
        onChange={(e) => setValue(field.name, e.target.value)}
        autoFocus={autoFocus}
      />
    )
  }

  return (
    <form className='modal-form' onSubmit={handleSubmit}>
      {fields.map((field, index) => (
        <div key={field.name} className='form-field'>
          <span className='field-label'>{field.label}:</span>
          {renderInput(field, index)}
          {field.hint && <span className='hint'>{field.hint}</span>}
        </div>
      ))}

      {error && <p className='form-error' role='alert'>{error}</p>}

      <div className='modal-buttons'>
        <button type='submit' className='modal-submit'>{submitLabel}</button>
        {onDelete && (
          <button type='button' className='modal-delete' onClick={onDelete}>Delete</button>
        )}
      </div>
    </form>
  )

}

export default SimpleForm
