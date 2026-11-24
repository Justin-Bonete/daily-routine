import { notFound } from 'next/navigation'
import { NAV } from '@/lib/nav'

export default function ModulePage({ params }: { params: { slug: string } }) {
  const item = NAV.find((n) => n.href === `/${params.slug}`)
  if (!item) notFound()
  const Icon = item.icon
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center">
      <Icon size={32} className="text-primary" />
      <h1 className="text-2xl font-bold">{item.label}</h1>
      <p className="max-w-md text-muted">This module is built in Phase {item.phase}. Your layout, theme and data access are ready for it.</p>
    </div>
  )
}
