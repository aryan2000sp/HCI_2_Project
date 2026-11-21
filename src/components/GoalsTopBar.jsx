// Top of the Monthly Goals and Long-Term Goals pages: the title, tabs to switch
// between the two, and anything extra on the right (like the month picker).
// activeTab: 'monthlyGoals' or 'longTermGoals' (which tab is highlighted)
function GoalsTopBar({ activeTab, onNavigate, children }) {
  return (
    <header className='page-header'>
      <h1>Goals</h1>
      <nav className='tabs' aria-label='Goal pages'>
        <button
          className={activeTab === 'monthlyGoals' ? 'tab active' : 'tab'}
          onClick={() => onNavigate('monthlyGoals')}
          aria-current={activeTab === 'monthlyGoals' ? 'page' : undefined}
        >
          Monthly
        </button>
        <button
          className={activeTab === 'longTermGoals' ? 'tab active' : 'tab'}
          onClick={() => onNavigate('longTermGoals')}
          aria-current={activeTab === 'longTermGoals' ? 'page' : undefined}
        >
          Long-term
        </button>
      </nav>
      <div className='page-header-right'>{children}</div>
    </header>
  )
}

export default GoalsTopBar
