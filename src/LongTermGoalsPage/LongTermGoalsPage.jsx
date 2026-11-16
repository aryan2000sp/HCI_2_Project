import { useState } from 'react'
import '../Sass/card.scss'
import '../Sass/MonthlyGoalsPage.scss' // shared goal page styles (top bar, buttons, progress bar)
import '../Sass/LongTermGoalsPage.scss'
import GoalsTopBar from '../components/GoalsTopBar.jsx'
import { makeId } from '../data/financeData.js'

// ---------- Small helper functions ----------

// '2032-02-02' -> '02/02/2032'
function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${month}/${day}/${year}`
}

// 40000 -> '$40,000'
function formatMoney(amount) {
  return '$' + amount.toLocaleString('en-US')
}

// How far "saved" is toward "target", as a whole number from 0 to 100.
function percent(saved, target) {
  if (target <= 0) return 0
  return Math.min(Math.round((saved / target) * 100), 100)
}

// Empty forms, used when adding something new.
const emptyGoalForm = { name: '', saved: '', target: '', monthly: '', by: '' }
const emptyMilestoneForm = { target: '', by: '' }

// goals and setGoals come from App.jsx, so savings added from the
// home page's Quick Actions show up here too.
function LongTermGoalsPage({ onNavigate, goals, setGoals }) {
  const [selectedGoalId, setSelectedGoalId] = useState(1)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  // goalFormMode: null (form hidden), 'add' or 'update'. Same idea for milestones.
  const [goalFormMode, setGoalFormMode] = useState(null)
  const [goalForm, setGoalForm] = useState(emptyGoalForm)
  const [milestoneFormMode, setMilestoneFormMode] = useState(null)
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestoneForm)

  const selectedGoal = goals.find((g) => g.id === selectedGoalId)

  // ---------- Goals ----------

  function selectGoal(id) {
    setSelectedGoalId(id)
    setSelectedMilestoneId(null)
    setMilestoneFormMode(null)
  }

  function openAddGoal() {
    setGoalForm(emptyGoalForm)
    setGoalFormMode('add')
  }

  function openUpdateGoal() {
    if (!selectedGoal) return
    // Fill the form with the selected goal's current values.
    setGoalForm({
      name: selectedGoal.name,
      saved: selectedGoal.saved,
      target: selectedGoal.target,
      monthly: selectedGoal.monthly,
      by: selectedGoal.by,
    })
    setGoalFormMode('update')
  }

  function saveGoal(event) {
    event.preventDefault()
    const values = {
      name: goalForm.name.trim(),
      saved: Number(goalForm.saved) || 0,
      target: Number(goalForm.target),
      monthly: Number(goalForm.monthly) || 0,
      by: goalForm.by,
    }
    if (!values.name || !values.target || !values.by) return

    if (goalFormMode === 'add') {
      const newGoal = { id: makeId(), ...values, milestones: [] }
      setGoals([...goals, newGoal])
      setSelectedGoalId(newGoal.id)
    } else {
      // Replace only the selected goal; keep its milestones.
      setGoals(goals.map((g) => (g.id === selectedGoalId ? { ...g, ...values } : g)))
    }
    setGoalFormMode(null)
  }

  // ---------- Milestones (belong to the selected goal) ----------

  // Helper: change the milestones list of the selected goal.
  function setMilestones(newMilestones) {
    setGoals(goals.map((g) => (g.id === selectedGoalId ? { ...g, milestones: newMilestones } : g)))
  }

  function openAddMilestone() {
    setMilestoneForm(emptyMilestoneForm)
    setMilestoneFormMode('add')
  }

  function openUpdateMilestone() {
    const milestone = selectedGoal.milestones.find((m) => m.id === selectedMilestoneId)
    if (!milestone) return
    setMilestoneForm({ target: milestone.target, by: milestone.by })
    setMilestoneFormMode('update')
  }

  function deleteMilestone() {
    if (!selectedMilestoneId) return
    setMilestones(selectedGoal.milestones.filter((m) => m.id !== selectedMilestoneId))
    setSelectedMilestoneId(null)
    setMilestoneFormMode(null)
  }

  function saveMilestone(event) {
    event.preventDefault()
    const values = { target: Number(milestoneForm.target), by: milestoneForm.by }
    if (!values.target || !values.by) return

    if (milestoneFormMode === 'add') {
      setMilestones([...selectedGoal.milestones, { id: makeId(), ...values }])
    } else {
      setMilestones(
        selectedGoal.milestones.map((m) => (m.id === selectedMilestoneId ? { ...m, ...values } : m))
      )
    }
    setMilestoneFormMode(null)
  }

  // Updates one field of a form object, e.g. updateField(setGoalForm, 'name', 'Car')
  function updateField(setForm, field, value) {
    setForm((form) => ({ ...form, [field]: value }))
  }

  return (
    <section className='goals-page long-term-page'>
      <GoalsTopBar activeTab='longTermGoals' onNavigate={onNavigate}>
        <button
          className={showHistory ? 'tab active' : 'tab'}
          onClick={() => setShowHistory(!showHistory)}
        >
          Current Goal Record History
        </button>
      </GoalsTopBar>

      <div className='goals-content'>
        {/* ---------- Left: goal list ---------- */}
        <div className='goal-list card-color'>
          <h2 className='centered'>Goal List</h2>
          <div className='button-row'>
            <button onClick={openAddGoal}>Add Goal</button>
            <button onClick={openUpdateGoal} disabled={!selectedGoal}>Update Goal</button>
          </div>

          {goalFormMode && (
            <form className='edit-form' onSubmit={saveGoal}>
              <h3>{goalFormMode === 'add' ? 'New Goal' : 'Update Goal'}</h3>
              <label>Name
                <input value={goalForm.name} onChange={(e) => updateField(setGoalForm, 'name', e.target.value)} />
              </label>
              <label>Saved so far ($)
                <input type='number' value={goalForm.saved} onChange={(e) => updateField(setGoalForm, 'saved', e.target.value)} />
              </label>
              <label>Target ($)
                <input type='number' value={goalForm.target} onChange={(e) => updateField(setGoalForm, 'target', e.target.value)} />
              </label>
              <label>Contribution per month ($)
                <input type='number' value={goalForm.monthly} onChange={(e) => updateField(setGoalForm, 'monthly', e.target.value)} />
              </label>
              <label>By
                <input type='date' value={goalForm.by} onChange={(e) => updateField(setGoalForm, 'by', e.target.value)} />
              </label>
              <div className='button-row'>
                <button type='submit'>Save</button>
                <button type='button' onClick={() => setGoalFormMode(null)}>Cancel</button>
              </div>
            </form>
          )}

          <ul className='item-list'>
            {goals.map((goal) => (
              <li
                key={goal.id}
                className={goal.id === selectedGoalId ? 'list-item selected' : 'list-item'}
                onClick={() => selectGoal(goal.id)}
              >
                <h3>{goal.name}</h3>
                <p>By: {formatDate(goal.by)}</p>
                <p>{percent(goal.saved, goal.target)}% Complete</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Right: selected goal details ---------- */}
        {showHistory ? (
          <div className='goal-detail card-color'>
            <h2>Record History</h2>
            <p>Coming soon.</p>
          </div>
        ) : selectedGoal ? (
          <div className='goal-detail card-color'>
            <div className='goal-summary'>
              <h2>{selectedGoal.name}</h2>
              <p className='big'>{formatMoney(selectedGoal.saved)} out of {formatMoney(selectedGoal.target)}</p>
              <p>{percent(selectedGoal.saved, selectedGoal.target)}% Complete</p>
              <p>Contributing ${selectedGoal.monthly.toFixed(2)} per month</p>
              <p>By: {formatDate(selectedGoal.by)}</p>
              <ProgressRow value={percent(selectedGoal.saved, selectedGoal.target)} />
            </div>

            {/* ---------- Milestones ---------- */}
            <div className='milestones-header'>
              <h2>Milestones</h2>
              <button onClick={openAddMilestone}>Add New</button>
              <button onClick={openUpdateMilestone} disabled={!selectedMilestoneId}>Update</button>
              <button onClick={deleteMilestone} disabled={!selectedMilestoneId}>Delete</button>
            </div>

            {milestoneFormMode && (
              <form className='edit-form' onSubmit={saveMilestone}>
                <h3>{milestoneFormMode === 'add' ? 'New Milestone' : 'Update Milestone'}</h3>
                <label>Reach ($)
                  <input type='number' value={milestoneForm.target} onChange={(e) => updateField(setMilestoneForm, 'target', e.target.value)} />
                </label>
                <label>By
                  <input type='date' value={milestoneForm.by} onChange={(e) => updateField(setMilestoneForm, 'by', e.target.value)} />
                </label>
                <div className='button-row'>
                  <button type='submit'>Save</button>
                  <button type='button' onClick={() => setMilestoneFormMode(null)}>Cancel</button>
                </div>
              </form>
            )}

            <ul className='item-list'>
              {selectedGoal.milestones.length === 0 && <p>No milestones yet.</p>}
              {selectedGoal.milestones.map((ms, index) => {
                // A milestone's progress is how much of the goal's saved money reaches its target.
                const progress = percent(selectedGoal.saved, ms.target)
                return (
                  <li
                    key={ms.id}
                    className={ms.id === selectedMilestoneId ? 'list-item selected' : 'list-item'}
                    onClick={() => setSelectedMilestoneId(ms.id)}
                  >
                    <h3>MS{index + 1} - {progress >= 100 ? 'Complete' : 'In Progress'}</h3>
                    <p>Reach {formatMoney(ms.target)}</p>
                    <p>By: {formatDate(ms.by)}</p>
                    <ProgressRow value={progress} />
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <div className='goal-detail card-color'>
            <p>Select or add a goal.</p>
          </div>
        )}
      </div>
    </section>
  )
}

// "40%" label followed by a progress bar.
function ProgressRow({ value }) {
  return (
    <div className='progress-row'>
      <span>{value}%</span>
      <div className='progress-bar'>
        <div className='progress-fill' style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default LongTermGoalsPage
