import { useState } from 'react'
import Modal from './Modal.jsx'
import { cleanDue, monthLabel } from '../data/financeData.js'

// The pop-up for the Quick Actions.
// action is 'expense', 'income' or 'savings' and decides which form to show.
function QuickActionModal({ action, month, goals, onAddExpense, onAddIncome, onAddSavings, onClose }) {
  if (action === 'expense') {
    return (
      <Modal title={`New Expense for ${monthLabel(month)}`} onClose={onClose}>
        <EntryForm amountLabel='Amount Due ($)' dateLabel='Due Date' submitLabel='Create Expense'
          onSubmit={(entry) => { onAddExpense(entry); onClose() }} />
      </Modal>
    )
  }
  if (action === 'income') {
    return (
      <Modal title={`New Income for ${monthLabel(month)}`} onClose={onClose}>
        <EntryForm amountLabel='Amount ($)' dateLabel='Pay Date' submitLabel='Add Income'
          onSubmit={(entry) => { onAddIncome(entry); onClose() }} />
      </Modal>
    )
  }
  if (action === 'savings') {
    return (
      <Modal title='Add to Savings Goal' onClose={onClose}>
        <SavingsForm goals={goals}
          onSubmit={(goalId, amount) => { onAddSavings(goalId, amount); onClose() }} />
      </Modal>
    )
  }
  return null
}

// Form used by both "New Expense" and "New Income": Title, Amount, Date.
function EntryForm({ amountLabel, dateLabel, submitLabel, onSubmit }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [due, setDue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const cleanAmount = parseFloat(amount)
    const cleanDate = cleanDue(due)

    if (!title.trim()) return setError('Please enter a title.')
    if (isNaN(cleanAmount) || cleanAmount <= 0) return setError('Please enter an amount above $0.')
    if (!cleanDate) return setError('Enter a date like 01/30/2027, or Daily, Weekly, Bi-weekly, Once a month.')

    onSubmit({ title: title.trim(), amount: cleanAmount, due: cleanDate })
  }

  return (
    <form className='modal-form' onSubmit={handleSubmit}>
      <label>Title:
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </label>
      <label>{amountLabel}:
        <input type='number' step='0.01' min='0' value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>
      <label>{dateLabel}:
        <input value={due} onChange={(e) => setDue(e.target.value)} />
        <span className='hint'>(MM/DD/YYYY), or: Daily, Weekly, Bi-weekly, Once a month</span>
      </label>
      {error && <p className='form-error'>{error}</p>}
      <button type='submit' className='modal-submit'>{submitLabel}</button>
    </form>
  )
}

// Form for "Add Savings": pick a long-term goal and an amount.
function SavingsForm({ goals, onSubmit }) {
  const [goalId, setGoalId] = useState(goals[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  if (goals.length === 0) {
    return <p>Add a long-term goal first, then you can save toward it.</p>
  }

  function handleSubmit(event) {
    event.preventDefault()
    const cleanAmount = parseFloat(amount)
    if (isNaN(cleanAmount) || cleanAmount <= 0) return setError('Please enter an amount above $0.')
    onSubmit(Number(goalId), cleanAmount)
  }

  return (
    <form className='modal-form' onSubmit={handleSubmit}>
      <label>Goal:
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>{goal.name}</option>
          ))}
        </select>
      </label>
      <label>Amount ($):
        <input type='number' step='0.01' min='0' value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
      </label>
      {error && <p className='form-error'>{error}</p>}
      <button type='submit' className='modal-submit'>Add Savings</button>
    </form>
  )
}

export default QuickActionModal
