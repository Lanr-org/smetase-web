// The profile questions the chat asks while fields are still missing, like the Telegram bot's
// buttons. Answers are saved with PATCH /student/me/profile; everything else goes to the AI.
import type { ProfileUpdate } from '../../lib/api/portalApi.js'
import type { StudentMe } from '../../lib/api/types.js'

// A button answer either saves straight away or leads to a follow-up typed question.
export type Option = { label: string; update: ProfileUpdate } | { label: string; followUp: TypedStep }

// A question the student answers by typing.
export type TypedStep = {
  question: string
  hint: string
  minLength: number
  toUpdate: (text: string) => ProfileUpdate
}

export type Question = { isMissing: (me: StudentMe) => boolean } & (
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

export const MATCHES_READY =
  'Here are programmes that fit you. Open your plan to see why each one fits, and shortlist the ones you like.'

export const nextQuestion = (me: StudentMe) => QUESTIONS.find((question) => question.isMissing(me)) ?? null
