import { useState } from 'react'
import { PieChart } from '@mui/x-charts/PieChart'
import '../Sass/card.scss'
import '../Sass/Pages.scss'
import PageHeader from '../components/PageHeader.jsx'
import Stat from '../components/Stat.jsx'
import Modal from '../components/Modal.jsx'
import SimpleForm from '../components/SimpleForm.jsx'
import { makeId, formatMoney, cleanAmount } from '../data/financeData.js'
import { chartColors } from '../data/chartColors.js'

const investmentTypes = ['TFSA', 'RRSP', 'GIC', 'Stocks', 'Other']

const investmentFields = [
  { name: 'name', label: 'Name' },
  { name: 'type', label: 'Type', type: 'select', options: investmentTypes },
  { name: 'invested', label: 'Amount put in ($)', type: 'number' },
  { name: 'value', label: 'Worth now ($)', type: 'number' },
]

function validateInvestment(values) {
  const invested = cleanAmount(values.invested)
  const value = Number(values.value)
  if (!values.name.trim()) return 'Please enter a name.'
  if (invested === null) return 'Please enter how much you put in.'
  if (values.value === '' || isNaN(value) || value < 0) return 'Please enter what it is worth now.'
  return { name: values.name.trim(), type: values.type, invested, value }
}

// "+$240.00 (+8.0%)" or "−$50.00 (−2.0%)". Uses a sign, not just colour.
function formatGain(gain, invested) {
  const sign = gain >= 0 ? '+' : '−'
  const pct = invested > 0 ? Math.abs((gain / invested) * 100).toFixed(1) : '0.0'
  return `${sign}${formatMoney(Math.abs(gain))} (${sign}${pct}%)`
}

// What you've invested and how it's doing.
function InvestmentsPage({ investments, setInvestments }) {
  // Which pop-up is open: null, or { type: 'add' | 'edit', investment }
  const [popup, setPopup] = useState(null)

  const totalInvested = investments.reduce((sum, i) => sum + i.invested, 0)
  const totalValue = investments.reduce((sum, i) => sum + i.value, 0)
  const totalGain = totalValue - totalInvested

  // Pie chart of what each investment is worth now.
  const chartData = investments.map((i) => ({ id: i.id, value: i.value, label: i.name }))

  function saveInvestment(values) {
    if (popup.type === 'add') {
      setInvestments([...investments, { id: makeId(), ...values }])
    } else {
      setInvestments(investments.map((i) => (i.id === popup.investment.id ? { ...i, ...values } : i)))
    }
    setPopup(null)
  }

  function deleteInvestment() {
    setInvestments(investments.filter((i) => i.id !== popup.investment.id))
    setPopup(null)
  }

  return (
    <section className='page'>
      <PageHeader title='Investments'>
        <button className='primary' onClick={() => setPopup({ type: 'add' })}>+ Add Investment</button>
      </PageHeader>

      <div className='stat-grid'>
        <Stat label='Total put in' value={formatMoney(totalInvested)} />
        <Stat label='Worth now' value={formatMoney(totalValue)} />
        <Stat label='Gain / loss' value={formatGain(totalGain, totalInvested)} className={totalGain >= 0 ? 'positive' : 'negative'} />
      </div>

      <div className='two-columns investments-layout'>
        <div className='card-color'>
          <h2>Your investments</h2>
          <p className='muted'>Click a row to update what it's worth.</p>
          {investments.length === 0 ? (
            <p className='empty'>No investments yet.</p>
          ) : (
            <table className='data-table'>
              <thead>
                <tr><th>Name</th><th>Type</th><th className='num'>Put in</th><th className='num'>Worth now</th><th className='num'>Gain / loss</th></tr>
              </thead>
              <tbody>
                {investments.map((i) => (
                  <tr
                    key={i.id}
                    className='clickable-row'
                    onClick={() => setPopup({ type: 'edit', investment: i })}
                    onKeyDown={(e) => e.key === 'Enter' && setPopup({ type: 'edit', investment: i })}
                    tabIndex={0}
                  >
                    <td><strong>{i.name}</strong></td>
                    <td>{i.type}</td>
                    <td className='num'>{formatMoney(i.invested)}</td>
                    <td className='num'>{formatMoney(i.value)}</td>
                    <td className={`num ${i.value >= i.invested ? 'positive' : 'negative'}`}>{formatGain(i.value - i.invested, i.invested)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className='card-color centered-card'>
          <h2>Where it's invested</h2>
          {investments.length > 0 && <PieChart colors={chartColors} series={[{ data: chartData, innerRadius: 60, paddingAngle: 2, cornerRadius: 4 }]} height={260} />}
        </div>
      </div>

      {popup && (
        <Modal title={popup.type === 'add' ? 'New Investment' : `Update ${popup.investment.name}`} onClose={() => setPopup(null)}>
          <SimpleForm
            fields={investmentFields}
            initialValues={popup.investment ?? {}}
            submitLabel={popup.type === 'add' ? 'Add Investment' : 'Save Changes'}
            validate={validateInvestment}
            onSubmit={saveInvestment}
            onDelete={popup.type === 'edit' ? deleteInvestment : undefined}
          />
        </Modal>
      )}
    </section>
  )
}

export default InvestmentsPage
