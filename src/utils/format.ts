import type { Money } from '../lib/api/types.js'

// narrowSymbol shows ₦, £, $ rather than "NGN", "GBP".
export const formatMoney = ({ amount, currency }: Money) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount)

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))

export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const firstName = (name: string) => name.split(' ')[0] ?? name
