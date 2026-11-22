import { BarChart } from '@mui/x-charts/BarChart'
import '../Sass/card.scss'
import '../Sass/Pages.scss'
import PageHeader from '../components/PageHeader.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import Stat from '../components/Stat.jsx'
import { itemsForMonth, total, formatMoney, formatDue } from '../data/financeData.js'

// How spending changes over time, and where this month's money went.
function SpendingPage({ onQuickAction, month, setMonth, expenses }) {
  // The 6 months ending with the selected one, oldest first.
  const lastSixMonths = [5, 4, 3, 2, 1, 0].map(
    (back) => new Date(month.getFullYear(), month.getMonth() - back, 1)
  )
  const monthNames = lastSixMonths.map((m) => m.toLocaleString('en-US', { month: 'short', year: '2-digit' }))
  const monthTotals = lastSixMonths.map((m) => total(itemsForMonth(expenses, m)))

  const thisMonth = monthTotals[5]
  const lastMonth = monthTotals[4]
  const change = thisMonth - lastMonth

  // This month's expenses, biggest first.
  const monthExpenses = [...itemsForMonth(expenses, month)].sort((a, b) => b.amount - a.amount)

  return (
    <section className='page'>
      <PageHeader title='Spending'>
        <button className='primary' onClick={() => onQuickAction('expense')}>+ Add Spending</button>
        <MonthPicker month={month} setMonth={setMonth} />
      </PageHeader>

      <div className='stat-grid'>
        <Stat label='Spent this month' value={formatMoney(thisMonth)} />
        <Stat label='Last month' value={formatMoney(lastMonth)} />
        {/* Shown with a word and a sign, not just colour */}
        <Stat
          label='Change'
          value={`${change > 0 ? '▲ +' : change < 0 ? '▼ −' : ''}${formatMoney(Math.abs(change))}`}
          className={change > 0 ? 'negative' : 'positive'}
        />
      </div>

      <div className='card-color'>
        <h2>Last 6 months</h2>
        <BarChart
          xAxis={[{ scaleType: 'band', data: monthNames }]}
          yAxis={[{ valueFormatter: (v) => `$${v}` }]}
          series={[{ data: monthTotals, label: 'Spent', color: '#D08303', valueFormatter: (v) => formatMoney(v) }]}
          height={280}
        />
      </div>

      <div className='card-color'>
        <h2>Where it went</h2>
        <p className='muted'>Biggest expenses first. Click one to edit it.</p>
        {monthExpenses.length === 0 && <p className='empty'>No spending this month.</p>}
        {monthExpenses.map((e) => {
          const share = thisMonth > 0 ? Math.round((e.amount / thisMonth) * 100) : 0
          return (
            <button key={e.id} className='row-button spending-row' onClick={() => onQuickAction('expense', e)}>
              <span>
                <strong>{e.title}</strong>
                <span className='muted'> · {formatDue(e.due)}</span>
              </span>
              <span className='progress-row'>
                <span>{share}%</span>
                <span className='progress-bar'>
                  <span className='progress-fill' style={{ width: `${share}%`, display: 'block' }} />
                </span>
              </span>
              <strong>{formatMoney(e.amount)}</strong>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default SpendingPage
