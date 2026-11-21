import { useState } from 'react'
import '../Sass/card.scss'
import '../Sass/Pages.scss'
import '../Sass/LongTermGoalsPage.scss'
import GoalsTopBar from '../components/GoalsTopBar.jsx'
import Modal from '../components/Modal.jsx'
import SimpleForm from '../components/SimpleForm.jsx'
import { makeId, todayString, formatMoney, cleanAmount } from '../data/financeData.js'

// ---------- Small helper functions ----------

// '2032-02-02' -> '02/02/2032'
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${month}/${day}/${year}`
}

// How far "saved" is toward "target", as a whole number from 0 to 100.
function percent(saved, target) {
  if (target <= 0) return 0
  return Math.min(Math.round((saved / target) * 100), 100)
}

// ---------- Form setup ----------

const goalFields = [
  { name: 'name', label: 'Name' },
  { name: 'saved', label: 'Saved so far ($)', type: 'number' },
  { name: 'target', label: 'Target ($)', type: 'number' },
  { name: 'monthly', label: 'Contribution per month ($)', type: 'number' },
  { name: 'by', label: 'By', type: 'date' },
]

function validateGoal(values) {
  const target = cleanAmount(values.target)
  if (!values.name.trim()) return 'Please enter a name.'
  if (target === null) return 'Please enter a target above $0.'
  if (!values.by) return 'Please pick a date.'
  return {
    name: values.name.trim(),
    saved: Number(values.saved) || 0,
    target,
    monthly: Number(values.monthly) || 0,
    by: values.by,
  }
}

const milestoneFields = [
  { name: 'target', label: 'Reach ($)', type: 'number' },
  { name: 'by', label: 'By', type: 'date' },
]

function validateMilestone(values) {
  const target = cleanAmount(values.target)
  if (target === null) return 'Please enter an amount above $0.'
  if (!values.by) return 'Please pick a date.'
  return { target, by: values.by }
}

// goals and setGoals come from App.jsx, so savings added from
// Quick Actions show up here too.
function LongTermGoalsPage({ onNavigate, goals, setGoals }) {
  const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?.id ?? null)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  // Which pop-up is open: null, 'addGoal', 'updateGoal', 'addMilestone' or 'updateMilestone'
  const [popup, setPopup] = useState(null)

  const selectedGoal = goals.find((g) => g.id === selectedGoalId)
  const selectedMilestone = selectedGoal?.milestones.find((m) => m.id === selectedMilestoneId)

  function selectGoal(id) {
    setSelectedGoalId(id)
    setSelectedMilestoneId(null)
  }

  // Change some fields of the selected goal, e.g. updateSelectedGoal({ name: 'Car' })
  function updateSelectedGoal(changes) {
    setGoals(goals.map((g) => (g.id === selectedGoalId ? { ...g, ...changes } : g)))
  }

  // ---------- Goals ----------

  function saveGoal(values) {
    if (popup === 'addGoal') {
      // A starting amount counts as the first entry in the record history.
      const history = values.saved > 0
        ? [{ id: makeId(), date: todayString(), amount: values.saved, note: 'Starting amount' }]
        : []
      const newGoal = { id: makeId(), ...values, milestones: [], history }
      setGoals([...goals, newGoal])
      selectGoal(newGoal.id)
    } else {
      // If "saved so far" changed, record the difference in the history.
      const difference = values.saved - selectedGoal.saved
      const history = difference !== 0
        ? [...selectedGoal.history, { id: makeId(), date: todayString(), amount: difference, note: 'Updated by hand' }]
        : selectedGoal.history
      updateSelectedGoal({ ...values, history })
    }
    setPopup(null)
  }

  // ---------- Milestones (belong to the selected goal) ----------

  function saveMilestone(values) {
    if (popup === 'addMilestone') {
      updateSelectedGoal({ milestones: [...selectedGoal.milestones, { id: makeId(), ...values }] })
    } else {
      updateSelectedGoal({
        milestones: selectedGoal.milestones.map((m) => (m.id === selectedMilestoneId ? { ...m, ...values } : m)),
      })
    }
    setPopup(null)
  }

  function deleteMilestone() {
    updateSelectedGoal({ milestones: selectedGoal.milestones.filter((m) => m.id !== selectedMilestoneId) })
    setSelectedMilestoneId(null)
  }

  return (
    <section className='page long-term-page'>
      <GoalsTopBar activeTab='longTermGoals' onNavigate={onNavigate}>
        <button
          className={showHistory ? 'tab active' : 'tab'}
          onClick={() => setShowHistory(!showHistory)}
          aria-pressed={showHistory}
        >
          Current Goal Record History
        </button>
      </GoalsTopBar>

      <div className='goals-content'>
        {/* ---------- Left: goal list ---------- */}
        <div className='card-color'>
          <h2>Goal list</h2>
          <div className='button-row'>
            <button className='primary' onClick={() => setPopup('addGoal')}>Add Goal</button>
            <button onClick={() => setPopup('updateGoal')} disabled={!selectedGoal}>Update Goal</button>
          </div>

          {goals.length === 0 && <p className='empty'>No goals yet.</p>}
          {goals.map((goal) => (
            <button
              key={goal.id}
              className={goal.id === selectedGoalId ? 'row-button selected' : 'row-button'}
              onClick={() => selectGoal(goal.id)}
              aria-pressed={goal.id === selectedGoalId}
            >
              <span>
                <h3>{goal.name}</h3>
                <p>By: {formatDate(goal.by)}</p>
                <p>{percent(goal.saved, goal.target)}% Complete</p>
              </span>
            </button>
          ))}
        </div>

        {/* ---------- Right: the selected goal ---------- */}
        {!selectedGoal ? (
          <div className='card-color'>
            <p className='empty'>Select or add a goal.</p>
          </div>
        ) : showHistory ? (
          <div className='card-color'>
            <h2>{selectedGoal.name}: record history</h2>
            <p className='muted'>Every time money was added to this goal.</p>
            {selectedGoal.history.length === 0 && <p className='empty'>Nothing recorded yet.</p>}
            {[...selectedGoal.history].reverse().map((entry) => (
              <div key={entry.id} className='list-item history-row'>
                <span>{entry.date}</span>
                <span>{entry.note}</span>
                <span className={entry.amount >= 0 ? 'positive' : 'negative'}>
                  {entry.amount >= 0 ? '+' : '−'}{formatMoney(Math.abs(entry.amount))}
                </span>
              </div>
            ))}
            <p className='history-total'>Now saved: <strong>{formatMoney(selectedGoal.saved)}</strong></p>
          </div>
        ) : (
          <div className='card-color'>
            <div className='goal-summary'>
              <h2>{selectedGoal.name}</h2>
              <p className='big'>{formatMoney(selectedGoal.saved)} out of {formatMoney(selectedGoal.target)}</p>
              <p>{percent(selectedGoal.saved, selectedGoal.target)}% Complete</p>
              <p>Contributing {formatMoney(selectedGoal.monthly)} per month</p>
              <p>By: {formatDate(selectedGoal.by)}</p>
              <ProgressRow value={percent(selectedGoal.saved, selectedGoal.target)} />
            </div>

            {/* ---------- Milestones ---------- */}
            <div className='card-header'>
              <h2>Milestones</h2>
              <div className='button-row'>
                <button onClick={() => setPopup('addMilestone')}>Add New</button>
                <button onClick={() => setPopup('updateMilestone')} disabled={!selectedMilestone}>Update</button>
                <button onClick={deleteMilestone} disabled={!selectedMilestone}>Delete</button>
              </div>
            </div>
            <p className='muted'>Click a milestone to select it.</p>

            {selectedGoal.milestones.length === 0 && <p className='empty'>No milestones yet.</p>}
            {selectedGoal.milestones.map((ms, index) => {
              // A milestone's progress is how much of the goal's saved money reaches its target.
              const progress = percent(selectedGoal.saved, ms.target)
              return (
                <button
                  key={ms.id}
                  className={ms.id === selectedMilestoneId ? 'row-button milestone selected' : 'row-button milestone'}
                  onClick={() => setSelectedMilestoneId(ms.id)}
                  aria-pressed={ms.id === selectedMilestoneId}
                >
                  <h3>MS{index + 1} - {progress >= 100 ? 'Complete' : 'In Progress'}</h3>
                  <p>Reach {formatMoney(ms.target)}</p>
                  <p>By: {formatDate(ms.by)}</p>
                  <ProgressRow value={progress} />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ---------- Pop-ups ---------- */}
      {(popup === 'addGoal' || popup === 'updateGoal') && (
        <Modal title={popup === 'addGoal' ? 'New Goal' : 'Update Goal'} onClose={() => setPopup(null)}>
          <SimpleForm
            fields={goalFields}
            initialValues={popup === 'updateGoal' ? selectedGoal : {}}
            submitLabel={popup === 'addGoal' ? 'Create Goal' : 'Save Changes'}
            validate={validateGoal}
            onSubmit={saveGoal}
          />
        </Modal>
      )}
      {(popup === 'addMilestone' || popup === 'updateMilestone') && (
        <Modal title={popup === 'addMilestone' ? 'New Milestone' : 'Update Milestone'} onClose={() => setPopup(null)}>
          <SimpleForm
            fields={milestoneFields}
            initialValues={popup === 'updateMilestone' ? selectedMilestone : {}}
            submitLabel={popup === 'addMilestone' ? 'Add Milestone' : 'Save Changes'}
            validate={validateMilestone}
            onSubmit={saveMilestone}
          />
        </Modal>
      )}
    </section>
  )
}

// "40%" label followed by a progress bar.
function ProgressRow({ value }) {
  return (
    <div className='progress-row' role='progressbar' aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span>{value}%</span>
      <div className='progress-bar'>
        <div className='progress-fill' style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default LongTermGoalsPage
