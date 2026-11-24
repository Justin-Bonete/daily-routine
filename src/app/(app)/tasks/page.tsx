'use client'
import { useEffect, useMemo, useState } from 'react'
import { Bell, ChevronRight, Pencil, Plus, Repeat, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  EMPTY, PRIORITY_RANK, PRIORITY_STYLE, VIEWS, fmt, inView, nextDue, toIso, toLocal,
  type Form, type Priority, type Recurrence, type Task, type View,
} from '@/lib/tasks'

function TaskForm({ task, onSave, onClose }: { task: Task | null; onSave: (f: Form) => Promise<void>; onClose: () => void }) {
  const [f, setF] = useState<Form>({
    title: task?.title ?? '', description: task?.description ?? '', category: task?.category ?? '',
    priority: task?.priority ?? 'medium', due_at: toLocal(task?.due_at ?? null),
    reminder_at: toLocal(task?.reminder_at ?? null), recurrence: task?.recurrence ?? '',
  })
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }))
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    await onSave(f)
    setBusy(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="card max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-b-none p-5 sm:rounded-b-xl">
        <h2 className="text-lg font-bold">{task ? 'Edit task' : 'New task'}</h2>
        <label className="block space-y-1 text-sm">Title
          <input className="input" required maxLength={200} autoFocus value={f.title} onChange={(e) => set('title', e.target.value)} />
        </label>
        <label className="block space-y-1 text-sm">Description
          <textarea className="input" rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">Priority
            <select className="input" value={f.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
              <option value="urgent">Urgent</option><option value="high">High</option>
              <option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">Category
            <input className="input" maxLength={40} value={f.category} onChange={(e) => set('category', e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">Due
            <input className="input" type="datetime-local" value={f.due_at} onChange={(e) => set('due_at', e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">Reminder
            <input className="input" type="datetime-local" value={f.reminder_at} onChange={(e) => set('reminder_at', e.target.value)} />
          </label>
        </div>
        <label className="block space-y-1 text-sm">Repeat
          <select className="input" value={f.recurrence} onChange={(e) => set('recurrence', e.target.value as Form['recurrence'])}>
            <option value="">Does not repeat</option><option value="daily">Daily</option>
            <option value="weekly">Weekly</option><option value="monthly">Monthly</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="rounded-lg px-4 py-2 text-sm text-muted hover:text-ink" onClick={onClose}>Cancel</button>
          <button className="btn-primary !w-auto" disabled={busy}>{busy ? 'Saving…' : 'Save task'}</button>
        </div>
      </form>
    </div>
  )
}

function SubAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [v, setV] = useState('')
  return (
    <form className="flex gap-2 pt-1" onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV('') } }}>
      <input className="input !py-1.5" maxLength={200} placeholder="Add a subtask" value={v} onChange={(e) => setV(e.target.value)} />
      <button className="btn-icon" aria-label="Add subtask"><Plus size={18} /></button>
    </form>
  )
}

export default function TasksPage() {
  const supabase = useMemo(() => createClient(), [])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('today')
  const [editing, setEditing] = useState<Task | 'new' | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('tasks').select('*').order('created_at').then(({ data, error }) => {
      if (error) setError(error.message)
      else setTasks(data as Task[])
      setLoading(false)
    })
  }, [supabase])

  async function save(f: Form) {
    const title = f.title.trim()
    if (!title) return setError('Title is required.')
    const row = {
      title, description: f.description.trim() || null, category: f.category.trim() || null, priority: f.priority,
      due_at: toIso(f.due_at), reminder_at: toIso(f.reminder_at), recurrence: f.recurrence || null,
    }
    if (editing && editing !== 'new') {
      const { data, error } = await supabase.from('tasks').update(row).eq('id', editing.id).select().single()
      if (error) return setError(error.message)
      setTasks((ts) => ts.map((t) => (t.id === data.id ? data : t)))
    } else {
      const { data, error } = await supabase.from('tasks').insert(row).select().single()
      if (error) return setError(error.message)
      setTasks((ts) => [...ts, data])
    }
    setError(null)
    setEditing(null)
  }

  async function toggle(t: Task) {
    const completed_at = t.completed_at ? null : new Date().toISOString()
    const { data, error } = await supabase.from('tasks').update({ completed_at }).eq('id', t.id).select().single()
    if (error) return setError(error.message)
    let added: Task[] = []
    if (completed_at && t.recurrence && !t.parent_id) {
      const due = nextDue(t.due_at, t.recurrence)
      const shift = t.due_at ? +new Date(due) - +new Date(t.due_at) : 0
      const next = {
        title: t.title, description: t.description, category: t.category, priority: t.priority,
        recurrence: t.recurrence, due_at: due,
        reminder_at: t.reminder_at && t.due_at ? new Date(+new Date(t.reminder_at) + shift).toISOString() : null,
      }
      const res = await supabase.from('tasks').insert(next).select().single()
      if (res.error) return setError(res.error.message)
      added = [res.data]
    }
    setError(null)
    setTasks((ts) => [...ts.map((x) => (x.id === t.id ? data : x)), ...added])
  }

  async function remove(t: Task) {
    if (!confirm(`Delete "${t.title}"?`)) return
    const { error } = await supabase.from('tasks').delete().eq('id', t.id)
    if (error) return setError(error.message)
    setTasks((ts) => ts.filter((x) => x.id !== t.id && x.parent_id !== t.id))
  }

  async function addSub(parent: Task, title: string) {
    const { data, error } = await supabase.from('tasks')
      .insert({ title, parent_id: parent.id, priority: parent.priority }).select().single()
    if (error) return setError(error.message)
    setTasks((ts) => [...ts, data])
  }

  const parents = tasks.filter((t) => !t.parent_id)
  const subs = (id: string) => tasks.filter((t) => t.parent_id === id)
  const cmp = (a: Task, b: Task) =>
    (+!!a.completed_at - +!!b.completed_at) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    (a.due_at ?? '9').localeCompare(b.due_at ?? '9')
  const shown = parents.filter((t) => inView(t, view)).sort(cmp)
  const now = new Date()

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">My Tasks</h1>
        <button className="btn-primary flex !w-auto items-center gap-2" onClick={() => setEditing('new')}><Plus size={18} />New task</button>
      </header>

      <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {VIEWS.map((v) => {
          const n = parents.filter((t) => inView(t, v.id)).length
          return (
            <button key={v.id} role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm ${view === v.id ? 'border-primary font-semibold text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
              {v.label} <span className="text-xs text-muted">{n}</span>
            </button>
          )
        })}
      </div>

      {error && <p role="alert" className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">{error}</p>}
      {loading && <p className="text-muted">Loading tasks…</p>}
      {!loading && shown.length === 0 && <p className="card p-8 text-center text-muted">{EMPTY[view]}</p>}

      <ul className="space-y-2">
        {shown.map((t) => {
          const children = subs(t.id)
          const doneCount = children.filter((c) => c.completed_at).length
          const late = !t.completed_at && t.due_at && new Date(t.due_at) < now
          return (
            <li key={t.id} className="card p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={!!t.completed_at}
                  onChange={() => toggle(t)} aria-label={`Complete ${t.title}`} />
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${t.completed_at ? 'text-muted line-through' : ''}`}>{t.title}</p>
                  {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-semibold capitalize ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                    {t.category && <span className="rounded-full border border-line px-2 py-0.5 text-muted">{t.category}</span>}
                    {t.due_at && <span className={late ? 'text-danger' : 'text-muted'}>Due {fmt(t.due_at)}</span>}
                    {t.reminder_at && <span className="flex items-center gap-1 text-muted"><Bell size={12} />{fmt(t.reminder_at)}</span>}
                    {t.recurrence && <span className="flex items-center gap-1 capitalize text-muted"><Repeat size={12} />{t.recurrence}</span>}
                    {t.completed_at && <span className="text-success">Done {fmt(t.completed_at)}</span>}
                  </div>
                </div>
                <div className="flex shrink-0">
                  <button className="btn-icon flex items-center gap-1 text-xs" onClick={() => setOpen(open === t.id ? null : t.id)} aria-expanded={open === t.id}>
                    <ChevronRight size={16} className={open === t.id ? 'rotate-90' : ''} />{children.length > 0 && `${doneCount}/${children.length}`}
                  </button>
                  <button className="btn-icon" aria-label="Edit task" onClick={() => setEditing(t)}><Pencil size={16} /></button>
                  <button className="btn-icon" aria-label="Delete task" onClick={() => remove(t)}><Trash2 size={16} /></button>
                </div>
              </div>
              {open === t.id && (
                <div className="mt-3 space-y-1 border-t border-line pl-7 pt-3">
                  {children.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="h-4 w-4 accent-primary" checked={!!s.completed_at} onChange={() => toggle(s)} aria-label={`Complete ${s.title}`} />
                      <span className={`flex-1 ${s.completed_at ? 'text-muted line-through' : ''}`}>{s.title}</span>
                      <button className="btn-icon" aria-label="Delete subtask" onClick={() => remove(s)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <SubAdd onAdd={(title) => addSub(t, title)} />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {editing && <TaskForm task={editing === 'new' ? null : editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}
