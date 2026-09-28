// The shapes the student API returns (mirrors the backend's studentPortal.types.ts).
// Everything is real since Stage 3 except chat messages, which are scripted until Stage 4.

// Backend success envelope ({ success, message, data, meta }).
export type ApiSuccess<T> = {
  success: true
  message: string
  data: T
  meta: { requestId: string }
}

// The signed-in student, from /student/auth/* (real since Stage 2).
export type StudentSummary = {
  publicId: string
  firstName: string
  fullName: string
  email: string | null
}

export type JourneyStageKey =
  | 'PROFILE'
  | 'EXPLORE'
  | 'CHOOSE'
  | 'APPLY'
  | 'OFFER'
  | 'ENGLISH'
  | 'FUNDS'
  | 'VISA'

export type JourneyStageStatus = 'DONE' | 'CURRENT' | 'UPCOMING'

// Who does the work at this stage; ADVISOR stages are the human handoff points.
export type StageOwner = 'YOU' | 'SMETASE' | 'ADVISOR'

export type ChecklistItem = { id: string; label: string; done: boolean }

export type JourneyStage = {
  key: JourneyStageKey
  title: string
  description: string
  status: JourneyStageStatus
  owner: StageOwner
  checklist: ChecklistItem[]
}

export type NextStep = {
  title: string
  description: string
  action: { label: string; target: 'CHAT' | 'PLAN' | 'STUDY_PLAN' } | null
}

export type Journey = {
  currentStage: JourneyStageKey
  stages: JourneyStage[]
  nextStep: NextStep
}

export type Advisor = {
  name: string
  // true once the conversation has been handed to this advisor.
  handling: boolean
}

// Mirrors the backend's IntakeMonth enum.
export type IntakeMonth =
  | 'JANUARY'
  | 'FEBRUARY'
  | 'MARCH'
  | 'APRIL'
  | 'MAY'
  | 'JUNE'
  | 'JULY'
  | 'AUGUST'
  | 'SEPTEMBER'
  | 'OCTOBER'
  | 'NOVEMBER'
  | 'DECEMBER'

export type StudentMe = {
  publicId: string
  firstName: string
  fullName: string
  email: string | null
  studyLevel: string | null
  destinations: string[]
  intake: { month: IntakeMonth; year: number } | null
  budgetRange: string | null
  academicBackground: string | null
  englishTest: string | null
  advisor: Advisor | null
  conversationMode: 'AI_BOT' | 'HUMAN_ADVISOR'
}

// currency is any ISO 4217 code (GBP, CAD, EUR, NGN…).
export type Money = { amount: number; currency: string }

export type ProgrammeMatch = {
  programmeId: string
  programmeName: string
  level: string
  schoolName: string
  city: string
  country: string
  duration: string // e.g. "2 years"
  intakes: string[]
  tuition: Money
  scores: {
    overall: number
    programmeFit: number
    budgetFit: number
    intakeFit: number
    visaFit: number
  }
  reasons: string[]
  missingRequirements: string[]
  shortlisted: boolean
  chosen: boolean
}

export type QuickReply = { label: string; value: string }

export type ChatMessage = {
  id: string
  senderType: 'STUDENT' | 'AGENT' | 'ADVISOR' | 'SYSTEM'
  senderName: string | null
  content: string
  // Where the message came from (student) or went to (AI/advisor).
  channel: 'TELEGRAM' | 'WEB'
  createdAt: string
  // Only on local onboarding prompts; server messages have none.
  quickReplies: QuickReply[]
}

// advisorHandling: an advisor has taken over, so the AI doesn't reply until it's handed back.
export type Chat = { messages: ChatMessage[]; advisorHandling: boolean }

// A one-page summary a student shares with a parent, sponsor or anyone helping them.
export type StudyPlan = {
  studentName: string
  programme: ProgrammeMatch
  costBreakdown: { label: string; amount: Money }[]
  total: Money
  requirementsMet: string[]
  requirementsMissing: string[]
  nextSteps: { title: string; when: string }[]
  advisor: { name: string; email: string | null } | null
  generatedAt: string
}
