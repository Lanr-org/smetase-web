import { isAxiosError } from 'axios'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import GoogleSignInButton from '../components/GoogleSignInButton.js'
import DemoBadge from '../components/ui/DemoBadge.js'
import Spinner from '../components/ui/Spinner.js'
import Wordmark from '../components/ui/Wordmark.js'
import { useSession } from '../features/session/useSession.js'
import { authApi } from '../lib/api/authApi.js'
import { useSessionStore } from '../store/sessionStore.js'

const SignInPage = () => {
  const { signedIn } = useSession()
  const navigate = useNavigate()
  // Keep ?stage= so the review shortcut survives signing in.
  const { search } = useLocation()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (signedIn) return <Navigate replace to={`/app${search}`} />

  const handleCredential = async (credential: string) => {
    setPending(true)
    setError(null)
    try {
      const result = await authApi.signInWithGoogle(credential)
      useSessionStore.getState().setSession(result.accessToken, result.student)
      navigate(`/app${search}`)
    } catch (err) {
      setError(
        isAxiosError<{ error?: { message?: string } }>(err)
          ? (err.response?.data?.error?.message ?? 'Sign-in failed. Please try again.')
          : 'Sign-in failed. Please try again.',
      )
    } finally {
      setPending(false)
    }
  }

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
        <div className="mt-8">
          {pending ? <Spinner /> : <GoogleSignInButton onCredential={(c) => void handleCredential(c)} />}
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-center text-sm text-caution">
            {error}
          </p>
        ) : null}
        <p className="mt-4 text-center text-xs text-muted">
          Already chatting with us on Telegram? You can link it after you sign in.
        </p>
      </div>
    </main>
  )
}

export default SignInPage
