import { ArrowLeft, ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.js'
import Button, { buttonClass } from '../components/ui/Button.js'
import Spinner from '../components/ui/Spinner.js'
import {
  useAbandonInterview,
  useActiveInterview,
  useInterview,
  useInterviewList,
  useStartInterview,
  useSubmitAnswer,
} from '../features/interview/useInterview.js'
import type { InterviewAnswer, InterviewResult, InterviewSession, InterviewType } from '../lib/api/interviewTypes.js'
import { apiErrorMessage } from '../utils/apiError.js'

const TYPE_LABEL: Record<InterviewType, string> = { VISA: 'Visa interview', ADMISSION: 'Admission interview' }

const TYPE_BLURB: Record<InterviewType, string> = {
  VISA: 'Purpose of study, funding, ties to home and plans after graduation.',
  ADMISSION: 'Your background, why this course and school, and your goals.',
}

const DISCLAIMER =
  'Practice only. Confirm real visa and admission requirements with your advisor or the official source.'

const scoreTone = (score: number) => (score >= 7 ? 'confirm' : score >= 5 ? 'neutral' : 'caution')

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

// One answered question: what was asked, what the student said, and the feedback.
const Exchange = ({ item }: { item: InterviewAnswer }) => (
  <div className="space-y-3">
    <p className="text-xs font-medium uppercase tracking-widest text-muted">Question {item.index + 1}</p>
    <p className="font-semibold">{item.question}</p>
    {item.answer ? (
      <p className="ml-auto max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-3 text-sm text-paper">
        {item.answer}
      </p>
    ) : null}
    {item.tip ? (
      <div className="rounded-2xl border border-line p-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">Feedback</p>
          {item.score !== null ? <Badge tone={scoreTone(item.score)}>{item.score}/10</Badge> : null}
        </div>
        <p className="mt-2 text-sm leading-6">{item.tip}</p>
        {item.sampleAnswer ? (
          <div className="mt-3 rounded-xl bg-subtle p-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">A stronger answer</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{item.sampleAnswer}</p>
          </div>
        ) : null}
      </div>
    ) : null}
  </div>
)

const ResultCard = ({ result }: { result: InterviewResult }) => (
  <div className="rounded-2xl border border-line p-5">
    <p className="text-xs font-medium uppercase tracking-widest text-muted">Interview complete</p>
    <p className="mt-2 font-display text-4xl">
      {result.overallScore}
      <span className="text-lg text-muted"> / 100</span>
    </p>
    <p className="mt-3 text-sm leading-6">{result.summary}</p>
    {result.strengths.length ? (
      <div className="mt-4">
        <p className="text-sm font-semibold">Strengths</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6">
          {result.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    ) : null}
    {result.improvements.length ? (
      <div className="mt-4">
        <p className="text-sm font-semibold">To improve</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6">
          {result.improvements.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    ) : null}
  </div>
)

const Picker = ({ onOpen, onStarted }: { onOpen: (id: string) => void; onStarted: (id: string) => void }) => {
  const start = useStartInterview()
  const { data: list } = useInterviewList()
  const [pending, setPending] = useState<InterviewType | null>(null)
  const past = (list ?? []).filter((s) => s.status === 'COMPLETED')

  const begin = (type: InterviewType) => {
    setPending(type)
    start.mutate(type, { onSuccess: (turn) => onStarted(turn.sessionId) })
  }

  return (
    <>
      <h1 className="mt-6 font-display text-2xl">Practise an interview</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Five questions, one at a time. After each answer you get a tip, and a sample answer when it needs work.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(Object.keys(TYPE_LABEL) as InterviewType[]).map((type) => (
          <button
            key={type}
            type="button"
            disabled={start.isPending}
            onClick={() => begin(type)}
            className="rounded-2xl border border-line p-4 text-left hover:bg-subtle disabled:opacity-60"
          >
            <p className="font-semibold">{TYPE_LABEL[type]}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{TYPE_BLURB[type]}</p>
            {start.isPending && pending === type ? <p className="mt-2 text-xs text-muted">Starting…</p> : null}
          </button>
        ))}
      </div>
      {start.isError ? (
        <p role="alert" className="mt-3 text-sm text-caution">
          {apiErrorMessage(start.error, "Couldn't start the interview. Please try again.")}
        </p>
      ) : null}
      <p className="mt-4 text-xs text-muted">{DISCLAIMER}</p>

      {past.length ? (
        <div className="mt-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Past interviews</p>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
            {past.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onOpen(s.id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-subtle"
                >
                  <span>
                    {TYPE_LABEL[s.type]}
                    <span className="text-muted"> · {formatDate(s.createdAt)}</span>
                  </span>
                  {s.result ? <Badge>{s.result.overallScore}/100</Badge> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  )
}

const Running = ({ session, onStopped }: { session: InterviewSession; onStopped: () => void }) => {
  const submit = useSubmitAnswer(session.id)
  const abandon = useAbandonInterview()
  const [draft, setDraft] = useState('')
  const latestRef = useRef<HTMLDivElement>(null)

  const answered = session.answers.filter((a) => a.answer !== null)
  const current = session.answers.find((a) => a.answer === null)

  // Bring the latest feedback to the top so it and the next question are both in view
  // (also on first load, so a returning student lands on the current question).
  useEffect(() => {
    latestRef.current?.scrollIntoView({ block: 'start' })
  }, [answered.length])

  const send = () => {
    const text = draft.trim()
    if (!text || submit.isPending) return
    // Cleared only once the answer is saved, so a failed attempt can be resent as typed.
    submit.mutate(text, { onSuccess: () => setDraft('') })
  }

  const stop = () => {
    if (!window.confirm('Stop this interview? Your progress will not be scored.')) return
    abandon.mutate(session.id, { onSuccess: onStopped })
  }

  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">{TYPE_LABEL[session.type]}</h1>
          {session.programLabel || session.targetCountry ? (
            <p className="mt-1 text-sm text-muted">{session.programLabel ?? session.targetCountry}</p>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" onClick={stop} disabled={abandon.isPending || submit.isPending}>
          Stop
        </Button>
      </div>

      <div className="mt-6 space-y-8">
        {answered.map((item, i) => (
          <div key={item.index} ref={i === answered.length - 1 ? latestRef : undefined} className="scroll-mt-4">
            <Exchange item={item} />
          </div>
        ))}

        {current ? (
          <div ref={answered.length === 0 ? latestRef : undefined} className="space-y-2 scroll-mt-4">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                Question {current.index + 1} of {session.questionCount}
              </p>
            </div>
            <p className="font-display text-xl leading-snug">{current.question}</p>
          </div>
        ) : null}
        {submit.isPending ? <p className="text-sm text-muted">Your interviewer is reviewing your answer…</p> : null}
      </div>

      {current ? (
        <div className="sticky bottom-0 mt-6 border-t border-line bg-paper py-3">
          {submit.isError ? (
            <p role="alert" className="mb-2 text-sm text-caution">
              {apiErrorMessage(submit.error, "Couldn't record your answer. Please try again.")}
            </p>
          ) : null}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
            className="flex items-end gap-2"
          >
            <textarea
              rows={3}
              value={draft}
              maxLength={1500}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  send()
                }
              }}
              placeholder="Type your answer as you would say it…"
              aria-label="Your answer"
              className="min-h-24 flex-1 resize-none rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <button
              type="submit"
              aria-label="Send answer"
              disabled={!draft.trim() || submit.isPending}
              className="grid size-11 flex-none place-items-center rounded-full bg-ink text-paper disabled:opacity-40"
            >
              <ArrowUp size={18} />
            </button>
          </form>
          <p className="mt-2 text-xs text-muted">{DISCLAIMER}</p>
        </div>
      ) : null}
    </>
  )
}

const Finished = ({ session, onAgain }: { session: InterviewSession; onAgain: () => void }) => {
  // Open on the score, not wherever the last question left the page.
  useEffect(() => window.scrollTo(0, 0), [])

  return (
  <>
    <h1 className="mt-6 font-display text-2xl">{TYPE_LABEL[session.type]}</h1>
    <div className="mt-6 space-y-8">
      {session.result ? <ResultCard result={session.result} /> : null}
      {session.answers.map((item) => (
        <Exchange key={item.index} item={item} />
      ))}
    </div>
    <p className="mt-6 text-xs text-muted">{DISCLAIMER}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <Button onClick={onAgain}>Practise again</Button>
      <Link to="/app" className={buttonClass('secondary', 'md')}>
        Back to my plan
      </Link>
    </div>
  </>
  )
}

// Mock interviews: pick a type, answer five questions with feedback, then see the score.
const InterviewPage = () => {
  const { data: active, isLoading: loadingActive } = useActiveInterview()
  // The interview being shown. Adopted from the one in progress when the page opens, and kept
  // after it completes (the "active" query goes empty then, but the result must stay on screen).
  const [chosenId, setChosenId] = useState<string | null>(null)
  useEffect(() => {
    if (!chosenId && active) setChosenId(active.id)
  }, [active, chosenId])
  const sessionId = chosenId ?? active?.id ?? null
  const { data: session, isLoading: loadingSession } = useInterview(sessionId)

  const showPicker = !sessionId || session?.status === 'ABANDONED'
  const loading = loadingActive || (sessionId !== null && loadingSession && !session)

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-6">
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm font-medium">
        <ArrowLeft size={16} /> Back to my plan
      </Link>

      {loading ? (
        <div className="mt-16 grid place-items-center">
          <Spinner />
        </div>
      ) : showPicker || !session ? (
        <Picker onOpen={setChosenId} onStarted={setChosenId} />
      ) : session.status === 'IN_PROGRESS' ? (
        <Running session={session} onStopped={() => setChosenId(null)} />
      ) : (
        <Finished session={session} onAgain={() => setChosenId(null)} />
      )}
    </main>
  )
}

export default InterviewPage
