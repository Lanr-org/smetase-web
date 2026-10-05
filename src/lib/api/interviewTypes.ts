// Mock interview shapes (mirrors the backend's interview.types.ts).

export type InterviewType = 'VISA' | 'ADMISSION'
export type InterviewStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

export type InterviewResult = {
  overallScore: number // 0-100
  summary: string
  strengths: string[]
  improvements: string[]
}

export type InterviewAnswer = {
  index: number
  question: string
  answer: string | null
  tip: string | null
  sampleAnswer: string | null // only for weaker answers
  score: number | null // 0-10
}

export type InterviewSession = {
  id: string
  type: InterviewType
  status: InterviewStatus
  channel: 'TELEGRAM' | 'WEB'
  targetCountry: string | null
  programLabel: string | null
  questionCount: number
  createdAt: string
  completedAt: string | null
  result: InterviewResult | null
  answers: InterviewAnswer[]
}

// What start / answer return.
export type InterviewTurn = {
  sessionId: string
  feedback: { tip: string; score: number; sampleAnswer: string | null } | null
  nextQuestion: { index: number; text: string } | null
  result: InterviewResult | null
}
