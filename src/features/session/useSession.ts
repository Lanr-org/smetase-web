import { useSyncExternalStore } from 'react'

// Stage 1 only: a signed-in flag in localStorage. Stage 2 replaces this with real auth.
const KEY = 'smetase.session'
const listeners = new Set<() => void>()

const read = () => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

let signedIn = read()

const setSignedIn = (value: boolean) => {
  signedIn = value
  try {
    if (value) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked (private mode): the session just lives in memory.
  }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useSession = () => {
  const value = useSyncExternalStore(subscribe, () => signedIn)
  return { signedIn: value, signIn: () => setSignedIn(true), signOut: () => setSignedIn(false) }
}
