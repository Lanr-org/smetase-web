import { Link } from 'react-router-dom'
import { buttonClass } from '../components/ui/Button.js'
import Wordmark from '../components/ui/Wordmark.js'

const NotFoundPage = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
    <Wordmark />
    <p className="mt-8 font-display text-2xl">This page doesn't exist</p>
    <Link to="/" className={buttonClass('primary', 'md', 'mt-6')}>
      Go home
    </Link>
  </main>
)

export default NotFoundPage
