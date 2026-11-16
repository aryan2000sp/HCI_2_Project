// Starting data and small helpers shared by every page.

// ---------- Ids ----------
// Gives each new item its own id: 1000, 1001, 1002...
let nextId = 1000
export function makeId() {
  return nextId++
}

// ---------- Months ----------
// A month is stored as a key like '2027-01' so items can be grouped by month.
export function monthKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

// Date -> 'January, 2027'
export function monthLabel(date) {
  return `${date.toLocaleString('en-US', { month: 'long' })}, ${date.getFullYear()}`
}

// ---------- Due dates ----------
// A due date is either 'MM/DD/YYYY' or one of these repeating options.
export const frequencies = ['Daily', 'Weekly', 'Bi-weekly', 'Once a month']

// Checks what the user typed. Returns the cleaned-up value, or null if it's not valid.
// '01/30/2027' -> '01/30/2027', 'weekly' -> 'Weekly', 'next tuesday' -> null
export function cleanDue(text) {
  const typed = text.trim()

  const match = frequencies.find((f) => f.toLowerCase() === typed.toLowerCase())
  if (match) return match

  const parts = typed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!parts) return null
  const [, mm, dd, yyyy] = parts.map(Number)
  const date = new Date(yyyy, mm - 1, dd)
  // new Date() rolls bad dates over (02/31 becomes 03/03), so check it stayed the same.
  if (date.getMonth() !== mm - 1 || date.getDate() !== dd) return null
  return `${String(mm).padStart(2, '0')}/${String(dd).padStart(2, '0')}/${yyyy}`
}

export function isRepeating(due) {
  return frequencies.includes(due)
}

// '01/30/2027' -> 'Due by 01/30/2027', 'Weekly' -> 'Weekly'
export function formatDue(due) {
  return isRepeating(due) ? due : `Due by ${due}`
}

// Items for one month: the ones added to that month, plus all repeating ones.
export function itemsForMonth(items, date) {
  const key = monthKey(date)
  return items.filter((item) => item.month === key || isRepeating(item.due))
}

export function total(items) {
  return items.reduce((sum, item) => sum + item.amount, 0)
}

// ---------- Starting data (from the wireframes) ----------
export const startingMonth = new Date(2027, 0, 1) // January 2027

export const startingExpenses = [
  { id: 1, title: 'Rent', amount: 770, due: '01/30/2027', month: '2027-01' },
  { id: 2, title: 'Water', amount: 110, due: '01/30/2027', month: '2027-01' },
  { id: 3, title: 'Electricity', amount: 110, due: '01/30/2027', month: '2027-01' },
  { id: 4, title: 'Music Subscription', amount: 15, due: 'Once a month', month: '2027-01' },
]

export const startingIncome = [
  { id: 1, title: 'Paycheque', amount: 2010, due: 'Once a month', month: '2027-01' },
]

// Goal dates are 'YYYY-MM-DD' because that's what <input type='date'> uses.
export const startingGoals = [
  {
    id: 1,
    name: 'Home Down Payment',
    saved: 40000,
    target: 100000,
    monthly: 200,
    by: '2032-02-02',
    milestones: [{ id: 1, target: 50000, by: '2029-02-02' }],
  },
  {
    id: 2,
    name: 'Buying that old Jeep',
    saved: 0,
    target: 8000,
    monthly: 150,
    by: '2028-11-25',
    milestones: [],
  },
]
