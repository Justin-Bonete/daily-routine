import {
  LayoutDashboard, CheckSquare, CalendarClock, CalendarDays, Repeat, Target, Wallet, Briefcase,
  Search, Truck, Package, GraduationCap, BookOpen, Timer, HeartPulse, BarChart3, StickyNote, Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = { label: string; href: string; icon: LucideIcon; phase: number }
export const NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, phase: 1 },
  { label: 'My Tasks', href: '/tasks', icon: CheckSquare, phase: 1 },
  { label: 'Daily Planner', href: '/planner', icon: CalendarClock, phase: 1 },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays, phase: 1 },
  { label: 'Habit Tracker', href: '/habits', icon: Repeat, phase: 1 },
  { label: 'Goals & Challenges', href: '/goals', icon: Target, phase: 1 },
  { label: 'Personal Finance', href: '/finance', icon: Wallet, phase: 2 },
  { label: 'Business Center', href: '/business', icon: Briefcase, phase: 2 },
  { label: 'Product Research', href: '/products', icon: Search, phase: 2 },
  { label: 'Suppliers', href: '/suppliers', icon: Truck, phase: 2 },
  { label: 'Orders', href: '/orders', icon: Package, phase: 2 },
  { label: 'Learning Center', href: '/learning', icon: GraduationCap, phase: 3 },
  { label: 'Journal', href: '/journal', icon: BookOpen, phase: 1 },
  { label: 'Focus Timer', href: '/focus', icon: Timer, phase: 3 },
  { label: 'Health & Wellness', href: '/health', icon: HeartPulse, phase: 3 },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, phase: 4 },
  { label: 'Notes & Resources', href: '/notes', icon: StickyNote, phase: 3 },
  { label: 'Settings', href: '/settings', icon: Settings, phase: 5 },
]
