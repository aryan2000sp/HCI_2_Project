import '../Sass/card.scss'
import '../Sass/Pages.scss'
import PageHeader from '../components/PageHeader.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import Stat from '../components/Stat.jsx'
import { itemsForMonth, total, formatMoney, formatDue } from '../data/financeData.js'

// An overview of where your money stands: this month's income and spending,
// plus savings and debt.
function BalancePage({ onQuickAction, month, setMonth, expenses, income, goals, debts }) {
  const monthIncome = itemsForMonth(income, month)
  const monthExpenses = itemsForMonth(expenses, month)
  const earned = total(monthIncome)
  const spent = total(monthExpenses)
  const leftOver = earned - spent

  const saved = goals.reduce((sum, g) => sum + g.saved, 0)
  const owed = debts.reduce((sum, d) => sum + d.balance, 0)
  // Net worth: what you have minus what you owe.
  const netWorth = saved - owed

  return (
    <section className='page'>
      <PageHeader title='Balance'>
        <MonthPicker month={month} setMonth={setMonth} />
      </PageHeader>

      <h3 className='section-title'>This month</h3>
      <div className='stat-grid'>
        <Stat label='Income' value={formatMoney(earned)} />
        <Stat label='Expenses' value={formatMoney(spent)} />
        <Stat label='Left over' value={formatMoney(leftOver)} className={leftOver >= 0 ? 'positive' : 'negative'} />
      </div>

      <h3 className='section-title'>Overall</h3>
      <div className='stat-grid'>
        <Stat label='Saved for goals' value={formatMoney(saved)} />
        <Stat label='Debt owed' value={formatMoney(owed)} />
        <Stat label='Net worth' value={formatMoney(netWorth)} className={netWorth >= 0 ? 'positive' : 'negative'} />
      </div>

      <div className='two-columns'>
        <EntryList title='Income' type='income' items={monthIncome} onQuickAction={onQuickAction} />
        <EntryList title='Expenses' type='expense' items={monthExpenses} onQuickAction={onQuickAction} />
      </div>
    </section>
  )
}

// A card listing income or expenses. Click a row to edit it, or + to add one.
function EntryList({ title, type, items, onQuickAction }) {
  return (
    <div className='card-color'>
      <div className='card-header'>
        <h2>{title}</h2>
        <button onClick={() => onQuickAction(type)} aria-label={`Add ${type}`}>+ Add</button>
      </div>
      {items.length === 0 && <p className='empty'>None this month.</p>}
      {items.map((item) => (
        <button key={item.id} className='row-button' onClick={() => onQuickAction(type, item)}>
          <span>
            <strong>{item.title}</strong>
            <span className='muted'> · {formatDue(item.due)}</span>
          </span>
          <span>{formatMoney(item.amount)}</span>
        </button>
      ))}
      <p className='list-total'>Total: <strong>{formatMoney(total(items))}</strong></p>
    </div>
  )
}

export default BalancePage
