// Scripted chat until Stage 4 brings the real AI and advisor chat to the web.
// Onboarding answers are saved for real (PATCH /student/me/profile), and it only asks
// about profile fields that are still missing.
import { portalApi, type ProfileUpdate } from './portalApi.js'
import type { ChatMessage, QuickReply, StudentMe } from './types.js'

// A button answer either saves straight away or leads to a follow-up typed question.
type Option = { label: string; update: ProfileUpdate } | { label: string; followUp: TypedStep }

// A question the student answers by typing.
type TypedStep = {
  question: string
  hint: string
  minLength: number
  toUpdate: (text: string) => ProfileUpdate
}

type Question = { isMissing: (me: StudentMe) => boolean } & (
  | { kind: 'options'; question: string; options: () => Option[] }
  | ({ kind: 'typed' } & TypedStep)
)

// Next September and next January, soonest first (like the Telegram bot's intake buttons).
const upcomingIntakes = (): Option[] => {
  const now = new Date()
  const year = now.getFullYear()
  const septemberYear = now.getMonth() < 5 ? year : year + 1
  const intakes = [
    { month: 'SEPTEMBER' as const, year: septemberYear, label: `September ${septemberYear}` },
    { month: 'JANUARY' as const, year: year + 1, label: `January ${year + 1}` },
  ].sort((a, b) => a.year - b.year || (a.month === 'JANUARY' ? -1 : 1))
  return intakes.map(({ month, year: y, label }) => ({ label, update: { intake: { month, year: y } } }))
}

const QUESTIONS: Question[] = [
  {
    kind: 'options',
    isMissing: (me) => !me.studyLevel,
    question: 'What level are you aiming for?',
    options: () => [
      { label: 'Masters', update: { studyLevel: 'MASTERS' } },
      { label: 'Bachelors', update: { studyLevel: 'BACHELORS' } },
      { label: 'PhD', update: { studyLevel: 'PHD' } },
      { label: 'Diploma', update: { studyLevel: 'DIPLOMA' } },
    ],
  },
  {
    kind: 'options',
    isMissing: (me) => me.destinations.length === 0,
    question: 'Where would you like to study?',
    options: () => [
      { label: 'UK', update: { destinations: ['UK'] } },
      { label: 'Canada', update: { destinations: ['CANADA'] } },
      { label: 'USA', update: { destinations: ['USA'] } },
      { label: 'Ireland', update: { destinations: ['IRELAND'] } },
      { label: 'Australia', update: { destinations: ['AUSTRALIA'] } },
      { label: 'Germany', update: { destinations: ['GERMANY'] } },
    ],
  },
  { kind: 'options', isMissing: (me) => !me.intake, question: 'When do you want to start?', options: upcomingIntakes },
  {
    kind: 'options',
    isMissing: (me) => !me.budgetRange,
    question: 'Roughly what tuition budget per year works for you and whoever is supporting you?',
    // "Up to" amounts: the matcher treats the largest number in the text as the ceiling.
    options: () => [
      { label: 'Up to £15k', update: { budgetRange: 'Up to £15k' } },
      { label: 'Up to £25k', update: { budgetRange: 'Up to £25k' } },
      { label: 'Up to £40k', update: { budgetRange: 'Up to £40k' } },
      { label: 'Not sure yet', update: { budgetRange: 'Not sure yet' } },
    ],
  },
  {
    kind: 'typed',
    isMissing: (me) => !me.academicBackground,
    question: "What's your highest qualification so far, and your grade?",
    hint: "For example 'BSc Computer Science, 2:1' or 'WAEC, 7 credits'. Just type it below.",
    minLength: 2,
    toUpdate: (text) => ({ academicBackground: text }),
  },
  {
    kind: 'options',
    isMissing: (me) => !me.englishTest,
    question: 'Last one: have you taken an English test?',
    options: () => [
      {
        label: 'I have an IELTS score',
        followUp: {
          question: 'Nice! What was your overall IELTS band?',
          hint: 'For example 6.5.',
          minLength: 1,
          toUpdate: (text) => ({ englishTest: `IELTS ${text}` }),
        },
      },
      { label: 'IELTS booked', update: { englishTest: 'IELTS booked' } },
      { label: 'Not taken yet', update: { englishTest: 'Not taken yet' } },
      { label: 'WAEC English credit', update: { englishTest: 'WAEC English credit' } },
    ],
  },
]

const MATCHES_READY =
  'Here are programmes that fit you. Open your plan to see why each one fits, and shortlist the ones you like.'

// What the chat is waiting for: a button choice, or a typed answer.
type Pending =
  | { kind: 'options'; question: Question & { kind: 'options' }; options: Option[] }
  | { kind: 'typed'; step: TypedStep; retry: () => void }

let messages: ChatMessage[] = []
let started = false
let pending: Pending | null = null
let idCounter = 0

const message = (senderType: ChatMessage['senderType'], content: string, quickReplies: QuickReply[] = []): ChatMessage => ({
  id: `chat-${++idCounter}`,
  senderType,
  senderName: senderType === 'AGENT' ? 'Smetase AI' : null,
  content,
  createdAt: new Date().toISOString(),
  quickReplies,
})

const askTyped = (step: TypedStep, retry: () => void) => {
  pending = { kind: 'typed', step, retry }
  messages.push(message('AGENT', `${step.question}\n${step.hint}`))
}

const ask = (question: Question) => {
  if (question.kind === 'typed') {
    askTyped(question, () => ask(question))
    return
  }
  const options = question.options()
  pending = { kind: 'options', question, options }
  messages.push(message('AGENT', question.question, options.map(({ label }) => ({ label, value: label }))))
}

const askNextOrFinish = (me: StudentMe) => {
  const next = QUESTIONS.find((question) => question.isMissing(me))
  if (next) {
    ask(next)
  } else {
    pending = null
    messages.push(message('AGENT', MATCHES_READY))
  }
}

const save = async (update: ProfileUpdate) => askNextOrFinish(await portalApi.updateProfile(update))

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)

export const mockChat = {
  async getMessages() {
    if (!started) {
      started = true
      const me = await portalApi.getMe()
      if (QUESTIONS.some((question) => question.isMissing(me))) {
        messages.push(message('AGENT', `Hey ${me.firstName}! I'm Smetase. Let's find programmes that actually fit you.`))
        askNextOrFinish(me)
      } else {
        messages.push(
          message('AGENT', `Welcome back, ${me.firstName}! Your matches are in your plan. Shortlist the ones you like, then choose one.`),
        )
      }
    }
    return clone(messages)
  },

  async sendMessage(content: string) {
    const mine = message('STUDENT', content)
    messages.push(mine)
    const before = messages.length
    await delay(500)
    const text = content.trim()
    const current = pending

    if (current?.kind === 'typed') {
      if (text.length >= current.step.minLength) {
        await save(current.step.toUpdate(text))
      } else {
        messages.push(message('AGENT', 'Could you add a bit more detail?'))
        current.retry()
      }
    } else if (current?.kind === 'options') {
      const option = current.options.find(({ label }) => label === text)
      if (!option) {
        // Free text where a button was expected: ask the same question again.
        messages.push(message('AGENT', 'Tap one of the options so I can match you properly.'))
        ask(current.question)
      } else if ('followUp' in option) {
        const { followUp } = option
        const askFollowUp = () => askTyped(followUp, askFollowUp)
        askFollowUp()
      } else {
        await save(option.update)
      }
    } else if (/ready to apply/i.test(text)) {
      messages.push(message('AGENT', "Great! We'll connect you with a Smetase advisor, who'll take it from here."))
    } else {
      messages.push(
        message(
          'AGENT',
          "Good question! I'm still in scripted mode, so I can't answer that yet. Your plan shows each programme's fit and what's still needed.",
        ),
      )
    }
    return clone([mine, ...messages.slice(before)])
  },
}

// Called on sign out, so the next person on this device starts a fresh chat.
export const resetMockChat = () => {
  messages = []
  started = false
  pending = null
}
