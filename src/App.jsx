import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.scss'
import MainPage from './MainPage/MainPage.jsx'
import MonthlyGoalsPage from './MonthlyGoalsPage/MonthlyGoalsPage.jsx'
import LongTermGoalsPage from './LongTermGoalsPage/LongTermGoalsPage.jsx'
import QuickActionModal from './components/QuickActionModal.jsx'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Provider } from "./components/ui/provider"
import {
  makeId, monthKey,
  startingMonth, startingExpenses, startingIncome, startingGoals,
} from './data/financeData.js'


function App() {
  // Which page is showing: 'main', 'monthlyGoals' or 'longTermGoals'.
  // Each page gets setPage (as onNavigate) so it can switch pages.
  const [page, setPage] = useState('main')

  // The app's data lives here, so every page shows the same numbers.
  // When one page changes it, the others update too.
  const [month, setMonth] = useState(startingMonth)
  const [expenses, setExpenses] = useState(startingExpenses)
  const [income, setIncome] = useState(startingIncome)
  const [goals, setGoals] = useState(startingGoals)

  // Which Quick Action pop-up is open: null, 'expense', 'income' or 'savings'.
  const [quickAction, setQuickAction] = useState(null)

  // New expenses and income are added to the month that's currently selected.
  function addExpense(entry) {
    setExpenses((list) => [...list, { id: makeId(), ...entry, month: monthKey(month) }])
  }

  function addIncome(entry) {
    setIncome((list) => [...list, { id: makeId(), ...entry, month: monthKey(month) }])
  }

  function addSavings(goalId, amount) {
    setGoals((list) => list.map((g) => (g.id === goalId ? { ...g, saved: g.saved + amount } : g)))
  }

  // Props every page needs.
  const shared = { onNavigate: setPage, onQuickAction: setQuickAction, month, setMonth }

  return (
    <>
      <Provider>
        {page === 'main' && (
          <MainPage {...shared} expenses={expenses} income={income} goals={goals}/>
        )}
        {page === 'monthlyGoals' && (
          <MonthlyGoalsPage {...shared} expenses={expenses} income={income}/>
        )}
        {page === 'longTermGoals' && (
          <LongTermGoalsPage {...shared} goals={goals} setGoals={setGoals}/>
        )}

        {quickAction && (
          <QuickActionModal
            action={quickAction}
            month={month}
            goals={goals}
            onAddExpense={addExpense}
            onAddIncome={addIncome}
            onAddSavings={addSavings}
            onClose={() => setQuickAction(null)}
          />
        )}
      </Provider>

    </>
  )
}

export default App
