'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup' | 'forgot'
const TITLES: Record<Mode, [string, string]> = {
  signin: ['Welcome back', 'Sign in'],
  signup: ['Create your account', 'Create account'],
  forgot: ['Reset your password', 'Send reset link'],
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const supabase = createClient()
    const origin = window.location.origin
    const enter = () => { router.push('/dashboard'); router.refresh() }
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      error ? setMsg({ ok: false, text: error.message }) : enter()
    } else if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback` } })
      if (error) setMsg({ ok: false, text: error.message })
      else if (data.session) enter()
      else setMsg({ ok: true, text: 'Check your email to confirm your account, then sign in.' })
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/settings` })
      setMsg(error ? { ok: false, text: error.message } : { ok: true, text: 'Reset link sent. Check your email.' })
    }
    setBusy(false)
  }

  const switchTo = (m: Mode) => { setMode(m); setMsg(null) }
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <div>
          <p className="text-sm text-muted">My Life OS</p>
          <h1 className="text-2xl font-bold">{TITLES[mode][0]}</h1>
        </div>
        <label className="block space-y-1 text-sm">Email
          <input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {mode !== 'forgot' && (
          <label className="block space-y-1 text-sm">Password
            <input className="input" type="password" required minLength={8} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        )}
        {msg && <p role="alert" className={`text-sm ${msg.ok ? 'text-success' : 'text-danger'}`}>{msg.text}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Please wait…' : TITLES[mode][1]}</button>
        <div className="flex justify-between text-sm text-muted">
          {mode === 'signin' ? (
            <>
              <button type="button" className="hover:text-ink" onClick={() => switchTo('signup')}>Create an account</button>
              <button type="button" className="hover:text-ink" onClick={() => switchTo('forgot')}>Forgot password?</button>
            </>
          ) : (
            <button type="button" className="hover:text-ink" onClick={() => switchTo('signin')}>Back to sign in</button>
          )}
        </div>
      </form>
    </main>
  )
}
