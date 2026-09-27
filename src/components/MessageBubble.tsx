import type { ChatMessage } from '../lib/api/types.js'
import { cn } from '../utils/cn.js'

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  if (message.senderType === 'SYSTEM') {
    return <p className="py-1 text-center text-xs text-muted">{message.content}</p>
  }

  const mine = message.senderType === 'STUDENT'
  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      {!mine && message.senderName ? (
        <span className="mb-1 px-1 text-xs font-medium text-muted">{message.senderName}</span>
      ) : null}
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6',
          mine && 'rounded-br-md bg-ink text-paper',
          message.senderType === 'AGENT' && 'rounded-bl-md bg-subtle',
          message.senderType === 'ADVISOR' && 'rounded-bl-md border border-ink bg-paper',
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

export const TypingIndicator = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 px-1 text-xs text-muted" role="status">
    <span className="flex gap-1" aria-hidden>
      <span className="size-1.5 animate-bounce rounded-full bg-muted" />
      <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
    </span>
    {name} is typing
  </div>
)

export default MessageBubble
