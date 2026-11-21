import { useEffect, useRef, useState } from 'react'
import {
  LuHouse, LuZap, LuX, LuWallet, LuReceipt, LuTarget, LuChartPie, LuLandmark, LuTrendingUp, LuUsers, LuCalendarDays,
  LuSquarePlus, LuSquareMinus, LuSquareChevronDown, LuPanelLeftClose, LuPanelLeftOpen,
} from 'react-icons/lu'
import '../Sass/card.scss'
import '../Sass/Layout.scss'

// Side menu. "page" is the name App.jsx uses for that page.
const menuItems = [
  { label: 'Home', page: 'main', icon: LuHouse },
  { label: 'Balance', page: 'balance', icon: LuWallet },
  { label: 'Dues', page: 'dues', icon: LuReceipt },
  { label: 'Goals', page: 'monthlyGoals', icon: LuTarget },
  { label: 'Spending', page: 'spending', icon: LuChartPie },
  { label: 'Debts Log', page: 'debts', icon: LuLandmark },
  { label: 'Investments', page: 'investments', icon: LuTrendingUp },
  { label: 'Shared Expenses', page: 'shared', icon: LuUsers },
  { label: 'Calendar', page: 'calendar', icon: LuCalendarDays },
]

// Right side quick actions. "type" is which pop-up form App.jsx opens.
const quickActions = [
  { label: 'Add Income', icon: LuSquarePlus, type: 'income' },
  { label: 'Add Expense', icon: LuSquareMinus, type: 'expense' },
  { label: 'Add Savings', icon: LuSquareChevronDown, type: 'savings' },
]

// Both goal pages count as "Goals" in the menu.
function isActive(item, page) {
  if (item.page === 'monthlyGoals') return page === 'monthlyGoals' || page === 'longTermGoals'
  return item.page === page
}

// The frame around every page: side menu | the page, plus a floating
// Quick Actions button in the corner.
// Collapsing the menu shrinks it to just the icons, so it's still one click away.
function Layout({ page, onNavigate, onQuickAction, menuOpen, setMenuOpen, children }) {
  // Is the Quick Actions menu open?
  const [quickOpen, setQuickOpen] = useState(false)
  const quickRef = useRef(null) // the box around the button and its menu

  // While the menu is open, close it on Escape or a click anywhere outside it.
  useEffect(() => {
    if (!quickOpen) return

    function handleKey(event) {
      if (event.key === 'Escape') setQuickOpen(false)
    }
    function handleClick(event) {
      if (!quickRef.current.contains(event.target)) setQuickOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('mousedown', handleClick)
    // Remove the listeners again when the menu closes.
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('mousedown', handleClick)
    }
  }, [quickOpen])

  function chooseAction(type) {
    setQuickOpen(false)
    onQuickAction(type) // opens the pop-up form in App.jsx
  }

  return (
    <div className={menuOpen ? 'app-layout' : 'app-layout menu-closed'}>
      <nav className='side-menu' aria-label='Main menu'>
        <button
          className='menu-toggle'
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Collapse menu' : 'Expand menu'}
          title={menuOpen ? 'Collapse menu' : 'Expand menu'}
        >
          {menuOpen ? <LuPanelLeftClose /> : <LuPanelLeftOpen />}
        </button>

        {menuItems.map((item) => {
          const Icon = item.icon // a component has to start with a capital letter
          const active = isActive(item, page)
          return (
            <button
              key={item.label}
              className={active ? 'menu-item active' : 'menu-item'}
              onClick={() => onNavigate(item.page)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              title={menuOpen ? undefined : item.label} // show the name on hover when only icons show
            >
              <Icon className='menu-icon' />
              {menuOpen && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <main className='page-area'>{children}</main>

      {/* ---------- Floating Quick Actions button (bottom right) ---------- */}
      <div className='quick-actions' ref={quickRef}>
        {quickOpen && (
          <div className='quick-menu' id='quick-menu' role='menu' aria-label='Quick actions'>
            <h2 className='quick-title'>Quick actions</h2>
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  className='quick-item'
                  role='menuitem'
                  onClick={() => chooseAction(action.type)}
                  autoFocus={index === 0} // keyboard users land on the first action
                >
                  <span className='quick-icon'><Icon /></span>
                  {action.label}
                </button>
              )
            })}
          </div>
        )}

        <button
          className={quickOpen ? 'quick-fab open' : 'quick-fab'}
          onClick={() => setQuickOpen(!quickOpen)}
          aria-label={quickOpen ? 'Close quick actions' : 'Quick actions'}
          aria-expanded={quickOpen}
          aria-controls='quick-menu'
          title='Quick actions'
        >
          {/* Lightning bolt when closed, × when open so it's clear how to close it */}
          {quickOpen ? <LuX /> : <LuZap />}
        </button>
      </div>
    </div>
  )
}

export default Layout
