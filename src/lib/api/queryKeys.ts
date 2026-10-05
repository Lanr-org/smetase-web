export const queryKeys = {
  me: ['me'],
  journey: ['journey'],
  matches: ['matches'],
  messages: ['messages'],
  studyPlan: ['study-plan'],
  activeInterview: ['interview', 'active'],
  interviews: ['interview', 'list'],
  interview: (id: string) => ['interview', id] as const,
} as const
