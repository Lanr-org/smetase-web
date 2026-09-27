// The shapes the student API returns. Stage 1 serves them from mock.ts;
// Stages 3–4 serve the same shapes from the backend.

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
  action: { label: string; target: 'CHAT' | 'PLAN' | 'PARENT_PACK' } | null
}

export type Journey = {
  currentStage: JourneyStageKey
  stages: JourneyStage[]
  nextStep: NextStep
}

export type Advisor = {
  name: string
  // null until a conversation has been handed to this advisor.
  handlingSince: string | null
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
  email: string
  studyLevel: string | null
  destinations: string[]
  intake: { month: IntakeMonth; year: number } | null
  budgetRange: string | null
  advisor: Advisor | null
  conversationMode: 'AI_BOT' | 'HUMAN_ADVISOR'
}

export type Currency = 'GBP' | 'CAD' | 'USD' | 'EUR' | 'NGN'
export type Money = { amount: number; currency: Currency }

export type ProgrammeMatch = {
  programmeId: string
  programmeName: string
  level: string
  schoolName: string
  city: string
  country: string
  durationMonths: number
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
  createdAt: string
  quickReplies: QuickReply[]
}

export type ParentPack = {
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
