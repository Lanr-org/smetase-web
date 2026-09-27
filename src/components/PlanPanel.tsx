import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useJourney } from '../features/journey/useJourney.js'
import { useMatches } from '../features/matches/useMatches.js'
import { cn } from '../utils/cn.js'
import ProgrammeCard from './ProgrammeCard.js'
import Button from './ui/Button.js'
import Spinner from './ui/Spinner.js'

type Filter = 'ALL' | 'SHORTLIST'

const SectionLabel = ({ children }: { children: string }) => (
  <p className="text-xs font-medium uppercase tracking-widest text-muted">{children}</p>
)

const PlanPanel = ({ onOpenParentPack }: { onOpenParentPack: () => void }) => {
  const { data: journey } = useJourney()
  const { data: matches = [], isLoading } = useMatches()
  const [filter, setFilter] = useState<Filter>('ALL')

  if (isLoading) return <Spinner />

  const header = (
    <header>
      <h2 className="font-display text-lg font-medium">Your plan</h2>
      <p className="mt-1 text-sm text-muted">Programmes that fit you, and why.</p>
    </header>
  )

  if (journey?.currentStage === 'PROFILE' || matches.length === 0) {
    return (
      <div className="space-y-6 p-5">
        {header}
        <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm leading-6 text-muted">
          Your matches appear here once we know what you want to study, where and when.
        </div>
      </div>
    )
  }

  const chosen = matches.find((p) => p.chosen)
  const others = matches
    .filter((p) => !p.chosen && (filter === 'ALL' || p.shortlisted))
    .sort((a, b) => b.scores.overall - a.scores.overall)

  return (
    <div className="space-y-6 p-5">
      {header}

      {chosen ? (
        <section className="space-y-3">
          <SectionLabel>Your choice</SectionLabel>
          <ProgrammeCard programme={chosen} />
          <div className="rounded-2xl bg-ink p-4 text-paper">
            <p className="font-display text-base font-medium">Parent Pack</p>
            <p className="mt-1 text-sm leading-6 text-paper/70">
              The programme, full cost and next steps, ready to send to your parents.
            </p>
            <Button variant="inverse" size="sm" className="mt-3" onClick={onOpenParentPack}>
              Open Parent Pack <ArrowRight size={16} />
            </Button>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>{chosen ? 'Other matches' : 'Your matches'}</SectionLabel>
          <div className="flex rounded-full border border-line p-0.5 text-xs font-medium">
            {(['ALL', 'SHORTLIST'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={filter === option}
                className={cn('rounded-full px-3 py-1', filter === option ? 'bg-ink text-paper' : 'text-muted')}
              >
                {option === 'ALL' ? 'All' : 'Shortlisted'}
              </button>
            ))}
          </div>
        </div>
        {others.length ? (
          others.map((programme) => <ProgrammeCard key={programme.programmeId} programme={programme} />)
        ) : (
          <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
            {filter === 'SHORTLIST' ? 'Nothing shortlisted yet.' : 'No other matches.'}
          </p>
        )}
      </section>
    </div>
  )
}

export default PlanPanel
