import { monthLabel } from '../data/financeData.js'

// ‹ January, 2027 › — used on every page that shows one month at a time.
function MonthPicker({ month, setMonth }) {
  function changeMonth(step) {
    // step is -1 for the previous month, +1 for the next month.
    setMonth(new Date(month.getFullYear(), month.getMonth() + step, 1))
  }

  return (
    <div className='month-picker'>
      <button onClick={() => changeMonth(-1)} aria-label='Previous month'>‹</button>
      <span>{monthLabel(month)}</span>
      <button onClick={() => changeMonth(1)} aria-label='Next month'>›</button>
    </div>
  )
}

export default MonthPicker
