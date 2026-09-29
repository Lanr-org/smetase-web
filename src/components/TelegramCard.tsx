import { useMutation } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { useMe } from '../features/me/useMe.js'
import { portalApi } from '../lib/api/portalApi.js'
import Button, { buttonClass } from './ui/Button.js'

// Links Telegram to this account so advisor replies can reach the student there too.
// Two taps on purpose: opening a new tab after an API call gets blocked on phones, so the
// first tap fetches the link and the second is a real link to t.me.
const TelegramCard = () => {
  const { data: me } = useMe()
  const link = useMutation({ mutationFn: portalApi.createTelegramLink })
  if (!me || me.telegramLinked) return null

  return (
    <div className="m-4 rounded-2xl border border-line p-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">Telegram</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Get a message on Telegram when your advisor replies, and chat with Smetase there too. Already chatting
        with us there? This joins it to this account.
      </p>
      {link.data ? (
        <>
          <a href={link.data.url} target="_blank" rel="noreferrer" className={buttonClass('primary', 'sm', 'mt-3')}>
            Open Telegram <ArrowUpRight size={16} />
          </a>
          <p className="mt-2 text-xs text-muted">Tap Start in Telegram. The link works once, for 15 minutes.</p>
        </>
      ) : (
        <Button size="sm" className="mt-3" disabled={link.isPending} onClick={() => link.mutate()}>
          Get updates on Telegram
        </Button>
      )}
      {link.isError ? (
        <p role="alert" className="mt-2 text-xs text-caution">
          Couldn't create the link. Please try again.
        </p>
      ) : null}
    </div>
  )
}

export default TelegramCard
