import { ArrowRight } from 'lucide-react'
import type { NextStep } from '../lib/api/types.js'
import Button from './ui/Button.js'

export type NextStepTarget = NonNullable<NextStep['action']>['target']

type NextStepCardProps = {
  step: NextStep
  onAction: (target: NextStepTarget) => void
  compact?: boolean
}

const NextStepCard = ({ step, onAction, compact = false }: NextStepCardProps) => {
  const { action } = step
  return (
    <div className="rounded-2xl bg-ink p-4 text-paper">
      <p className="text-[11px] font-medium uppercase tracking-widest text-paper/60">Next step</p>
      <p className="mt-1 font-display text-base font-medium">{step.title}</p>
      {compact ? null : <p className="mt-1 text-sm leading-6 text-paper/70">{step.description}</p>}
      {action ? (
        <Button variant="inverse" size="sm" className="mt-3" onClick={() => onAction(action.target)}>
          {action.label} <ArrowRight size={16} />
        </Button>
      ) : null}
    </div>
  )
}

export default NextStepCard
