import type { Config } from 'tailwindcss'
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: c('bg'), sidebar: c('sidebar'), card: c('card'), line: c('line'),
        primary: c('primary'), success: c('success'), warning: c('warning'), danger: c('danger'),
        ink: c('ink'), muted: c('muted'),
      },
      fontFamily: { sans: ['var(--font-sans)', 'system-ui', 'sans-serif'] },
    },
  },
} satisfies Config
