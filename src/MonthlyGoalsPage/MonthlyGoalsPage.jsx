import { PieChart } from '@mui/x-charts/PieChart'
import '../Sass/card.scss'
import '../Sass/Pages.scss'
import '../Sass/MonthlyGoalsPage.scss'
import GoalsTopBar from '../components/GoalsTopBar.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import { itemsForMonth, total, formatDue, formatMoney } from '../data/financeData.js'
import { chartColors } from '../data/chartColors.js'

// The data (expenses, income, month) comes from App.jsx as props.
// onQuickAction('expense') opens the "New Expense" pop-up;
// onQuickAction('expense', item) opens it to edit that expense.
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

  return (
    <section className='page monthly-goals-page'>
      <GoalsTopBar activeTab='monthlyGoals' onNavigate={onNavigate}>
        <MonthPicker month={month} setMonth={setMonth} />
      </GoalsTopBar>

      <div className='goals-content'>
        {/* ---------- Left: expenses list ---------- */}
        <div className='card-color'>
          <div className='card-header'>
            <h2>Expenses</h2>
            <button className='primary' onClick={() => onQuickAction('expense')}>+ Add Expense</button>
          </div>
          <p className='muted'>Click an expense to edit or delete it.</p>

          <div>
            {monthExpenses.length === 0 && <p className='empty'>No expenses this month.</p>}
            {monthExpenses.map((e) => (
              <button key={e.id} className='row-button' onClick={() => onQuickAction('expense', e)}>
                <span>
                  <h3>{e.title}</h3>
                  <p>{formatMoney(e.amount)} {formatDue(e.due)}</p>
                </span>
                <span className='muted'>Edit ›</span>
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Right: chart and totals ---------- */}
        <div className='summary card-color'>
          {monthExpenses.length > 0 ? (
            <PieChart
              colors={chartColors}
              series={[{ data: chartData, innerRadius: 70, paddingAngle: 2, cornerRadius: 4 }]}
              width={420}
              height={330}
              slotProps={{ legend: { direction: 'horizontal', position: { vertical: 'bottom', horizontal: 'center' } } }}
            />
          ) : (
            <p className='empty'>Nothing to chart yet.</p>
          )}

          <div className='totals'>
            <p>Monthly Income: <strong>{formatMoney(monthIncome)}</strong></p>
            <p>Current Month Expenditure: <strong>{formatMoney(totalSpent)}</strong></p>
          </div>

          {/* Progress bar: the filled part is how much of the income has been spent. */}
          <div className='progress-bar' role='progressbar' aria-valuenow={Math.round(percentOfIncome)} aria-valuemin={0} aria-valuemax={100}>
            <div className='progress-fill' style={{ width: `${percentOfIncome}%` }} />
          </div>
          <p className='progress-label'>{percentOfIncome.toFixed(0)}% of income spent</p>
        </div>
      </div>
    </section>
  )
}

export default MonthlyGoalsPage
