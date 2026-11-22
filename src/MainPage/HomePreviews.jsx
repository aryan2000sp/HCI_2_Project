import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import BasicChart, { PieCenterLabel } from './BasicChart.jsx'
import { itemsForMonth, total, formatMoney, monthKey } from '../data/financeData.js'

// The tabs on the Home chart card, in the order the arrows step through them.
export const previewTabs = [
  { key: 'spending', label: 'Spending' },
  { key: 'balance', label: 'Balance' },
  { key: 'dues', label: 'Dues' },
  { key: 'goals', label: 'Goals' },
  { key: 'debts', label: 'Debts' },
]

const amber = '#D08303'
const moss = '#3F7D3A'
const honey = '#F2CF8B'

// "$1,200" style labels for chart axes (no cents, so they stay short)
const axisMoney = (v) => `$${v.toLocaleString('en-US')}`

// Works out what the Home chart card shows for one tab.
// Returns:
//   chart     – the chart to draw on the left
//   label     – small text above the big number
//   big       – the big number
//   tone      – 'positive', 'negative' or '' (colours the big number)
//   rows      – [label, value] pairs listed under the big number
//   page      – which page the button goes to, and buttonText
export function buildPreview(tab, { month, expenses, income, goals, debts, paid }) {
  const monthExpenses = itemsForMonth(expenses, month)
  const spent = total(monthExpenses)
  const earned = total(itemsForMonth(income, month))

  if (tab === 'spending') {
    const leftOver = earned - spent
    return {
      chart: <BasicChart expenses={monthExpenses} total={spent} />,
      label: 'Left over this month',
      big: formatMoney(leftOver),
      tone: leftOver >= 0 ? 'positive' : 'negative',
      rows: [['Income', formatMoney(earned)], ['Spent', formatMoney(spent)]],
      page: 'spending',
      buttonText: 'See spending',
    }
  }

  if (tab === 'balance') {
    // Income vs. spending for the 6 months ending with the selected one.
    const months = [5, 4, 3, 2, 1, 0].map((back) => new Date(month.getFullYear(), month.getMonth() - back, 1))
    const saved = goals.reduce((sum, g) => sum + g.saved, 0)
    const owed = debts.reduce((sum, d) => sum + d.balance, 0)
    const netWorth = saved - owed
    return {
      chart: (
        <BarChart
          xAxis={[{ scaleType: 'band', data: months.map((m) => m.toLocaleString('en-US', { month: 'short' })) }]}
          yAxis={[{ valueFormatter: axisMoney, width: 64 }]}
          series={[
            { label: 'Income', data: months.map((m) => total(itemsForMonth(income, m))), color: moss, valueFormatter: formatMoney },
            { label: 'Spent', data: months.map((m) => total(itemsForMonth(expenses, m))), color: amber, valueFormatter: formatMoney },
          ]}
          width={460}
          height={330}
        />
      ),
      label: 'Net worth',
      big: formatMoney(netWorth),
      tone: netWorth >= 0 ? 'positive' : 'negative',
      rows: [['Saved for goals', formatMoney(saved)], ['Debt owed', formatMoney(owed)]],
      page: 'balance',
      buttonText: 'See balance',
    }
  }

  if (tab === 'dues') {
    // Paid keys are expense id + month, e.g. '1-2027-01' (see App.jsx).
    const paidDues = monthExpenses.filter((e) => paid[`${e.id}-${monthKey(month)}`])
    const paidTotal = total(paidDues)
    const left = spent - paidTotal
    return {
      chart: (
        <PieChart
          series={[{
            data: [
              { id: 'paid', value: paidTotal, label: 'Paid', color: moss },
              { id: 'left', value: left, label: 'Still to pay', color: amber },
            ],
            innerRadius: 105,
            paddingAngle: paidTotal > 0 && left > 0 ? 2 : 0,
            cornerRadius: 5,
          }]}
          width={350}
          height={330}
        >
          <PieCenterLabel>{paidDues.length} of {monthExpenses.length}</PieCenterLabel>
        </PieChart>
      ),
      label: 'Still to pay this month',
      big: formatMoney(left),
      tone: left > 0 ? 'negative' : 'positive',
      rows: [['Total due', formatMoney(spent)], ['Paid', formatMoney(paidTotal)]],
      page: 'dues',
      buttonText: 'See dues',
    }
  }

  if (tab === 'goals') {
    // One bar per goal: how far along it is, out of 100%.
    const percents = goals.map((g) => (g.target > 0 ? Math.min(Math.round((g.saved / g.target) * 100), 100) : 0))
    const saved = goals.reduce((sum, g) => sum + g.saved, 0)
    const target = goals.reduce((sum, g) => sum + g.target, 0)
    return {
      chart: (
        <BarChart
          layout='horizontal'
          yAxis={[{ scaleType: 'band', data: goals.map((g) => g.name), width: 150 }]}
          xAxis={[{ min: 0, max: 100, valueFormatter: (v) => `${v}%` }]}
          series={[{
            label: '% complete',
            data: percents,
            color: amber,
            valueFormatter: (v) => `${v}%`,
            barLabel: (item) => `${item.value}%`, // prints the % next to each bar, so 0% still shows
            barLabelPlacement: 'outside',
          }]}
          width={460}
          height={330}
        />
      ),
      label: 'Saved toward goals',
      big: formatMoney(saved),
      tone: '',
      rows: [['Total of all targets', formatMoney(target)], ['Goals', String(goals.length)]],
      page: 'longTermGoals',
      buttonText: 'See goals',
    }
  }

  // 'debts': one bar per debt, split into paid off and still owed.
  const owed = debts.reduce((sum, d) => sum + d.balance, 0)
  const paidOff = debts.reduce((sum, d) => sum + (d.original - d.balance), 0)
  const minimum = debts.reduce((sum, d) => sum + d.minPayment, 0)
  return {
    chart: (
      <BarChart
        layout='horizontal'
        yAxis={[{ scaleType: 'band', data: debts.map((d) => d.name), width: 110 }]}
        xAxis={[{ valueFormatter: axisMoney }]}
        series={[
          { label: 'Paid off', data: debts.map((d) => d.original - d.balance), stack: 'debt', color: moss, valueFormatter: formatMoney },
          { label: 'Still owed', data: debts.map((d) => d.balance), stack: 'debt', color: honey, valueFormatter: formatMoney },
        ]}
        width={460}
        height={330}
      />
    ),
    label: 'Still owed',
    big: formatMoney(owed),
    tone: owed > 0 ? 'negative' : 'positive',
    rows: [['Paid off so far', formatMoney(paidOff)], ['Minimum / month', formatMoney(minimum)]],
    page: 'debts',
    buttonText: 'See debts',
  }
}
