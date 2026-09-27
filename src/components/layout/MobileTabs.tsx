import { LayoutList, MessageCircle, Route } from 'lucide-react'
import { cn } from '../../utils/cn.js'

export type Tab = 'JOURNEY' | 'CHAT' | 'PLAN'

const tabs = [
  { key: 'JOURNEY', label: 'Journey', icon: Route },
  { key: 'CHAT', label: 'Chat', icon: MessageCircle },
  { key: 'PLAN', label: 'Plan', icon: LayoutList },
] as const

// In normal flow (not fixed) so it never covers the message box.
const MobileTabs = ({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) => (
  <nav className="grid flex-none grid-cols-3 border-t border-line lg:hidden" aria-label="Sections">
    {tabs.map(({ key, label, icon: Icon }) => {
      const active = value === key
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex flex-col items-center gap-1 border-t-2 py-2 text-xs font-medium',
            active ? 'border-ink text-ink' : 'border-transparent text-muted',
          )}
        >
          <Icon size={20} />
          {label}
        </button>
      )
    })}
  </nav>
)

export default MobileTabs
