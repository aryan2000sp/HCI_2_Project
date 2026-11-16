import { PieChart } from '@mui/x-charts/PieChart'
import '../Sass/card.scss'
import '../Sass/MonthlyGoalsPage.scss'
import GoalsTopBar from '../components/GoalsTopBar.jsx'
import { itemsForMonth, total, formatDue, monthLabel } from '../data/financeData.js'

// The data (expenses, income, month) comes from App.jsx as props.
// onQuickAction('expense') opens the "New Expense" pop-up.
function MonthlyGoalsPage({ onNavigate, onQuickAction, month, setMonth, expenses, income }) {
  // Only the items for the month being shown.
  const monthExpenses = itemsForMonth(expenses, month)
  const monthIncome = total(itemsForMonth(income, month))

  // Total spent this month, and how much of the income that is (0 to 100).
  const totalSpent = total(monthExpenses)
  const percentOfIncome = monthIncome > 0 ? Math.min((totalSpent / monthIncome) * 100, 100) : 0

  // The pie chart wants objects shaped like { id, value, label }.
  const chartData = monthExpenses.map((e) => ({
    id: e.id,
    value: e.amount,
    label: `${e.title} - ${((e.amount / totalSpent) * 100).toFixed(1)}%`,
  }))

  function changeMonth(step) {
    // step is -1 for the previous month, +1 for the next month.
    setMonth(new Date(month.getFullYear(), month.getMonth() + step, 1))
  }

  return (
    <section className='goals-page'>
      {/* ---------- Top bar (shared with Long-Term Goals) ---------- */}
      <GoalsTopBar activeTab='monthlyGoals' onNavigate={onNavigate}>
        <div className='month-picker'>
          <button onClick={() => changeMonth(-1)} aria-label='Previous month'>‹</button>
          <span>{monthLabel(month)}</span>
          <button onClick={() => changeMonth(1)} aria-label='Next month'>›</button>
        </div>
      </GoalsTopBar>

      <div className='goals-content'>
        {/* ---------- Left: expenses list ---------- */}
        <div className='expenses card-color'>
          <div className='expenses-header'>
            <h2>Expenses</h2>
            <button
              className='add-button'
              onClick={() => onQuickAction('expense')}
              aria-label='Add expense'
            >
              +
            </button>
          </div>

          <ul className='expense-list'>
            {monthExpenses.length === 0 && <p>No expenses this month.</p>}
            {monthExpenses.map((e) => (
              <li key={e.id} className='expense-item'>
                <h3>{e.title}</h3>
                <p>${e.amount.toFixed(2)} {formatDue(e.due)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Right: chart and totals ---------- */}
        <div className='summary card-color'>
          {monthExpenses.length > 0 ? (
            <PieChart series={[{ data: chartData }]} width={300} height={300} />
          ) : (
            <p>Nothing to chart yet.</p>
          )}

          <div className='totals'>
            <p>Monthly Income: <strong>${monthIncome.toFixed(2)}</strong></p>
            <p>Current Month Expenditure: <strong>${totalSpent.toFixed(2)}</strong></p>
          </div>

          {/* Progress bar: the filled part is how much of the income has been spent. */}
          <div className='progress-bar'>
            <div className='progress-fill' style={{ width: `${percentOfIncome}%` }} />
          </div>
          <p className='progress-label'>{percentOfIncome.toFixed(0)}% of income spent</p>
        </div>
      </div>
    </section>
  )
}

export default MonthlyGoalsPage
