import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const sans = Manrope({ subsets: ['latin'], variable: '--font-sans' })
export const metadata: Metadata = { title: 'My Life OS', description: 'Personal productivity and business system' }
const themeInit = `try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={sans.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body>{children}</body>
    </html>
  )
}
