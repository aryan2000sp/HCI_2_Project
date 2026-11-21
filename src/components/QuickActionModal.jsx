import Modal from './Modal.jsx'
import SimpleForm from './SimpleForm.jsx'
import { cleanDue, cleanAmount, monthLabel } from '../data/financeData.js'

// The fields shared by the expense and income forms.
function entryFields(amountLabel, dateLabel) {
  return [
    { name: 'title', label: 'Title' },
    { name: 'amount', label: amountLabel, type: 'number' },
    { name: 'due', label: dateLabel, hint: '(MM/DD/YYYY), or: Daily, Weekly, Bi-weekly, Once a month' },
  ]
}

// Checks an expense or income form. Returns an error message or the cleaned values.
function validateEntry(values) {
  const amount = cleanAmount(values.amount)
  const due = cleanDue(values.due)
  if (!values.title.trim()) return 'Please enter a title.'
  if (amount === null) return 'Please enter an amount above $0.'
  if (!due) return 'Enter a date like 01/30/2027, or Daily, Weekly, Bi-weekly, Once a month.'
  return { title: values.title.trim(), amount, due }
}

// The pop-up opened by Quick Actions, and by clicking an expense or income to edit it.
// modal is { type, item }: type is 'expense', 'income' or 'savings';
// item is the expense/income being edited, or null when adding a new one.
function QuickActionModal({ modal, month, goals, actions, onClose }) {
  const { type, item } = modal
  const editing = Boolean(item)

  // Run an action, then close the pop-up.
  function andClose(action) {
    return (...args) => {
      action(...args)
      onClose()
    }
  }

  if (type === 'expense' || type === 'income') {
    const isExpense = type === 'expense'
    const word = isExpense ? 'Expense' : 'Income'
    const title = editing ? `Edit ${word}` : `New ${word} for ${monthLabel(month)}`

    return (
      <Modal title={title} onClose={onClose}>
        <SimpleForm
          fields={entryFields(isExpense ? 'Amount Due ($)' : 'Amount ($)', isExpense ? 'Due Date' : 'Pay Date')}
          initialValues={item ?? {}}
          submitLabel={editing ? 'Save Changes' : isExpense ? 'Create Expense' : 'Add Income'}
          validate={validateEntry}
          onSubmit={andClose((values) =>
            editing ? actions.update(type, item.id, values) : actions.add(type, values)
          )}
          onDelete={editing ? andClose(() => actions.remove(type, item.id)) : undefined}
        />
      </Modal>
    )
  }

  if (type === 'savings') {
    if (goals.length === 0) {
      return (
        <Modal title='Add to Savings Goal' onClose={onClose}>
          <p>Add a long-term goal first, then you can save toward it.</p>
        </Modal>
      )
    }
    return (
      <Modal title='Add to Savings Goal' onClose={onClose}>
        <SimpleForm
          fields={[
            { name: 'goalId', label: 'Goal', type: 'select', options: goals.map((g) => ({ value: g.id, label: g.name })) },
            { name: 'amount', label: 'Amount ($)', type: 'number' },
          ]}
          submitLabel='Add Savings'
          validate={(values) => {
            const amount = cleanAmount(values.amount)
            if (amount === null) return 'Please enter an amount above $0.'
            return { goalId: Number(values.goalId), amount }
          }}
          onSubmit={andClose((values) => actions.addSavings(values.goalId, values.amount))}
        />
      </Modal>
    )
  }

  return null
}

export default QuickActionModal
