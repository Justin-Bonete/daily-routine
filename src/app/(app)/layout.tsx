import { redirect } from 'next/navigation'
import Shell from '@/components/Shell'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
  return <Shell name={profile?.display_name ?? user.email ?? 'Account'}>{children}</Shell>
}
