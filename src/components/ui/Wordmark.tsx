import { cn } from '../../utils/cn.js'

const Wordmark = ({ className }: { className?: string }) => (
  <span className={cn('font-display text-lg font-semibold tracking-tight', className)}>Smetase</span>
)

export default Wordmark
