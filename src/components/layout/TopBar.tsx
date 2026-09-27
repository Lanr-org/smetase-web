import { useSession, useSignOut } from '../../features/session/useSession.js'
import Button from '../ui/Button.js'
import DemoBadge from '../ui/DemoBadge.js'
import Wordmark from '../ui/Wordmark.js'

const TopBar = () => {
  const { student } = useSession()
  const signOut = useSignOut()

  return (
    <header className="flex h-14 flex-none items-center justify-between border-b border-line px-4">
      <div className="flex items-center gap-3">
        <Wordmark />
        <DemoBadge />
      </div>
      <div className="flex items-center gap-2">
        {student ? <span className="hidden text-sm text-muted sm:inline">{student.firstName}</span> : null}
        <Button variant="ghost" size="sm" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </header>
  )
}

export default TopBar
