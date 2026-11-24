export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type Recurrence = 'daily' | 'weekly' | 'monthly'
export type View = 'today' | 'upcoming' | 'overdue' | 'completed' | 'all'
export type Task = {
  id: string; parent_id: string | null; title: string; description: string | null; category: string | null
  priority: Priority; due_at: string | null; reminder_at: string | null; recurrence: Recurrence | null
  completed_at: string | null; created_at: string
}
export type Form = {
  title: string; description: string; category: string; priority: Priority
  due_at: string; reminder_at: string; recurrence: '' | Recurrence
}

export const VIEWS: { id: View; label: string }[] = [
  { id: 'today', label: 'Today' }, { id: 'upcoming', label: 'Upcoming' }, { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' }, { id: 'all', label: 'All tasks' },
]
export const EMPTY: Record<View, string> = {
  today: 'Nothing due today.', upcoming: 'No upcoming tasks. Add one to plan ahead.', overdue: 'Nothing overdue.',
  completed: 'No completed tasks yet.', all: 'No tasks yet. Add your first one.',
}
export const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
export const PRIORITY_STYLE: Record<Priority, string> = {
  urgent: 'bg-danger/15 text-danger', high: 'bg-warning/15 text-warning',
  medium: 'bg-primary/15 text-primary', low: 'bg-muted/15 text-muted',
}

// Today = due today. Upcoming = due after today, or no due date. Overdue = due time has passed.
export function inView(t: Task, v: View, now = new Date()): boolean {
  if (v === 'all') return true
  if (v === 'completed') return !!t.completed_at
  if (t.completed_at) return false
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + 86400000)
  if (!t.due_at) return v === 'upcoming'
  const due = new Date(t.due_at)
  if (v === 'overdue') return due < now
  if (v === 'today') return due >= start && due < end
  return due >= end
}

export function nextDue(iso: string | null, r: Recurrence): string {
  const d = iso ? new Date(iso) : new Date()
  do {
    if (r === 'daily') d.setDate(d.getDate() + 1)
    else if (r === 'weekly') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
  } while (d <= new Date())
  return d.toISOString()
}

export const toIso = (v: string) => (v ? new Date(v).toISOString() : null)
export function toLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
export const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
