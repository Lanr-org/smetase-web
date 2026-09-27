import { Bookmark, BookmarkCheck, Check } from 'lucide-react'
import { useState } from 'react'
import { useChooseProgramme, useToggleShortlist } from '../features/matches/useMatches.js'
import type { ProgrammeMatch } from '../lib/api/types.js'
import { cn } from '../utils/cn.js'
import { formatMoney } from '../utils/format.js'
import Badge from './ui/Badge.js'
import Button from './ui/Button.js'

const ScoreBreakdown = ({ scores }: { scores: ProgrammeMatch['scores'] }) => {
  const rows = [
    { label: 'Programme fit', value: scores.programmeFit },
    { label: 'Budget', value: scores.budgetFit },
    { label: 'Intake', value: scores.intakeFit },
    { label: 'Visa', value: scores.visaFit },
  ]
  return (
    <div className="mt-4 space-y-2 rounded-xl bg-subtle p-3">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[96px_1fr_32px] items-center gap-3 text-xs">
          <span className="text-muted">{row.label}</span>
          <span className="h-1.5 rounded-full bg-line">
            <span className="block h-1.5 rounded-full bg-ink" style={{ width: `${Math.round(row.value)}%` }} />
          </span>
          <span className="text-right font-mono">{Math.round(row.value)}</span>
        </div>
      ))}
    </div>
  )
}

const ProgrammeCard = ({ programme }: { programme: ProgrammeMatch }) => {
  const toggle = useToggleShortlist()
  const choose = useChooseProgramme()
  const [showScores, setShowScores] = useState(false)

  return (
    <article className={cn('rounded-2xl border p-4', programme.chosen ? 'border-ink' : 'border-line')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">
            {programme.schoolName} · {programme.city}, {programme.country}
          </p>
          <h3 className="mt-1 font-semibold leading-snug">{programme.programmeName}</h3>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-medium leading-none">{Math.round(programme.scores.overall)}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">Fit</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-muted">Tuition / year</dt>
          <dd className="mt-0.5 font-mono text-sm">{formatMoney(programme.tuition)}</dd>
        </div>
        <div>
          <dt className="text-muted">Duration</dt>
          <dd className="mt-0.5 text-sm">{programme.durationMonths} months</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Starts</dt>
          <dd className="mt-0.5 text-sm">{programme.intakes.join(' · ')}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-1.5">
        {programme.reasons.map((reason) => (
          <li key={reason} className="flex gap-2 text-sm">
            <Check size={16} className="mt-0.5 flex-none" />
            {reason}
          </li>
        ))}
      </ul>

      {programme.missingRequirements.length ? (
        <div className="mt-3 rounded-xl bg-caution-soft p-3">
          <p className="text-xs font-semibold text-caution">Still needed</p>
          <ul className="mt-1 space-y-1">
            {programme.missingRequirements.map((item) => (
              <li key={item} className="text-sm text-caution">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showScores ? <ScoreBreakdown scores={programme.scores} /> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {programme.chosen ? (
          <Badge tone="confirm">
            <Check size={14} /> Your choice
          </Badge>
        ) : (
          <Button size="sm" disabled={choose.isPending} onClick={() => choose.mutate(programme.programmeId)}>
            Choose this
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          aria-pressed={programme.shortlisted}
          disabled={toggle.isPending}
          onClick={() => toggle.mutate(programme.programmeId)}
        >
          {programme.shortlisted ? (
            <>
              <BookmarkCheck size={16} /> Shortlisted
            </>
          ) : (
            <>
              <Bookmark size={16} /> Shortlist
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={() => setShowScores((value) => !value)}
          className="ml-auto text-xs font-medium text-muted underline-offset-4 hover:underline"
        >
          {showScores ? 'Hide score' : 'Why this score'}
        </button>
      </div>
    </article>
  )
}

export default ProgrammeCard
