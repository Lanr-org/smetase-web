import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.js'
import DemoBadge from '../components/ui/DemoBadge.js'
import Wordmark from '../components/ui/Wordmark.js'
import { useSession } from '../features/session/useSession.js'

// Monochrome "G". Stage 2 swaps the whole button for Google's official sign-in button.
const GoogleMark = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="currentColor">
    <path d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.63 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.7 14.55 2.8 12 2.8 6.92 2.8 2.8 6.92 2.8 12s4.12 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.99 0-.6-.06-1.06-.14-1.51Z" />
  </svg>
)

const SignInPage = () => {
  const { signedIn, signIn } = useSession()
  const navigate = useNavigate()
  // Keep ?stage= so the review shortcut survives signing in.
  const { search } = useLocation()

  if (signedIn) return <Navigate replace to={`/app${search}`} />

  return (
    <main className="flex min-h-dvh flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Wordmark />
        <DemoBadge />
      </header>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight">
          Study abroad,
          <br />
          sorted.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Find programmes that fit you, see the real cost, and always know your next step, with real
          people behind you.
        </p>
        <Button
          variant="secondary"
          className="mt-8 w-full"
          onClick={() => {
            signIn()
            navigate(`/app${search}`)
          }}
        >
          <GoogleMark /> Continue with Google
        </Button>
        <p className="mt-4 text-center text-xs text-muted">
          Already chatting with us on Telegram? You can link it after you sign in.
        </p>
      </div>
    </main>
  )
}

export default SignInPage
