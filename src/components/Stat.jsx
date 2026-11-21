// A number tile: a small label above a big value, e.g. "Income" / "$2,010.00".
// className can add 'positive' or 'negative' to colour the value.
function Stat({ label, value, className = '' }) {
  return (
    <div className='stat card-color'>
      <div className='stat-label'>{label}</div>
      <div className={`stat-value ${className}`}>{value}</div>
    </div>
  )
}

export default Stat
