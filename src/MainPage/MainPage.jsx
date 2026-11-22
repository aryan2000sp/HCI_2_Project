import { useState } from 'react'
import '../Sass/MainPage.scss'
import '../Sass/card.scss'
import '../Sass/Pages.scss'
import { previewTabs, buildPreview } from './HomePreviews.jsx'
import PageHeader from '../components/PageHeader.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import { itemsForMonth, formatDue, formatMoney, monthKey } from '../data/financeData.js'

// The home dashboard. The side menu and Quick Actions come from Layout.jsx.
// The data (expenses, income, goals, debts, month) comes from App.jsx as props.
function MainPage({ onNavigate, onQuickAction, month, setMonth, expenses, income, goals, debts, paid }) {
  const monthExpenses = itemsForMonth(expenses, month)

  // Which preview the big chart card shows (index into previewTabs).
  const [tabIndex, setTabIndex] = useState(0)
  const tab = previewTabs[tabIndex]
  const preview = buildPreview(tab.key, { month, expenses, income, goals, debts, paid })

  // step is -1 (‹ arrow) or +1 (› arrow). The % wraps around, so › on the
  // last tab goes back to the first, and ‹ on the first goes to the last.
  function stepTab(step) {
    setTabIndex((tabIndex + step + previewTabs.length) % previewTabs.length)
  }

  return (
    <section className='page main-page'>
      <PageHeader title='Home'>
        <MonthPicker month={month} setMonth={setMonth} />
      </PageHeader>

      {/* ---------- Big chart card: tabs + arrows switch between page previews ---------- */}
      <div className='overview card-color'>
        <div className='overview-top'>
          <div className='tabs' role='group' aria-label='Choose a preview'>
            {previewTabs.map((t, index) => (
              <button
                key={t.key}
                className={index === tabIndex ? 'tab active' : 'tab'}
                onClick={() => setTabIndex(index)}
                aria-pressed={index === tabIndex}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className='muted'>{tabIndex + 1} of {previewTabs.length}</span>
        </div>

        <div className='overview-body'>
          <button className='step-arrow' onClick={() => stepTab(-1)} aria-label='Previous preview'>‹</button>

          {/* key makes React redraw the chart when the tab changes */}
          <div className='overview-chart' key={tab.key}>{preview.chart}</div>

          <div className='month-summary'>
            <p className='summary-label'>{preview.label}</p>
            <p className={`summary-big ${preview.tone}`}>{preview.big}</p>
            <dl className='summary-list'>
              {preview.rows.map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
            <div className='summary-buttons'>
              {/* The Spending preview can record spending right here (the "Home widget" path) */}
              {tab.key === 'spending' && (
                <button className='primary' onClick={() => onQuickAction('expense')}>+ Add Spending</button>
              )}
              <button onClick={() => onNavigate(preview.page)}>{preview.buttonText} ›</button>
            </div>
          </div>

          <button className='step-arrow' onClick={() => stepTab(1)} aria-label='Next preview'>›</button>
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
