import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useSession } from './features/session/useSession.js'
import AppPage from './pages/AppPage.js'
import NotFoundPage from './pages/NotFoundPage.js'
import ParentPackPage from './pages/ParentPackPage.js'
import SignInPage from './pages/SignInPage.js'

const RequireSession = ({ children }: { children: ReactNode }) => {
  const { signedIn } = useSession()
  return signedIn ? children : <Navigate replace to="/" />
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<SignInPage />} />
    <Route
      path="/app"
      element={
        <RequireSession>
          <AppPage />
        </RequireSession>
      }
    />
    <Route
      path="/parent-pack"
      element={
        <RequireSession>
          <ParentPackPage />
        </RequireSession>
      }
    />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default AppRoutes
