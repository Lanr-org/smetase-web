import { useNavigate } from 'react-router-dom'
import { useMe } from '../../features/me/useMe.js'
import { useSession } from '../../features/session/useSession.js'
import Button from '../ui/Button.js'
import DemoBadge from '../ui/DemoBadge.js'
import Wordmark from '../ui/Wordmark.js'

const TopBar = () => {
  const { data: me } = useMe()
  const { signOut } = useSession()
  const navigate = useNavigate()

  return (
    <header className="flex h-14 flex-none items-center justify-between border-b border-line px-4">
      <div className="flex items-center gap-3">
        <Wordmark />
        <DemoBadge />
      </div>
      <div className="flex items-center gap-2">
        {me ? <span className="hidden text-sm text-muted sm:inline">{me.firstName}</span> : null}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            signOut()
            navigate('/')
          }}
        >
          Sign out
        </Button>
      </div>
    </header>
  )
}

export default TopBar
