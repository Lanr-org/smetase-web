import type { ReactNode } from 'react'
import { cn } from '../../utils/cn.js'

type Tone = 'neutral' | 'ink' | 'caution' | 'confirm'

const tones: Record<Tone, string> = {
  neutral: 'bg-subtle text-ink',
  ink: 'bg-ink text-paper',
  caution: 'bg-caution-soft text-caution',
  confirm: 'bg-confirm-soft text-confirm',
}

const Badge = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) => (
  <span className={cn('inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-semibold', tones[tone])}>
    {children}
  </span>
)

export default Badge
