import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn.js'

// Quick-reply pill in the chat.
const Chip = ({ className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type={type}
    className={cn(
      'h-9 rounded-full border border-ink px-4 text-sm font-medium transition hover:bg-ink hover:text-paper',
      className,
    )}
    {...props}
  />
)

export default Chip
