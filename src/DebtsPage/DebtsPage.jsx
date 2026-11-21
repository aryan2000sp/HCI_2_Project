import { useState } from 'react'
import '../Sass/card.scss'
import '../Sass/Pages.scss'
import PageHeader from '../components/PageHeader.jsx'
import Stat from '../components/Stat.jsx'
import Modal from '../components/Modal.jsx'
import SimpleForm from '../components/SimpleForm.jsx'
import { makeId, todayString, formatMoney, cleanAmount, cleanDue, isRepeating } from '../data/financeData.js'

const debtFields = [
  { name: 'name', label: 'Name' },
  { name: 'lender', label: 'Owed to' },
  { name: 'original', label: 'Amount borrowed ($)', type: 'number' },
  { name: 'balance', label: 'Still owed ($)', type: 'number', hint: 'Leave empty if you haven\'t paid any of it yet' },
  { name: 'minPayment', label: 'Minimum payment per month ($)', type: 'number' },
]

function validateDebt(values) {
  const original = cleanAmount(values.original)
  // Left empty, "still owed" means none of it has been paid yet.
  const balance = values.balance === '' ? original : Number(values.balance)
  if (!values.name.trim()) return 'Please enter a name.'
  if (original === null) return 'Please enter the amount borrowed.'
  if (isNaN(balance) || balance < 0) return 'Please enter how much is still owed.'
  if (balance > original) return "Still owed can't be more than the amount borrowed."
  return {
    name: values.name.trim(),
    lender: values.lender.trim(),
    original,
    balance,
    minPayment: Number(values.minPayment) || 0,
  }
}

const paymentFields = [
  { name: 'amount', label: 'Amount paid ($)', type: 'number' },
  { name: 'date', label: 'Date', hint: '(MM/DD/YYYY)' },
]

// A record of what you owe, and every payment made toward it.
function DebtsPage({ debts, setDebts }) {
  // Which pop-up is open: null, or { type: 'add' | 'edit' | 'payment', debt }
  const [popup, setPopup] = useState(null)

  const totalOwed = debts.reduce((sum, d) => sum + d.balance, 0)
  const totalPaidOff = debts.reduce((sum, d) => sum + (d.original - d.balance), 0)
  const totalMinimum = debts.reduce((sum, d) => sum + d.minPayment, 0)

  function saveDebt(values) {
    if (popup.type === 'add') {
      setDebts([...debts, { id: makeId(), ...values, payments: [] }])
    } else {
      setDebts(debts.map((d) => (d.id === popup.debt.id ? { ...d, ...values } : d)))
    }
    setPopup(null)
  }

  function deleteDebt() {
    setDebts(debts.filter((d) => d.id !== popup.debt.id))
    setPopup(null)
  }

  // A payment lowers what's still owed (but never below $0) and goes in the log.
  function logPayment({ amount, date }) {
    setDebts(debts.map((d) => (d.id === popup.debt.id
      ? { ...d, balance: Math.max(d.balance - amount, 0), payments: [...d.payments, { id: makeId(), date, amount }] }
      : d)))
    setPopup(null)
  }

  function validatePayment(values) {
    const amount = cleanAmount(values.amount)
    const date = cleanDue(values.date)
    if (amount === null) return 'Please enter an amount above $0.'
    if (amount > popup.debt.balance) return `That's more than the ${formatMoney(popup.debt.balance)} still owed.`
    if (!date || isRepeating(date)) return 'Enter a date like 01/30/2027.'
    return { amount, date }
  }

  return (
    <section className='page'>
      <PageHeader title='Debts Log'>
        <button className='primary' onClick={() => setPopup({ type: 'add' })}>+ Add Debt</button>
      </PageHeader>

      <div className='stat-grid'>
        <Stat label='Total still owed' value={formatMoney(totalOwed)} className='negative' />
        <Stat label='Paid off so far' value={formatMoney(totalPaidOff)} className='positive' />
        <Stat label='Minimum payments / month' value={formatMoney(totalMinimum)} />
      </div>

      {debts.length === 0 && <div className='card-color'><p className='empty'>No debts. Nice!</p></div>}
      {debts.map((debt) => {
        const paidOff = debt.original > 0 ? Math.round(((debt.original - debt.balance) / debt.original) * 100) : 100
        return (
          <div key={debt.id} className='card-color'>
            <div className='card-header'>
              <div>
                <h2>{debt.name} {debt.balance === 0 && <span className='tag done'>Paid off</span>}</h2>
                <p className='muted'>{debt.lender}</p>
              </div>
              <div className='button-group'>
                <button onClick={() => setPopup({ type: 'payment', debt })} disabled={debt.balance === 0}>Log Payment</button>
                <button onClick={() => setPopup({ type: 'edit', debt })}>Edit</button>
              </div>
            </div>

            <p><strong>{formatMoney(debt.balance)}</strong> still owed of {formatMoney(debt.original)} · minimum {formatMoney(debt.minPayment)} / month</p>
            <div className='progress-row' role='progressbar' aria-valuenow={paidOff} aria-valuemin={0} aria-valuemax={100}>
              <span>{paidOff}%</span>
              <div className='progress-bar'><div className='progress-fill' style={{ width: `${paidOff}%` }} /></div>
            </div>

            <h3 className='log-title'>Payment log</h3>
            {debt.payments.length === 0 && <p className='empty'>No payments yet.</p>}
            {[...debt.payments].reverse().map((p) => (
              <p key={p.id} className='summary-line'>
                <span>{p.date}</span>
                <span className='positive'>−{formatMoney(p.amount)}</span>
              </p>
            ))}
          </div>
        )
      })}

      {/* ---------- Pop-ups ---------- */}
      {(popup?.type === 'add' || popup?.type === 'edit') && (
        <Modal title={popup.type === 'add' ? 'New Debt' : `Edit ${popup.debt.name}`} onClose={() => setPopup(null)}>
          <SimpleForm
            fields={debtFields}
            initialValues={popup.debt ?? {}}
            submitLabel={popup.type === 'add' ? 'Add Debt' : 'Save Changes'}
            validate={validateDebt}
            onSubmit={saveDebt}
            onDelete={popup.type === 'edit' ? deleteDebt : undefined}
          />
        </Modal>
      )}
      {popup?.type === 'payment' && (
        <Modal title={`Payment on ${popup.debt.name}`} onClose={() => setPopup(null)}>
          <SimpleForm
            fields={paymentFields}
            initialValues={{ amount: popup.debt.minPayment || '', date: todayString() }}
            submitLabel='Log Payment'
            validate={validatePayment}
            onSubmit={logPayment}
          />
        </Modal>
      )}
    </section>
  )
}

export default DebtsPage
