import '../Sass/MainPage.scss'
import '../Sass/card.scss'
import BasicChart from './BasicChart.jsx'
import { LuHouse, LuZap, LuSquarePlus, LuSquareMinus, LuSquareChevronDown } from 'react-icons/lu'
import { itemsForMonth, total, formatDue, monthLabel } from '../data/financeData.js'

// Left side menu. "page" is the name App.jsx uses to show that page.
// Only Goals has a page so far. The rest have page: null until you build them.
const menuItems = [
  { label: 'Balance', page: null },
  { label: 'Dues', page: null },
  { label: 'Goals', page: 'monthlyGoals' },
  { label: 'Spending', page: null },
  { label: 'Debts Log', page: null },
  { label: 'Investments', page: null },
  { label: 'Shared Expenses', page: null },
  { label: 'Calendar', page: null },
]

// Right side quick actions. "action" is which pop-up form App.jsx opens.
const quickActions = [
  { label: 'Add Income', icon: LuSquarePlus, action: 'income' },
  { label: 'Add Expenses', icon: LuSquareMinus, action: 'expense' },
  { label: 'Add Savings', icon: LuSquareChevronDown, action: 'savings' },
]

// The data (expenses, income, goals, month) comes from App.jsx as props.
function MainPage({ onNavigate, onQuickAction, month, expenses, income, goals }) {
  const monthExpenses = itemsForMonth(expenses, month)
  const spent = total(monthExpenses)
  const earned = total(itemsForMonth(income, month))

  function handleMenuClick(item) {
    if (item.page) {
      onNavigate(item.page)
    } else {
      console.log(`${item.label} page not built yet`)
    }
  }

  function handleQuickAction(item) {
    onQuickAction(item.action) // opens the pop-up
  }

  return (
    <div className='home-layout'>
      {/* ---------- Left: side menu ---------- */}
      <nav className='side-menu card-color'>
        <button className='menu-title' onClick={() => onNavigate('main')}>
          <LuHouse /> Home
        </button>
        {menuItems.map((item) => (
          <button key={item.label} className='menu-item' onClick={() => handleMenuClick(item)}>
            {item.label}
          </button>
        ))}
      </nav>

      {/* ---------- Middle: the existing dashboard ---------- */}
      <section className='main-page'>
        <div className='pie-chart card-color'>
          <BasicChart expenses={monthExpenses} total={spent}/>
          <div className='month-summary'>
            <h2>{monthLabel(month)}</h2>
            <p>Income: <strong>${earned.toFixed(2)}</strong></p>
            <p>Spent: <strong>${spent.toFixed(2)}</strong></p>
            <p>Left over: <strong>${(earned - spent).toFixed(2)}</strong></p>
          </div>
        </div>
        <div className='dues card-color'>
          <h1>Dues</h1>
          {monthExpenses.length === 0 && <p>Nothing due this month.</p>}
          {monthExpenses.map((e) => (
            <p key={e.id} className='summary-row'>
              <span>{e.title}</span>
              <span>${e.amount.toFixed(2)} · {formatDue(e.due)}</span>
            </p>
          ))}
        </div>
        {/* Clicking the Goals card also opens the Monthly Goals page */}
        <div
          className='goals card-color clickable'
          onClick={() => onNavigate('monthlyGoals')}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('monthlyGoals')}
        >
          <h1>Goals</h1>
          {goals.map((g) => (
            <p key={g.id} className='summary-row'>
              <span>{g.name}</span>
              <span>${g.saved.toLocaleString('en-US')} / ${g.target.toLocaleString('en-US')}</span>
            </p>
          ))}
        </div>
      </section>

      {/* ---------- Right: quick actions ---------- */}
      <aside className='quick-actions card-color'>
        <h2 className='quick-title'><LuZap /> Quick Actions</h2>
        {quickActions.map((action) => {
          const Icon = action.icon // a component has to start with a capital letter
          return (
            <button key={action.label} className='quick-item' onClick={() => handleQuickAction(action)}>
              <Icon /> {action.label}
            </button>
          )
        })}
      </aside>
    </div>
  )
}

export default MainPage
