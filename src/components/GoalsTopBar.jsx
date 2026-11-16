// Top bar shared by the Monthly Goals and Long-Term Goals pages.
// activeTab: 'monthlyGoals' or 'longTermGoals' (which tab is highlighted)
// children: anything extra to show on the right side (like the month picker)
function GoalsTopBar({ activeTab, onNavigate, children }) {
  return (
    <nav className='top-bar card-color'>
      <button className='menu-button' onClick={() => onNavigate('main')}>
        ☰ Menu
      </button>
      <button
        className={activeTab === 'monthlyGoals' ? 'tab active' : 'tab'}
        onClick={() => onNavigate('monthlyGoals')}
      >
        Monthly Goals
      </button>
      <button
        className={activeTab === 'longTermGoals' ? 'tab active' : 'tab'}
        onClick={() => onNavigate('longTermGoals')}
      >
        Long-Term Goals
      </button>
      <div className='top-bar-right'>{children}</div>
    </nav>
  )
}

export default GoalsTopBar
