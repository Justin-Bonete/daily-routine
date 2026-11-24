'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import { NAV } from '@/lib/nav'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from './ThemeToggle'

export default function Shell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  async function signOut() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }
  return (
    <div className="min-h-screen lg:flex">
      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-sidebar transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-5">
          <span className="text-lg font-bold">My Life OS</span>
          <button className="btn-icon lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = path === href
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? 'bg-primary/15 font-semibold text-ink' : 'text-muted hover:bg-card hover:text-ink'}`}>
                <Icon size={18} className={active ? 'text-primary' : ''} />{label}
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center justify-between border-t border-line p-3">
          <span className="min-w-0 truncate px-2 text-sm">{name}</span>
          <div className="flex gap-1">
            <ThemeToggle />
            <button className="btn-icon" onClick={signOut} aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center border-b border-line px-4 lg:hidden">
          <button className="btn-icon" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={22} /></button>
          <span className="ml-2 font-bold">My Life OS</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
