'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  async function save(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await createClient().auth.updateUser({ password })
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Password updated.' })
    if (!error) setPassword('')
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
      <form onSubmit={save} className="card max-w-md space-y-4 p-6">
        <h2 className="font-semibold">Change password</h2>
        <input className="input" type="password" required minLength={8} autoComplete="new-password" placeholder="New password (8+ characters)"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg && <p role="alert" className={`text-sm ${msg.ok ? 'text-success' : 'text-danger'}`}>{msg.text}</p>}
        <button className="btn-primary">Update password</button>
      </form>
    </div>
  )
}
