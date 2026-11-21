import { useState } from 'react'
import '../Sass/card.scss'
import '../Sass/Pages.scss'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import SimpleForm from '../components/SimpleForm.jsx'
import { makeId, todayString, formatMoney, cleanAmount, cleanDue, isRepeating, people } from '../data/financeData.js'

const sharedFields = [
  { name: 'title', label: 'What was it for' },
  { name: 'amount', label: 'Total amount ($)', type: 'number' },
  { name: 'paidBy', label: 'Paid by', type: 'select', options: people },
  { name: 'splitWith', label: 'Split between', type: 'checkboxes', options: people },
  { name: 'date', label: 'Date', hint: '(MM/DD/YYYY)' },
]

function validateShared(values) {
  const amount = cleanAmount(values.amount)
  const date = cleanDue(values.date)
  if (!values.title.trim()) return 'Please say what it was for.'
  if (amount === null) return 'Please enter an amount above $0.'
  if (values.splitWith.length === 0) return 'Pick at least one person to split it between.'
  if (!date || isRepeating(date)) return 'Enter a date like 01/30/2027.'
  return { title: values.title.trim(), amount, paidBy: values.paidBy, splitWith: values.splitWith, date }
}

// How much one person owes for an expense (it's split evenly).
function shareOf(expense) {
  return expense.amount / expense.splitWith.length
}

// For each other person: how much they owe you (positive) or you owe them (negative).
// Only expenses that aren't settled yet count.
function balancesWithYou(shared) {
  const balances = {}
  for (const person of people) {
    if (person !== 'You') balances[person] = 0
  }
  for (const e of shared) {
    if (e.settled) continue
    if (e.paidBy === 'You') {
      // Everyone else in the split owes you their share.
      for (const person of e.splitWith) {
        if (person !== 'You') balances[person] += shareOf(e)
      }
    } else if (e.splitWith.includes('You')) {
      // You owe the person who paid your share.
      balances[e.paidBy] -= shareOf(e)
    }
  }
  return balances
}

// Costs split with roommates: who paid, who owes who.
function SharedExpensesPage({ shared, setShared }) {
  // Which pop-up is open: null, or { type: 'add' | 'edit', expense }
  const [popup, setPopup] = useState(null)
  const balances = balancesWithYou(shared)

  function saveShared(values) {
    if (popup.type === 'add') {
      setShared([...shared, { id: makeId(), ...values, settled: false }])
    } else {
      setShared(shared.map((e) => (e.id === popup.expense.id ? { ...e, ...values } : e)))
    }
    setPopup(null)
  }

  function deleteShared() {
    setShared(shared.filter((e) => e.id !== popup.expense.id))
    setPopup(null)
  }

  function toggleSettled(id) {
    setShared(shared.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e)))
  }

  return (
    <section className='page'>
      <PageHeader title='Shared Expenses'>
        <button className='primary' onClick={() => setPopup({ type: 'add' })}>+ Add Shared Expense</button>
      </PageHeader>

      {/* ---------- Who owes who ---------- */}
      <div className='stat-grid'>
        {Object.entries(balances).map(([person, amount]) => {
          let text = `All square with ${person}`
          if (amount > 0.005) text = `${person} owes you`
          if (amount < -0.005) text = `You owe ${person}`
          return (
            <div key={person} className='stat card-color'>
              <div className='stat-label'>{text}</div>
              <div className={`stat-value ${amount > 0.005 ? 'positive' : amount < -0.005 ? 'negative' : ''}`}>
                {formatMoney(Math.abs(amount))}
              </div>
            </div>
          )
        })}
      </div>

      <div className='card-color'>
        <h2>All shared expenses</h2>
        <p className='muted'>Click a row to edit it. Mark it settled once everyone has paid up.</p>
        {shared.length === 0 ? (
          <p className='empty'>Nothing shared yet.</p>
        ) : (
          <table className='data-table'>
            <thead>
              <tr>
                <th>Date</th><th>What</th><th>Paid by</th><th>Split between</th>
                <th className='num'>Total</th><th className='num'>Each</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...shared].reverse().map((e) => (
                <tr
                  key={e.id}
                  className='clickable-row'
                  onClick={() => setPopup({ type: 'edit', expense: e })}
                  onKeyDown={(event) => event.key === 'Enter' && setPopup({ type: 'edit', expense: e })}
                  tabIndex={0}
                >
                  <td>{e.date}</td>
                  <td><strong>{e.title}</strong></td>
                  <td>{e.paidBy}</td>
                  <td>{e.splitWith.join(', ')}</td>
                  <td className='num'>{formatMoney(e.amount)}</td>
                  <td className='num'>{formatMoney(shareOf(e))}</td>
                  <td>
                    {/* stopPropagation so this button doesn't also open the edit pop-up */}
                    <button
                      className={e.settled ? 'tag done' : 'tag'}
                      onClick={(event) => { event.stopPropagation(); toggleSettled(e.id) }}
                      aria-pressed={e.settled}
                    >
                      {e.settled ? '✓ Settled' : 'Mark settled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {popup && (
        <Modal title={popup.type === 'add' ? 'New Shared Expense' : `Edit ${popup.expense.title}`} onClose={() => setPopup(null)}>
          <SimpleForm
            fields={sharedFields}
            initialValues={popup.expense ?? { splitWith: [...people], date: todayString() }}
            submitLabel={popup.type === 'add' ? 'Add Shared Expense' : 'Save Changes'}
            validate={validateShared}
            onSubmit={saveShared}
            onDelete={popup.type === 'edit' ? deleteShared : undefined}
          />
        </Modal>
      )}
    </section>
  )
}

export default SharedExpensesPage
