import '../Sass/card.scss'
import '../Sass/Pages.scss'
import '../Sass/CalendarPage.scss'
import PageHeader from '../components/PageHeader.jsx'
import MonthPicker from '../components/MonthPicker.jsx'
import { formatMoney, dueToDate, isRepeating, formatDue } from '../data/financeData.js'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// '2032-02-02' (goal dates) -> a Date
function isoToDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function sameMonth(date, month) {
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth()
}

// A month view of bills, paydays and goal deadlines.
function CalendarPage({ onQuickAction, month, setMonth, expenses, income, goals }) {
  // ---------- Collect everything that happens on a date this month ----------
  // Each event: { day, kind, text, onClick? }
  const events = []

  for (const e of expenses) {
    const date = dueToDate(e.due)
    if (date && sameMonth(date, month)) {
      events.push({ day: date.getDate(), kind: 'due', text: `Due: ${e.title} ${formatMoney(e.amount)}`, onClick: () => onQuickAction('expense', e) })
    }
  }
  for (const i of income) {
    const date = dueToDate(i.due)
    if (date && sameMonth(date, month)) {
      events.push({ day: date.getDate(), kind: 'pay', text: `Pay: ${i.title} ${formatMoney(i.amount)}`, onClick: () => onQuickAction('income', i) })
    }
  }
  for (const g of goals) {
    const date = isoToDate(g.by)
    if (sameMonth(date, month)) {
      events.push({ day: date.getDate(), kind: 'goal', text: `Goal: ${g.name}` })
    }
    g.milestones.forEach((ms, index) => {
      const msDate = isoToDate(ms.by)
      if (sameMonth(msDate, month)) {
        events.push({ day: msDate.getDate(), kind: 'goal', text: `Milestone ${index + 1}: ${g.name} ${formatMoney(ms.target)}` })
      }
    })
  }

  // Repeating items don't have one date, so they're listed under the calendar.
  const repeating = [
    ...expenses.filter((e) => isRepeating(e.due)).map((e) => ({ ...e, kind: 'due', type: 'expense' })),
    ...income.filter((i) => isRepeating(i.due)).map((i) => ({ ...i, kind: 'pay', type: 'income' })),
  ]

  // ---------- Build the grid ----------
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate() // day 0 of next month = last day of this one

  // Empty boxes before day 1, then days 1..daysInMonth.
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const today = new Date()
  const isToday = (day) => sameMonth(today, month) && today.getDate() === day

  return (
    <section className='page calendar-page'>
      <PageHeader title='Calendar'>
        <MonthPicker month={month} setMonth={setMonth} />
      </PageHeader>

      <div className='card-color'>
        <div className='legend'>
          <span className='event due'>Due: bills</span>
          <span className='event pay'>Pay: income</span>
          <span className='event goal'>Goal: deadlines</span>
        </div>

        <div className='calendar-grid'>
          {weekdays.map((w) => <div key={w} className='weekday'>{w}</div>)}
          {cells.map((day, index) => (
            <div key={index} className={day === null ? 'day blank' : isToday(day) ? 'day today' : 'day'}>
              {day !== null && (
                <>
                  <span className='day-number'>{day}</span>
                  {events.filter((ev) => ev.day === day).map((ev, i) =>
                    ev.onClick ? (
                      <button key={i} className={`event ${ev.kind}`} onClick={ev.onClick}>{ev.text}</button>
                    ) : (
                      <span key={i} className={`event ${ev.kind}`}>{ev.text}</span>
                    )
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='card-color'>
        <h2>Repeating</h2>
        <p className='muted'>These happen every month (or more often), so they aren't on one day.</p>
        {repeating.length === 0 && <p className='empty'>Nothing repeating.</p>}
        {repeating.map((r) => (
          <button key={`${r.type}-${r.id}`} className='row-button' onClick={() => onQuickAction(r.type, r)}>
            <span><span className={`event ${r.kind}`}>{r.kind === 'due' ? 'Due' : 'Pay'}</span> <strong>{r.title}</strong></span>
            <span>{formatMoney(r.amount)} · {formatDue(r.due)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default CalendarPage
