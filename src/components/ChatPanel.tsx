import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChatThread } from '../features/chat/useChatThread.js'
import { useMe } from '../features/me/useMe.js'
import { firstName } from '../utils/format.js'
import MessageBubble, { TypingIndicator } from './MessageBubble.js'
import Chip from './ui/Chip.js'
import Spinner from './ui/Spinner.js'

const ChatPanel = () => {
  const {
    items,
    isLoading,
    advisorHandling,
    advisorRequested,
    requestAdvisor,
    isRequestingAdvisor,
    isWaiting,
    aiTyping,
    tapReply,
    submitText,
  } = useChatThread()
  const { data: me } = useMe()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // advisorHandling is polled with the messages, so this switches as soon as staff take over.
  const advisorName = advisorHandling ? (me?.advisor?.name ?? 'Your advisor') : null
  const last = items.at(-1)
  // Only offer the latest prompt's buttons, and not while waiting for an answer.
  const quickReplies = last && last.senderType !== 'STUDENT' && !isWaiting ? last.quickReplies : []

  // Re-scroll when the quick replies or the advisor banner appear too: they shrink the
  // message area and would otherwise push the newest message out of view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items.length, isWaiting, aiTyping, quickReplies.length, advisorName, advisorRequested])

  const submit = (content: string) => {
    const text = content.trim()
    if (!text || isWaiting) return
    submitText(text)
    setDraft('')
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="min-w-0">
          <p className="font-semibold">{advisorName ? `Chat with ${advisorName}` : 'Chat with Smetase'}</p>
          <p className="text-xs text-muted">
            {advisorName ? 'A real person from the Smetase team' : 'AI guide · ask for a real advisor any time'}
          </p>
        </div>
        {advisorName ? null : (
          <button
            type="button"
            onClick={requestAdvisor}
            disabled={advisorRequested || isRequestingAdvisor}
            className="flex-none rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:bg-subtle disabled:opacity-60"
          >
            {advisorRequested ? 'Advisor requested ✓' : 'Talk to an advisor'}
          </button>
        )}
      </div>
      {advisorRequested && !advisorName ? (
        <div className="border-b border-line bg-subtle px-5 py-2 text-xs font-medium">
          We've told the Smetase team. An advisor will follow up here. You can keep chatting with the AI meanwhile.
        </div>
      ) : null}
      {advisorName ? (
        <div className="border-b border-line bg-subtle px-5 py-2 text-xs font-medium">
          {firstName(advisorName)} is handling your chat now and will reply here.
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {isLoading ? <Spinner /> : items.map((m) => <MessageBubble key={m.id} message={m} />)}
        {(isWaiting || aiTyping) && !advisorName ? <TypingIndicator name="Smetase" /> : null}
        <div ref={endRef} />
      </div>

      {quickReplies.length ? (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {quickReplies.map((reply) => (
            <Chip key={reply.value} onClick={() => tapReply(reply.value)}>
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
          maxLength={2000}
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
          disabled={!draft.trim() || isWaiting}
          className="grid size-11 flex-none place-items-center rounded-full bg-ink text-paper disabled:opacity-40"
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
