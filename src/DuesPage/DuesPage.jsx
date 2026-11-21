import '../Sass/card.scss'
import '../Sass/Pages.scss'
import PageHeader from '../components/PageHeader.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import Stat from '../components/Stat.jsx'
import { itemsForMonth, total, formatMoney, formatDue, dueToDate, monthKey } from '../data/financeData.js'

// Bills due this month, with a checkbox to mark each one paid.
function DuesPage({ onQuickAction, month, setMonth, expenses, paid, togglePaid }) {
  // Sort: dated bills first (soonest first), then repeating ones.
  const dues = [...itemsForMonth(expenses, month)].sort((a, b) => {
    const dateA = dueToDate(a.due)
    const dateB = dueToDate(b.due)
    if (dateA && dateB) return dateA - dateB
    if (dateA) return -1
    if (dateB) return 1
    return 0
  })

  // Paid keys are expense id + month, e.g. '1-2027-01'.
  const keyFor = (expense) => `${expense.id}-${monthKey(month)}`
  const paidDues = dues.filter((e) => paid[keyFor(e)])
  const totalDue = total(dues)
  const totalPaid = total(paidDues)

  return (
    <section className='page'>
      <PageHeader title='Dues'>
        <button className='primary' onClick={() => onQuickAction('expense')}>+ Add Expense</button>
        <MonthPicker month={month} setMonth={setMonth} />
      </PageHeader>

      <div className='stat-grid'>
        <Stat label='Total due' value={formatMoney(totalDue)} />
        <Stat label='Paid' value={formatMoney(totalPaid)} className='positive' />
        <Stat label='Still to pay' value={formatMoney(totalDue - totalPaid)} className={totalDue - totalPaid > 0 ? 'negative' : 'positive'} />
      </div>

      <div className='card-color'>
        <h2>Bills ({paidDues.length} of {dues.length} paid)</h2>
        <p className='muted'>Tick a bill once you've paid it. Repeating bills reset each month.</p>

        {dues.length === 0 && <p className='empty'>Nothing due this month.</p>}
        {dues.map((e) => {
          const isPaid = Boolean(paid[keyFor(e)])
          return (
            <div key={e.id} className={isPaid ? 'list-item due-row is-paid' : 'list-item due-row'}>
              <label className='due-check'>
                <input type='checkbox' checked={isPaid} onChange={() => togglePaid(keyFor(e))} />
                <span>
                  <strong>{e.title}</strong>
                  <span className='muted'> · {formatDue(e.due)}</span>
                </span>
              </label>
              <span className='due-amount'>{formatMoney(e.amount)}</span>
              <span className={isPaid ? 'tag done' : 'tag'}>{isPaid ? 'Paid' : 'Unpaid'}</span>
              <button onClick={() => onQuickAction('expense', e)}>Edit</button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default DuesPage
