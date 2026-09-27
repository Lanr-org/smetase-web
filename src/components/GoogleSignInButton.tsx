import { useEffect, useRef, useState } from 'react'
import Spinner from './ui/Spinner.js'

type GoogleId = {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleId
  }
}

// Google's official button (its own colours and logo, per Google's branding rules).
const GoogleSignInButton = ({ onCredential }: { onCredential: (credential: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onCredential)
  const [ready, setReady] = useState(() => Boolean(window.google))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    callbackRef.current = onCredential
  })

  // The Google script loads async; wait for it (up to 10s).
  useEffect(() => {
    if (ready) return
    const started = Date.now()
    const timer = window.setInterval(() => {
      if (window.google) {
        setReady(true)
        window.clearInterval(timer)
      } else if (Date.now() - started > 10_000) {
        setFailed(true)
        window.clearInterval(timer)
      }
    }, 100)
    return () => window.clearInterval(timer)
  }, [ready])

  useEffect(() => {
    if (!ready || !containerRef.current || !window.google) return
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (response) => callbackRef.current(response.credential),
    })
    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'center',
      width: 320,
    })
  }, [ready])

  if (failed) {
    return (
      <p className="text-center text-sm text-caution">
        Couldn't load Google sign-in. Check your connection and refresh.
      </p>
    )
  }

  return (
    <div ref={containerRef} className="flex min-h-11 justify-center">
      {ready ? null : <Spinner />}
    </div>
  )
}

export default GoogleSignInButton
