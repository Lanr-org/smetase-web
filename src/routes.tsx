import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Spinner from './components/ui/Spinner.js'
import { useBootstrapSession, useSession } from './features/session/useSession.js'
import AppPage from './pages/AppPage.js'
import NotFoundPage from './pages/NotFoundPage.js'
import StudyPlanPage from './pages/StudyPlanPage.js'
import SignInPage from './pages/SignInPage.js'

const RequireSession = ({ children }: { children: ReactNode }) => {
  const { status } = useSession()
  // Wait for the refresh-cookie check so a returning student doesn't flash the sign-in page.
  if (status === 'checking') {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    )
  }
  return status === 'signedIn' ? children : <Navigate replace to="/" />
}

const AppRoutes = () => {
  useBootstrapSession()

  return (
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
        path="/study-plan"
        element={
          <RequireSession>
            <StudyPlanPage />
          </RequireSession>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
