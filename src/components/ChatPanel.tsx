import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMessages, useSendMessage } from '../features/chat/useChat.js'
import { useMe } from '../features/me/useMe.js'
import { IS_SCRIPTED_CHAT } from '../lib/api/studentApi.js'
import { firstName } from '../utils/format.js'
import MessageBubble, { TypingIndicator } from './MessageBubble.js'
import Chip from './ui/Chip.js'
import Spinner from './ui/Spinner.js'

const ChatPanel = () => {
  const { data: messages = [], isLoading } = useMessages()
  const { data: me } = useMe()
  const send = useSendMessage()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const advisor = me?.conversationMode === 'HUMAN_ADVISOR' ? (me.advisor ?? null) : null
  const last = messages.at(-1)
  // Only offer the latest reply's buttons, and not while waiting for an answer.
  const quickReplies = last && last.senderType !== 'STUDENT' && !send.isPending ? last.quickReplies : []

  // Re-scroll when the quick replies or the advisor banner appear too: they shrink the
  // message area and would otherwise push the newest message out of view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, send.isPending, quickReplies.length, advisor?.name])

  const submit = (content: string) => {
    const text = content.trim()
    if (!text || send.isPending) return
    send.mutate(text)
    setDraft('')
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{advisor ? `Chat with ${advisor.name}` : 'Chat with Smetase'}</p>
          {IS_SCRIPTED_CHAT ? (
            // Until Stage 4: replies are scripted, but profile answers are saved for real.
            <span className="rounded-full border border-dashed border-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted">
              Scripted chat
            </span>
          ) : null}
        </div>
        <p className="text-xs text-muted">
          {advisor
            ? 'A real person from the Smetase team'
            : "AI guide · a real advisor joins when you're ready to apply"}
        </p>
      </div>
      {advisor ? (
        <div className="border-b border-line bg-subtle px-5 py-2 text-xs font-medium">
          {firstName(advisor.name)} is handling this now.
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {isLoading ? <Spinner /> : messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        {send.isPending ? <TypingIndicator name={advisor ? firstName(advisor.name) : 'Smetase'} /> : null}
        <div ref={endRef} />
      </div>

      {quickReplies.length ? (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {quickReplies.map((reply) => (
            <Chip key={reply.value} onClick={() => submit(reply.value)}>
              {reply.label}
            </Chip>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          submit(draft)
        }}
        className="flex items-end gap-2 border-t border-line p-3"
      >
        <textarea
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit(draft)
            }
          }}
          placeholder="Ask anything about studying abroad…"
          aria-label="Message"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!draft.trim() || send.isPending}
          className="grid size-11 flex-none place-items-center rounded-full bg-ink text-paper disabled:opacity-40"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
