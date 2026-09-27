import { useMe } from '../features/me/useMe.js'
import { initials } from '../utils/format.js'

const AdvisorCard = () => {
  const { data: me } = useMe()
  const advisor = me?.advisor ?? null

  return (
    <div className="m-4 rounded-2xl border border-line p-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">Your advisor</p>
      {advisor ? (
        <div className="mt-3 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-ink font-display text-sm text-paper">
            {initials(advisor.name)}
          </span>
          <div>
            <p className="text-sm font-semibold">{advisor.name}</p>
            <p className="text-xs text-muted">
              {advisor.handling ? 'Handling your application' : 'Ready when you are'}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm leading-6 text-muted">
          When you're ready to apply, a real Smetase advisor joins your chat.
        </p>
      )}
    </div>
  )
}

export default AdvisorCard
