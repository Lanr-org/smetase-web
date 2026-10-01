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

// Steps the system can't detect, ticked by hand. The student ticks deposit and English;
// proof of funds is their advisor's.
export type JourneyCheckKey =
  | 'DEPOSIT_PAID'
  | 'ENGLISH_TEST_BOOKED'
  | 'ENGLISH_SCORE_RECEIVED'
  | 'FUNDS_PLAN_AGREED'
  | 'FUNDS_DOCUMENTS_READY'

// checkKey is null for items derived from data; canTick says whether the student may change it.
export type ChecklistItem = {
  id: string
  label: string
  done: boolean
  checkKey: JourneyCheckKey | null
  canTick: boolean
}

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
  // A Telegram account is linked, so advisor replies can reach them there too.
  telegramLinked: boolean
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

// What happened to a Telegram ↔ web link on sign-in (only when a link token was sent).
export type LinkOutcome = 'LINKED' | 'ALREADY_LINKED' | 'MERGED' | 'REFUSED' | 'INVALID_TOKEN'

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
// awaitingReply: the AI's reply to the student's last message is on its way (show "typing").
export type Chat = { messages: ChatMessage[]; advisorHandling: boolean; awaitingReply: boolean }

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

// What a parent or sponsor sees through a shared link: the student's first name only.
export type PublicStudyPlan = Omit<StudyPlan, 'studentName'> & { studentFirstName: string }

export type StudyPlanShareLink = { url: string; expiresAt: string }
