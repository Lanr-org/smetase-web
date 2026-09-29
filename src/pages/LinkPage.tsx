import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GoogleSignInButton from '../components/GoogleSignInButton.js'
import Button from '../components/ui/Button.js'
import Spinner from '../components/ui/Spinner.js'
import Wordmark from '../components/ui/Wordmark.js'
import { authApi } from '../lib/api/authApi.js'
import type { LinkOutcome } from '../lib/api/types.js'
import { useSessionStore } from '../store/sessionStore.js'
import { apiErrorMessage } from '../utils/apiError.js'

// Opened from the bot's /plan link. Signing in with Google here joins that Google account to
// the Telegram student. It always asks for Google, even if this browser is already signed in:
// the Google credential says which account to link.

const LINK_NOTICE: Partial<Record<LinkOutcome, string>> = {
  INVALID_TOKEN:
    "That link has expired or was already used, so your Telegram chat isn't connected yet. Send /plan to the bot for a new one.",
  REFUSED: "We couldn't join your Telegram and web accounts automatically. Your advisor will sort it out.",
}

const LinkPage = () => {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleCredential = async (credential: string) => {
    setPending(true)
    setError(null)
    try {
      const result = await authApi.signInWithGoogle(credential, token)
      useSessionStore.getState().setSession(result.accessToken, result.student)
      const message = result.linkOutcome ? LINK_NOTICE[result.linkOutcome] : undefined
      // Linked: straight into the app. Otherwise say why first, then continue.
      if (message) setNotice(message)
      else navigate('/app', { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Sign-in failed. Please try again.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 py-8">
      <header>
        <Wordmark />
      </header>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        {notice ? (
          <>
            <p className="text-base leading-7">{notice}</p>
            <Button className="mt-6" onClick={() => navigate('/app', { replace: true })}>
              Continue to my plan
            </Button>
          </>
        ) : (
          <>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight">Open your plan</h1>
            <p className="mt-4 text-base leading-7 text-muted">
              Sign in with Google to see your matches, shortlist and this Telegram chat on the web. We'll connect
              them to the same account.
            </p>
            <div className="mt-8">
              {pending ? <Spinner /> : <GoogleSignInButton onCredential={(c) => void handleCredential(c)} />}
            </div>
            {error ? (
              <p role="alert" className="mt-3 text-center text-sm text-caution">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}

export default LinkPage
