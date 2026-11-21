import '../Sass/MainPage.scss'
import '../Sass/card.scss'
import '../Sass/Pages.scss'
import BasicChart from './BasicChart.jsx'
import PageHeader from '../components/PageHeader.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import { itemsForMonth, total, formatDue, formatMoney, monthKey } from '../data/financeData.js'

// The home dashboard. The side menu and Quick Actions come from Layout.jsx.
// The data (expenses, income, goals, month) comes from App.jsx as props.
function MainPage({ onNavigate, month, setMonth, expenses, income, goals, paid }) {
  const monthExpenses = itemsForMonth(expenses, month)
  const spent = total(monthExpenses)
  const earned = total(itemsForMonth(income, month))
  const leftOver = earned - spent

  return (
    <section className='page main-page'>
      <PageHeader title='Home'>
        <MonthPicker month={month} setMonth={setMonth} />
      </PageHeader>

      {/* ---------- This month at a glance ---------- */}
      <div className='overview card-color'>
        <BasicChart expenses={monthExpenses} total={spent} />
        <div className='month-summary'>
          <p className='summary-label'>Left over this month</p>
          <p className={`summary-big ${leftOver >= 0 ? 'positive' : 'negative'}`}>{formatMoney(leftOver)}</p>
          <dl className='summary-list'>
            <div><dt>Income</dt><dd>{formatMoney(earned)}</dd></div>
            <div><dt>Spent</dt><dd>{formatMoney(spent)}</dd></div>
          </dl>
          <button onClick={() => onNavigate('spending')}>See spending ›</button>
        </div>
      </div>

      <div className='two-columns'>
        {/* ---------- Dues ---------- */}
        <div className='card-color'>
          <div className='card-header'>
            <h2>Dues</h2>
            <button onClick={() => onNavigate('dues')}>View all ›</button>
          </div>
          {monthExpenses.length === 0 && <p className='empty'>Nothing due this month.</p>}
          {monthExpenses.map((e) => {
            const isPaid = paid[`${e.id}-${monthKey(month)}`]
            return (
              <div key={e.id} className='list-item home-row'>
                <span>
                  <strong className={isPaid ? 'paid-name' : ''}>{e.title}</strong>
                  <span className='muted'> {formatDue(e.due)}</span>
                </span>
                <span>
                  {isPaid && <span className='tag done'>Paid</span>} <strong>{formatMoney(e.amount)}</strong>
                </span>
              </div>
            )
          })}
        </div>

        {/* ---------- Goals ---------- */}
        <div className='card-color'>
          <div className='card-header'>
            <h2>Goals</h2>
            <button onClick={() => onNavigate('longTermGoals')}>View all ›</button>
          </div>
          {goals.length === 0 && <p className='empty'>No goals yet.</p>}
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(Math.round((g.saved / g.target) * 100), 100) : 0
            return (
              <div key={g.id} className='list-item'>
                <div className='home-row'>
                  <strong>{g.name}</strong>
                  <span className='muted'>{formatMoney(g.saved)} of {formatMoney(g.target)}</span>
                </div>
                <div className='progress-row' role='progressbar' aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={g.name}>
                  <span>{pct}%</span>
                  <div className='progress-bar'><div className='progress-fill' style={{ width: `${pct}%` }} /></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default MainPage
