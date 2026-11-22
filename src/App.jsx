import { useState } from 'react'
import './App.scss'
import { Provider } from './components/ui/provider'
import Layout from './components/Layout.jsx'
import QuickActionModal from './components/QuickActionModal.jsx'
import MainPage from './MainPage/MainPage.jsx'
import MonthlyGoalsPage from './MonthlyGoalsPage/MonthlyGoalsPage.jsx'
import LongTermGoalsPage from './LongTermGoalsPage/LongTermGoalsPage.jsx'
import BalancePage from './BalancePage/BalancePage.jsx'
import DuesPage from './DuesPage/DuesPage.jsx'
import SpendingPage from './SpendingPage/SpendingPage.jsx'
import DebtsPage from './DebtsPage/DebtsPage.jsx'
import {
  makeId, monthKey, todayString,
  startingMonth, startingExpenses, startingIncome, startingGoals,
  startingDebts,
} from './data/financeData.js'

// Every page, by the name used to navigate to it (onNavigate('dues') shows DuesPage).
const pages = {
  main: MainPage,
  balance: BalancePage,
  dues: DuesPage,
  monthlyGoals: MonthlyGoalsPage,
  longTermGoals: LongTermGoalsPage,
  spending: SpendingPage,
  debts: DebtsPage,
}

function App() {
  // Which page is showing (one of the names in `pages` above).
  const [page, setPage] = useState('main')
  const [menuOpen, setMenuOpen] = useState(true)

  // The app's data lives here, so every page shows the same numbers.
  // When one page changes it, the others update too.
  const [month, setMonth] = useState(startingMonth)
  const [expenses, setExpenses] = useState(startingExpenses)
  const [income, setIncome] = useState(startingIncome)
  const [goals, setGoals] = useState(startingGoals)
  const [debts, setDebts] = useState(startingDebts)

  // Which dues are paid. Keys look like '1-2027-01' (expense id + month),
  // so a monthly bill can be paid in January but still unpaid in February.
  const [paid, setPaid] = useState({})

  function togglePaid(key) {
    setPaid((current) => ({ ...current, [key]: !current[key] }))
  }

  // The pop-up for expenses, income and savings: null, or { type, item }.
  // item is the thing being edited, or null when adding something new.
  const [modal, setModal] = useState(null)

  function openModal(type, item = null) {
    setModal({ type, item })
  }

  // Add / update / remove for expenses and income. type is 'expense' or 'income'.
  const setters = { expense: setExpenses, income: setIncome }
  const actions = {
    // New items go into the month that's currently selected.
    add: (type, values) =>
      setters[type]((list) => [...list, { id: makeId(), ...values, month: monthKey(month) }]),
    update: (type, id, values) =>
      setters[type]((list) => list.map((item) => (item.id === id ? { ...item, ...values } : item))),
    remove: (type, id) =>
      setters[type]((list) => list.filter((item) => item.id !== id)),
    // Adds money to a goal and records it in that goal's history.
    addSavings: (goalId, amount) =>
      setGoals((list) => list.map((g) => (g.id === goalId
        ? { ...g, saved: g.saved + amount, history: [...g.history, { id: makeId(), date: todayString(), amount, note: 'Quick Action' }] }
        : g))),
  }

  function navigate(newPage) {
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  // Everything a page might need. Each page only uses the parts it wants.
  const pageProps = {
    onNavigate: navigate,
    onQuickAction: openModal,
    month, setMonth,
    expenses, income,
    goals, setGoals,
    debts, setDebts,
    paid, togglePaid,
  }

  const CurrentPage = pages[page]

  return (
    <Provider>
      <Layout page={page} onNavigate={navigate} onQuickAction={openModal} menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
        <CurrentPage {...pageProps} />
      </Layout>

      {modal && (
        <QuickActionModal
          modal={modal}
          month={month}
          goals={goals}
          actions={actions}
          onClose={() => setModal(null)}
        />
      )}
    </Provider>
  )
}

export default App
