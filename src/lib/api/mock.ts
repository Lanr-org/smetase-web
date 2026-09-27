// In-memory fake backend for Stage 1. Every school, programme, person and number here
// is fictional demo data. It exists only so the UI can be built and reviewed before
// the student API exists.
import type { StudentApi } from './studentApi.js'
import type {
  ChatMessage,
  ChecklistItem,
  Journey,
  JourneyStage,
  JourneyStageKey,
  NextStep,
  ParentPack,
  ProgrammeMatch,
  QuickReply,
  StageOwner,
  StudentMe,
} from './types.js'

const STAGE_ORDER: JourneyStageKey[] = [
  'PROFILE',
  'EXPLORE',
  'CHOOSE',
  'APPLY',
  'OFFER',
  'ENGLISH',
  'FUNDS',
  'VISA',
]

const STAGE_DEFS: Record<
  JourneyStageKey,
  { title: string; description: string; owner: StageOwner; checklist: string[] }
> = {
  PROFILE: {
    title: 'Your profile',
    description: 'Tell us what you want to study, where and when.',
    owner: 'SMETASE',
    checklist: ['Study level', 'Destination', 'Start date', 'Budget'],
  },
  EXPLORE: {
    title: 'Explore',
    description: 'See programmes that fit you, and why.',
    owner: 'SMETASE',
    checklist: ['Review your matches', 'Shortlist at least one programme'],
  },
  CHOOSE: {
    title: 'Shortlist & choose',
    description: 'Pick one programme and bring your parents in.',
    owner: 'YOU',
    checklist: ['Choose a programme', 'Share the Parent Pack with your parents'],
  },
  APPLY: {
    title: 'Apply',
    description: 'Your advisor helps you prepare and submit.',
    owner: 'ADVISOR',
    checklist: ['Documents ready', 'Application submitted'],
  },
  OFFER: {
    title: 'Offer & tuition',
    description: 'Accept your offer and pay the deposit.',
    owner: 'YOU',
    checklist: ['Offer received', 'Tuition deposit paid'],
  },
  ENGLISH: {
    title: 'English test',
    description: 'IELTS booked and score in (or WAEC accepted).',
    owner: 'YOU',
    checklist: ['Test booked', 'Score received'],
  },
  FUNDS: {
    title: 'Proof of funds',
    description: 'Show the funds your visa needs.',
    owner: 'ADVISOR',
    checklist: ['Funds plan agreed', 'Documents ready'],
  },
  VISA: {
    title: 'Visa',
    description: 'Apply for your student visa.',
    owner: 'ADVISOR',
    checklist: ['Application submitted', 'Biometrics done', 'Decision received'],
  },
}

const ADVISOR_NAME = 'Amina Yusuf'

const PROGRAMMES: ProgrammeMatch[] = [
  {
    programmeId: 'PRG-DEMO-1',
    programmeName: 'MSc Data Science',
    level: 'Masters',
    schoolName: 'Northbridge University',
    city: 'Leeds',
    country: 'United Kingdom',
    durationMonths: 12,
    intakes: ['September 2027', 'January 2028'],
    tuition: { amount: 18500, currency: 'GBP' },
    scores: { overall: 86, programmeFit: 92, budgetFit: 78, intakeFit: 100, visaFit: 74 },
    reasons: [
      'Matches your data & analytics interest',
      'September 2027 intake available',
      'Within your budget range',
    ],
    missingRequirements: ['IELTS 6.5 (no band below 6.0)'],
    shortlisted: false,
    chosen: false,
  },
  {
    programmeId: 'PRG-DEMO-2',
    programmeName: 'MSc Business Analytics',
    level: 'Masters',
    schoolName: 'Harbour Institute',
    city: 'Toronto',
    country: 'Canada',
    durationMonths: 16,
    intakes: ['September 2027'],
    tuition: { amount: 29000, currency: 'CAD' },
    scores: { overall: 81, programmeFit: 85, budgetFit: 80, intakeFit: 100, visaFit: 62 },
    reasons: ['Strong fit for business + data', 'Co-op work placement included', 'Budget fits'],
    missingRequirements: ['IELTS 6.5', 'Statement of purpose'],
    shortlisted: false,
    chosen: false,
  },
  {
    programmeId: 'PRG-DEMO-3',
    programmeName: 'MSc Computer Science',
    level: 'Masters',
    schoolName: 'Westhaven University',
    city: 'Glasgow',
    country: 'United Kingdom',
    durationMonths: 12,
    intakes: ['September 2027'],
    tuition: { amount: 21000, currency: 'GBP' },
    scores: { overall: 77, programmeFit: 88, budgetFit: 60, intakeFit: 100, visaFit: 74 },
    reasons: ['Great match for your degree', 'September 2027 intake available'],
    missingRequirements: ['IELTS 6.5', 'Tuition is at the top of your budget'],
    shortlisted: false,
    chosen: false,
  },
  {
    programmeId: 'PRG-DEMO-4',
    programmeName: 'MA Digital Marketing',
    level: 'Masters',
    schoolName: 'Kestrel College',
    city: 'Dublin',
    country: 'Ireland',
    durationMonths: 12,
    intakes: ['September 2027', 'January 2028'],
    tuition: { amount: 14500, currency: 'EUR' },
    scores: { overall: 72, programmeFit: 64, budgetFit: 90, intakeFit: 100, visaFit: 70 },
    reasons: ['Lowest tuition in your matches', 'Two intakes to choose from'],
    missingRequirements: ['IELTS 6.5'],
    shortlisted: false,
    chosen: false,
  },
  {
    programmeId: 'PRG-DEMO-5',
    programmeName: 'MSc Artificial Intelligence',
    level: 'Masters',
    schoolName: 'Lakeshore Polytechnic',
    city: 'Vancouver',
    country: 'Canada',
    durationMonths: 20,
    intakes: ['January 2028'],
    tuition: { amount: 34000, currency: 'CAD' },
    scores: { overall: 64, programmeFit: 90, budgetFit: 40, intakeFit: 55, visaFit: 62 },
    reasons: ['Excellent programme fit'],
    missingRequirements: [
      'Only a January 2028 intake',
      'Above your budget range',
      'IELTS 7.0',
    ],
    shortlisted: false,
    chosen: false,
  },
]

// --- state --------------------------------------------------------------------

type State = {
  stage: JourneyStageKey
  me: StudentMe
  programmes: ProgrammeMatch[]
  messages: ChatMessage[]
  onboardingStep: number
  parentPackShared: boolean
}

let idCounter = 0
const nextId = () => `msg-${++idCounter}`

const message = (
  senderType: ChatMessage['senderType'],
  content: string,
  quickReplies: QuickReply[] = [],
): ChatMessage => ({
  id: nextId(),
  senderType,
  senderName:
    senderType === 'ADVISOR' ? ADVISOR_NAME : senderType === 'AGENT' ? 'Smetase AI' : null,
  content,
  createdAt: new Date().toISOString(),
  quickReplies,
})

// Onboarding mirrors the Telegram bot's buttons: level → destination → intake, plus budget.
const ONBOARDING: { question: string; replies: QuickReply[] }[] = [
  {
    question: "Hey! I'm Smetase. Let's find programmes that actually fit you. What level are you aiming for?",
    replies: [
      { label: 'Masters', value: 'Masters' },
      { label: 'Bachelors', value: 'Bachelors' },
      { label: 'PhD', value: 'PhD' },
      { label: 'Diploma', value: 'Diploma' },
    ],
  },
  {
    question: 'Nice. Where would you like to study?',
    replies: [
      { label: 'UK', value: 'United Kingdom' },
      { label: 'Canada', value: 'Canada' },
      { label: 'Ireland', value: 'Ireland' },
      { label: 'USA', value: 'United States' },
    ],
  },
  {
    question: 'When do you want to start?',
    replies: [
      { label: 'September 2027', value: 'September 2027' },
      { label: 'January 2028', value: 'January 2028' },
    ],
  },
  {
    question: 'Last one: roughly what tuition budget per year works for your family?',
    replies: [
      { label: 'Under £15k', value: 'Under £15k' },
      { label: '£15k – £25k', value: '£15k – £25k' },
      { label: 'Over £25k', value: 'Over £25k' },
    ],
  },
]

const blankStudent = (): StudentMe => ({
  publicId: 'STU-DEMO',
  firstName: 'Tobi',
  fullName: 'Tobi Adeyemi',
  email: 'tobi@example.com',
  studyLevel: null,
  destinations: [],
  intake: null,
  budgetRange: null,
  advisor: null,
  conversationMode: 'AI_BOT',
})

const fillProfile = (me: StudentMe) => {
  me.studyLevel = 'Masters'
  me.destinations = ['United Kingdom', 'Canada']
  me.intake = { month: 'SEPTEMBER', year: 2027 }
  me.budgetRange = '£15k – £25k'
}

const handOverToAdvisor = (s: State) => {
  s.stage = 'APPLY'
  s.me.conversationMode = 'HUMAN_ADVISOR'
  s.me.advisor = { name: ADVISOR_NAME, handlingSince: new Date().toISOString() }
  s.messages.push(
    message('SYSTEM', `${ADVISOR_NAME} from Smetase has joined the chat.`),
    message(
      'ADVISOR',
      `Hi ${s.me.firstName}! I'm ${ADVISOR_NAME}, your Smetase advisor. I'll help you get your application together. First, do you have your degree certificate and transcript ready?`,
      [
        { label: 'Yes, both', value: 'Yes, I have both' },
        { label: 'Not yet', value: 'Not yet' },
      ],
    ),
  )
}

// Builds the state as if the student had already reached `stage` (review helper).
const seedState = (stage: JourneyStageKey): State => {
  const s: State = {
    stage: 'PROFILE',
    me: blankStudent(),
    programmes: structuredClone(PROGRAMMES),
    messages: [],
    onboardingStep: 0,
    parentPackShared: false,
  }
  const first = ONBOARDING[0]!
  s.messages.push(message('AGENT', first.question, first.replies))

  const at = STAGE_ORDER.indexOf(stage)
  if (at >= STAGE_ORDER.indexOf('EXPLORE')) {
    fillProfile(s.me)
    s.onboardingStep = ONBOARDING.length
    s.stage = 'EXPLORE'
    s.messages = [
      message('STUDENT', 'Masters'),
      message('STUDENT', 'United Kingdom and Canada'),
      message('STUDENT', 'September 2027'),
      message('STUDENT', '£15k – £25k'),
      message(
        'AGENT',
        'Here are 5 programmes that fit you. Open your plan to see why each one fits, and shortlist the ones you like.',
      ),
    ]
  }
  if (at >= STAGE_ORDER.indexOf('CHOOSE')) {
    const chosen = s.programmes[0]!
    chosen.shortlisted = true
    chosen.chosen = true
    s.programmes[1]!.shortlisted = true
    s.stage = 'CHOOSE'
    s.messages.push(
      message('SYSTEM', `You chose ${chosen.programmeName} at ${chosen.schoolName}.`),
      message(
        'AGENT',
        "Great choice. Next step: your parents. I've put together a Parent Pack with the full cost and next steps that you can send them.",
        [{ label: "I'm ready to apply", value: "I'm ready to apply" }],
      ),
    )
  }
  if (at >= STAGE_ORDER.indexOf('APPLY')) {
    s.parentPackShared = true
    s.messages.push(message('STUDENT', "I'm ready to apply"))
    handOverToAdvisor(s)
  }
  if (at > STAGE_ORDER.indexOf('APPLY')) {
    s.stage = stage
    s.messages.push(
      message('STUDENT', 'Yes, I have both'),
      message('ADVISOR', "Perfect. I'll take it from here and keep you posted on each step."),
    )
  }
  return s
}

const initialStage = (): JourneyStageKey => {
  if (!import.meta.env.DEV) return 'PROFILE'
  const param = new URLSearchParams(window.location.search).get('stage')?.toUpperCase()
  return STAGE_ORDER.find((key) => key === param) ?? 'PROFILE'
}

let state = seedState(initialStage())

// --- derived views --------------------------------------------------------------

const checklistFor = (key: JourneyStageKey, status: JourneyStage['status']): ChecklistItem[] =>
  STAGE_DEFS[key].checklist.map((label, index) => {
    let done = status === 'DONE'
    if (status === 'CURRENT') {
      if (key === 'PROFILE') {
        done = [
          state.me.studyLevel,
          state.me.destinations.length ? 'yes' : null,
          state.me.intake,
          state.me.budgetRange,
        ][index] != null
      } else if (key === 'EXPLORE') {
        done = index === 1 && state.programmes.some((p) => p.shortlisted)
      } else if (key === 'CHOOSE') {
        done = index === 0 ? state.programmes.some((p) => p.chosen) : state.parentPackShared
      }
    }
    return { id: `${key}-${index}`, label, done }
  })

const nextStepFor = (key: JourneyStageKey): NextStep => {
  const hasChosen = state.programmes.some((p) => p.chosen)
  switch (key) {
    case 'PROFILE':
      return {
        title: 'Finish your profile',
        description: 'Answer a few quick questions so we can match you.',
        action: { label: 'Go to chat', target: 'CHAT' },
      }
    case 'EXPLORE':
      return {
        title: 'Review your matches',
        description: 'We found programmes that fit you. Shortlist the ones you like.',
        action: { label: 'See my matches', target: 'PLAN' },
      }
    case 'CHOOSE':
      return hasChosen
        ? {
            title: 'Show your parents',
            description: 'Send them the Parent Pack: the programme, full cost and next steps.',
            action: { label: 'Open Parent Pack', target: 'PARENT_PACK' },
          }
        : {
            title: 'Pick your programme',
            description: 'Compare your shortlist and choose the one you want.',
            action: { label: 'See my shortlist', target: 'PLAN' },
          }
    case 'APPLY':
      return {
        title: 'Get your documents ready',
        description: `${ADVISOR_NAME} will tell you exactly what's needed.`,
        action: { label: `Message ${ADVISOR_NAME.split(' ')[0]}`, target: 'CHAT' },
      }
    case 'OFFER':
      return {
        title: 'Accept your offer',
        description: 'Accept it and plan the tuition deposit with your parents.',
        action: { label: 'Open Parent Pack', target: 'PARENT_PACK' },
      }
    case 'ENGLISH':
      return {
        title: 'Book your IELTS',
        description: 'Your programme needs IELTS 6.5. Book a date that leaves time for results.',
        action: { label: 'Ask about IELTS', target: 'CHAT' },
      }
    case 'FUNDS':
      return {
        title: 'Sort your proof of funds',
        description: `${ADVISOR_NAME} will walk you and your parents through it.`,
        action: { label: `Message ${ADVISOR_NAME.split(' ')[0]}`, target: 'CHAT' },
      }
    case 'VISA':
      return {
        title: 'Prepare your visa application',
        description: `${ADVISOR_NAME} will guide you through each step.`,
        action: { label: `Message ${ADVISOR_NAME.split(' ')[0]}`, target: 'CHAT' },
      }
  }
}

const buildJourney = (): Journey => {
  const current = STAGE_ORDER.indexOf(state.stage)
  return {
    currentStage: state.stage,
    stages: STAGE_ORDER.map((key, index) => {
      const status = index < current ? 'DONE' : index === current ? 'CURRENT' : 'UPCOMING'
      const def = STAGE_DEFS[key]
      return {
        key,
        title: def.title,
        description: def.description,
        owner: def.owner,
        status,
        checklist: checklistFor(key, status),
      }
    }),
    nextStep: nextStepFor(state.stage),
  }
}

const buildParentPack = (): ParentPack | null => {
  const programme = state.programmes.find((p) => p.chosen)
  if (!programme) return null
  const { currency } = programme.tuition
  // Fictional estimates for the demo only.
  const costBreakdown = [
    { label: 'Tuition (first year)', amount: programme.tuition },
    { label: 'Living costs (estimate)', amount: { amount: 12000, currency } },
    { label: 'Visa and health fees (estimate)', amount: { amount: 1800, currency } },
  ]
  return {
    studentName: state.me.fullName,
    programme: structuredClone(programme),
    costBreakdown,
    total: {
      amount: costBreakdown.reduce((sum, item) => sum + item.amount.amount, 0),
      currency,
    },
    requirementsMet: ["Bachelor's degree in a related subject", 'Intake available'],
    requirementsMissing: programme.missingRequirements,
    nextSteps: [
      { title: 'Apply with your advisor', when: 'This month' },
      { title: 'Accept offer and pay tuition deposit', when: 'After your offer' },
      { title: 'Take IELTS', when: 'Before your offer deadline' },
      { title: 'Proof of funds and visa', when: 'About 3 months before you start' },
    ],
    advisor: state.me.advisor ? { name: state.me.advisor.name, email: null } : null,
    generatedAt: new Date().toISOString(),
  }
}

// --- scripted replies ---------------------------------------------------------

const applyOnboardingAnswer = (answer: string) => {
  switch (state.onboardingStep) {
    case 0:
      state.me.studyLevel = answer
      break
    case 1:
      state.me.destinations = [answer]
      break
    case 2: {
      const [month, year] = answer.toUpperCase().split(' ')
      if (month === 'SEPTEMBER' || month === 'JANUARY') {
        state.me.intake = { month, year: Number(year) }
      }
      break
    }
    case 3:
      state.me.budgetRange = answer
      break
  }
  state.onboardingStep += 1
}

const replyTo = (content: string): ChatMessage[] => {
  if (state.me.conversationMode === 'HUMAN_ADVISOR') {
    return [message('ADVISOR', 'Thanks! I\'ll check and get back to you shortly.')]
  }

  if (state.stage === 'PROFILE' && state.onboardingStep < ONBOARDING.length) {
    applyOnboardingAnswer(content)
    const next = ONBOARDING[state.onboardingStep]
    if (next) return [message('AGENT', next.question, next.replies)]
    state.stage = 'EXPLORE'
    return [
      message(
        'AGENT',
        'Here are 5 programmes that fit you. Open your plan to see why each one fits, and shortlist the ones you like.',
      ),
    ]
  }

  if (state.stage === 'CHOOSE' && /ready to apply/i.test(content)) {
    handOverToAdvisor(state)
    return []
  }

  return [
    message(
      'AGENT',
      state.stage === 'EXPLORE'
        ? 'Good question. Each programme in your plan shows its fit score and exactly why it fits. Shortlist a few, then choose the one you like most.'
        : 'Good question. I can help with that, and your advisor can confirm the details for your situation.',
    ),
  ]
}

// --- API --------------------------------------------------------------------

const delay = (ms = 300 + Math.random() * 400) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = <T>(value: T): T => structuredClone(value)

export const mockBackend: StudentApi = {
  async getMe() {
    await delay()
    return clone(state.me)
  },

  async getJourney() {
    await delay()
    return buildJourney()
  },

  async getMatches() {
    await delay()
    return state.stage === 'PROFILE' ? [] : clone(state.programmes)
  },

  async toggleShortlist(programmeId) {
    await delay(200)
    const programme = state.programmes.find((p) => p.programmeId === programmeId)
    if (!programme) throw new Error('Programme not found')
    programme.shortlisted = !programme.shortlisted
    if (!programme.shortlisted) programme.chosen = false
    return clone(programme)
  },

  async chooseProgramme(programmeId) {
    await delay()
    const programme = state.programmes.find((p) => p.programmeId === programmeId)
    if (!programme) throw new Error('Programme not found')
    for (const p of state.programmes) p.chosen = p.programmeId === programmeId
    programme.shortlisted = true
    if (STAGE_ORDER.indexOf(state.stage) < STAGE_ORDER.indexOf('CHOOSE')) state.stage = 'CHOOSE'
    state.messages.push(
      message('SYSTEM', `You chose ${programme.programmeName} at ${programme.schoolName}.`),
      message(
        'AGENT',
        "Great choice. Next step: your parents. I've put together a Parent Pack with the full cost and next steps that you can send them.",
        [{ label: "I'm ready to apply", value: "I'm ready to apply" }],
      ),
    )
    return buildJourney()
  },

  async getMessages() {
    await delay(200)
    return clone(state.messages)
  },

  async sendMessage(content) {
    const mine = message('STUDENT', content)
    state.messages.push(mine)
    await delay(700 + Math.random() * 600)
    const before = state.messages.length
    state.messages.push(...replyTo(content))
    // slice(before) also catches messages replyTo pushed itself (the advisor handover).
    return clone([mine, ...state.messages.slice(before)])
  },

  async getParentPack() {
    await delay()
    return buildParentPack()
  },

  async markParentPackShared() {
    await delay(150)
    state.parentPackShared = true
  },
}
