import { Loader2 } from 'lucide-react'

const Spinner = () => (
  <div className="flex justify-center py-6" role="status" aria-label="Loading">
    <Loader2 className="animate-spin text-muted" size={22} />
  </div>
)

export default Spinner
