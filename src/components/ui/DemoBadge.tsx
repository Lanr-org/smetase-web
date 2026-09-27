import { IS_MOCK } from '../../lib/api/studentApi.js'

// Marks mock data so screenshots are never mistaken for real schools.
const DemoBadge = () =>
  IS_MOCK ? (
    <span className="rounded-full border border-dashed border-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
      Demo data
    </span>
  ) : null

export default DemoBadge
