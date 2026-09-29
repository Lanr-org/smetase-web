import { Check, CheckCircle2, CheckSquare, Circle, Square } from 'lucide-react'
import { useState } from 'react'
import { useJourney, useSetJourneyCheck } from '../features/journey/useJourney.js'
import type { JourneyStageKey, JourneyStageStatus, StageOwner } from '../lib/api/types.js'
import { cn } from '../utils/cn.js'
import Badge from './ui/Badge.js'
import Spinner from './ui/Spinner.js'

const ownerLabel: Record<StageOwner, string> = { YOU: 'You', SMETASE: 'Smetase', ADVISOR: 'Your advisor' }

const StageDot = ({ status, number }: { status: JourneyStageStatus; number: number }) => (
  <span
    className={cn(
      'absolute left-0 top-1.5 grid size-7 place-items-center rounded-full font-mono text-xs',
      status === 'DONE' && 'bg-ink text-paper',
      status === 'CURRENT' && 'border-2 border-ink bg-paper font-semibold',
      status === 'UPCOMING' && 'border border-line bg-paper text-muted',
    )}
  >
    {status === 'DONE' ? <Check size={14} /> : number}
  </span>
)

const JourneyRail = () => {
  const { data: journey, isLoading } = useJourney()
  const setCheck = useSetJourneyCheck()
  // null = show the current stage open; 'NONE' = everything closed.
  const [openKey, setOpenKey] = useState<JourneyStageKey | 'NONE' | null>(null)

  if (isLoading || !journey) return <Spinner />

  return (
    <div className="px-4 pt-2">
      <p className="px-1 pb-3 text-xs font-medium uppercase tracking-widest text-muted">Your journey</p>
      <ol className="pb-2">
        {journey.stages.map((stage, index) => {
          const open = (openKey ?? journey.currentStage) === stage.key
          const last = index === journey.stages.length - 1
          return (
            <li key={stage.key} className="relative pb-2 pl-10">
              {last ? null : (
                <span
                  className={cn(
                    'absolute bottom-0 left-[13px] top-9 w-px',
                    stage.status === 'DONE' ? 'bg-ink' : 'bg-line',
                  )}
                />
              )}
              <StageDot status={stage.status} number={index + 1} />
              <button
                type="button"
                onClick={() => setOpenKey(open ? 'NONE' : stage.key)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-2 py-2 text-left"
              >
                <span className={cn('text-sm font-semibold', stage.status === 'UPCOMING' && 'text-muted')}>
                  {stage.title}
                </span>
                {stage.status === 'CURRENT' ? <Badge tone="ink">Now</Badge> : null}
              </button>
              {open ? (
                <div className="pb-3">
                  <p className="text-sm leading-6 text-muted">{stage.description}</p>
                  <p className="mt-2 text-xs font-medium text-muted">Who: {ownerLabel[stage.owner]}</p>
                  <ul className="mt-2 space-y-1.5">
                    {stage.checklist.map((item) => {
                      const key = item.checkKey
                      return (
                      <li key={item.id} className="text-sm">
                        {item.canTick && key ? (
                          // Steps only the student knows about (deposit paid, English test): tap to tick.
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={item.done}
                            onClick={() => setCheck.mutate({ key, done: !item.done })}
                            className="-mx-1 flex items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-line/40"
                          >
                            {item.done ? (
                              <CheckSquare size={16} aria-hidden />
                            ) : (
                              <Square size={16} className="text-muted" aria-hidden />
                            )}
                            <span className={item.done ? '' : 'text-muted'}>{item.label}</span>
                          </button>
                        ) : (
                          <span className="flex items-center gap-2">
                            {item.done ? (
                              <CheckCircle2 size={16} aria-label="Done" />
                            ) : (
                              <Circle size={16} className="text-line" aria-label="Not done yet" />
                            )}
                            <span className={item.done ? '' : 'text-muted'}>{item.label}</span>
                          </span>
                        )}
                      </li>
                      )
                    })}
                  </ul>
                  {stage.checklist.some((item) => item.canTick) ? (
                    <p className="mt-2 text-xs text-muted">Tick these off as you go.</p>
                  ) : null}
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default JourneyRail
