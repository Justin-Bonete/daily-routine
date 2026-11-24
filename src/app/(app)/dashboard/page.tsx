import { createClient } from '@/lib/supabase/server'

const STATS = ['Tasks today', 'Habit streak', 'Focus hours', 'Net profit']

export default async function Dashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('display_name, timezone').eq('id', user!.id).maybeSingle()
  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: profile?.timezone ?? 'Asia/Manila',
  })
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome, {profile?.display_name ?? 'there'}</h1>
        <p className="text-muted">{today}</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <div key={s} className="card p-5">
            <p className="text-sm text-muted">{s}</p>
            <p className="mt-2 text-2xl font-bold">–</p>
            <p className="mt-1 text-xs text-muted">Appears once you add data</p>
          </div>
        ))}
      </section>
    </div>
  )
}
