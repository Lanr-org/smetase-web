import { useState } from 'react'
import type { ProfileUpdate } from '../../lib/api/portalApi.js'
import type { ChatMessage, QuickReply } from '../../lib/api/types.js'
import { useMe } from '../me/useMe.js'
import { MATCHES_READY, nextQuestion, type TypedStep } from './onboarding.js'
import { useMessages, useRequestAdvisor, useSaveAnswer, useSendMessage } from './useChat.js'

// The chat as the student sees it: the saved conversation (AI, advisor, both channels), plus
// this session's onboarding questions and answers, which only fill the profile and aren't
// saved as messages (as on Telegram, where button taps aren't either).

let localId = 0

const localMessage = (
  senderType: 'STUDENT' | 'AGENT',
  content: string,
  quickReplies: QuickReply[] = [],
  id = `local-${++localId}`,
): ChatMessage => ({
  id,
  senderType,
  senderName: senderType === 'AGENT' ? 'Smetase AI' : null,
  content,
  channel: 'WEB',
  createdAt: new Date().toISOString(),
  quickReplies,
})

const byTime = (messages: ChatMessage[]) =>
  [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

export const useChatThread = () => {
  const { data: me } = useMe()
  const { data: chat, isLoading } = useMessages()
  const send = useSendMessage()
  const saveAnswer = useSaveAnswer()
  const requestAdvisor = useRequestAdvisor()
  const [followUp, setFollowUp] = useState<TypedStep | null>(null) // e.g. "What was your IELTS band?"
  const [local, setLocal] = useState<ChatMessage[]>([])

  const addLocal = (message: ChatMessage) => setLocal((old) => [...old, message])

  const advisorHandling = chat?.advisorHandling ?? false
  // No onboarding questions while an advisor is handling the chat.
  const question = me && !advisorHandling ? nextQuestion(me) : null

  const prompt = followUp
    ? localMessage('AGENT', `${followUp.question}\n${followUp.hint}`, [], 'prompt')
    : question?.kind === 'typed'
      ? localMessage('AGENT', `${question.question}\n${question.hint}`, [], 'prompt')
      : question
        ? localMessage(
            'AGENT',
            question.question,
            question.options().map(({ label }) => ({ label, value: label })),
            'prompt',
          )
        : null

  const server = chat?.messages ?? []
  const greeting =
    me && server.length === 0 && local.length === 0
      ? localMessage(
          'AGENT',
          question
            ? `Hey ${me.firstName}! I'm Smetase. Let's find programmes that actually fit you.`
            : `Welcome back, ${me.firstName}! Your matches are in your plan. Ask me anything about studying abroad.`,
          [],
          'greeting',
        )
      : null

  const items = [...(greeting ? [greeting] : []), ...byTime([...server, ...local]), ...(prompt ? [prompt] : [])]

  const answer = async (shown: string, update: ProfileUpdate) => {
    addLocal(localMessage('STUDENT', shown))
    try {
      const updated = await saveAnswer.mutateAsync(update)
      if (!nextQuestion(updated)) addLocal(localMessage('AGENT', MATCHES_READY))
    } catch {
      addLocal(localMessage('AGENT', "Sorry, I couldn't save that. Please try again."))
    }
  }

  // A button tap always answers the onboarding question on screen.
  const tapReply = (label: string) => {
    if (saveAnswer.isPending) return
    const option = question?.kind === 'options' ? question.options().find((o) => o.label === label) : undefined
    if (!option) return
    if ('followUp' in option) {
      addLocal(localMessage('STUDENT', label))
      setFollowUp(option.followUp)
    } else {
      void answer(label, option.update)
    }
  }

  // Typed text answers a typed question (qualification, IELTS band); anything else goes to the AI.
  const submitText = (text: string) => {
    if (send.isPending || saveAnswer.isPending) return
    const step = followUp ?? (question?.kind === 'typed' ? question : null)
    if (!step) {
      send.mutate(text)
      return
    }
    if (text.length < step.minLength) {
      addLocal(localMessage('AGENT', 'Could you add a bit more detail?'))
      return
    }
    setFollowUp(null)
    void answer(text, step.toUpdate(text))
  }

  return {
    items,
    isLoading,
    advisorHandling,
    advisorRequested: chat?.advisorRequested ?? false,
    requestAdvisor: () => requestAdvisor.mutate(),
    isRequestingAdvisor: requestAdvisor.isPending,
    isWaiting: send.isPending || saveAnswer.isPending,
    // The queued AI reply hasn't landed yet. The student can keep typing meanwhile:
    // messages sent in a row get one reply.
    aiTyping: !advisorHandling && (send.isPending || (chat?.awaitingReply ?? false)),
    tapReply,
    submitText,
  }
}
