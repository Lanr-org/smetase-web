import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn.js'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink/85',
  secondary: 'border border-line bg-paper text-ink hover:bg-subtle',
  ghost: 'text-ink hover:bg-subtle',
  inverse: 'bg-paper text-ink hover:bg-paper/90', // on black surfaces
}

const sizes: Record<Size, string> = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-5 text-sm' }

// Also used for links that look like buttons (e.g. "Share on WhatsApp").
export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }

const Button = ({ variant = 'primary', size = 'md', className, type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={buttonClass(variant, size, className)} {...props} />
)

export default Button
