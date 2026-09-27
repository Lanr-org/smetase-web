import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button, { buttonClass } from '../components/ui/Button.js'
import Spinner from '../components/ui/Spinner.js'
import Wordmark from '../components/ui/Wordmark.js'
import { useMarkStudyPlanShared, useStudyPlan } from '../features/studyPlan/useStudyPlan.js'
import { firstName, formatDate, formatMoney } from '../utils/format.js'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-b border-line py-6 last:border-b-0">
    <h2 className="text-xs font-medium uppercase tracking-widest text-muted">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
)

// A one-page summary to share with a parent, sponsor or anyone helping the student.
const StudyPlanPage = () => {
  const { data: plan, isLoading } = useStudyPlan()
  const markShared = useMarkStudyPlanShared()
  const [copied, setCopied] = useState(false)

  const shareUrl = window.location.href
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Here's my study-abroad plan from Smetase: ${shareUrl}`,
  )}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      markShared.mutate()
    } catch {
      // Clipboard blocked: the address bar still has the link.
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-6 print:py-0">
      <div className="print:hidden">
        <Link to="/app" className="inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft size={16} /> Back to my plan
        </Link>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !plan ? (
        <div className="mt-16 text-center">
          <p className="font-display text-xl">Choose a programme first</p>
          <p className="mt-2 text-sm text-muted">Your study plan is ready once you've picked a programme.</p>
          <Link to="/app" className={buttonClass('primary', 'md', 'mt-6')}>
            Back to my plan
          </Link>
        </div>
      ) : (
        <>
          <article className="mt-6">
            <header className="border-b border-line pb-6">
              <Wordmark />
              <h1 className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight">
                Study plan for {plan.studentName}
              </h1>
              <p className="mt-2 text-sm text-muted">Prepared {formatDate(plan.generatedAt)}</p>
            </header>

            <Section title="The programme">
              <p className="text-lg font-semibold">{plan.programme.programmeName}</p>
              <p className="mt-1 text-sm text-muted">
                {plan.programme.schoolName} · {plan.programme.city}, {plan.programme.country}
              </p>
              <p className="mt-3 text-sm">
                {plan.programme.duration} · Starts {plan.programme.intakes.join(' or ')}
              </p>
            </Section>

            <Section title="Cost">
              <table className="w-full text-sm">
                <tbody>
                  {plan.costBreakdown.map((item) => (
                    <tr key={item.label} className="border-b border-line">
                      <td className="py-2.5">{item.label}</td>
                      <td className="py-2.5 text-right font-mono">{formatMoney(item.amount)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="pt-3 font-semibold">Total</td>
                    <td className="pt-3 text-right font-mono text-base font-semibold">{formatMoney(plan.total)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted">
                Tuition only. Living costs, visa fees and other expenses aren't included yet; your
                Smetase advisor will confirm the full cost.
              </p>
            </Section>

            <Section title="Requirements">
              <ul className="space-y-2 text-sm">
                {plan.requirementsMet.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 flex-none text-confirm" /> {item}
                  </li>
                ))}
                {plan.requirementsMissing.map((item) => (
                  <li key={item} className="flex gap-2 text-caution">
                    <AlertTriangle size={16} className="mt-0.5 flex-none" /> Still needed: {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Next steps">
              <ol className="space-y-3">
                {plan.nextSteps.map((step, index) => (
                  <li key={step.title} className="flex gap-3 text-sm">
                    <span className="grid size-6 flex-none place-items-center rounded-full border border-ink font-mono text-xs">
                      {index + 1}
                    </span>
                    <span>
                      <span className="font-medium">{step.title}</span>
                      <span className="block text-muted">{step.when}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Your advisor">
              <p className="text-sm">
                {plan.advisor
                  ? `${plan.advisor.name} from Smetase is guiding ${firstName(plan.studentName)} through each step.`
                  : `A Smetase advisor joins when ${firstName(plan.studentName)} is ready to apply.`}
              </p>
            </Section>
          </article>

          <div className="sticky bottom-0 mt-4 flex flex-wrap gap-2 border-t border-line bg-paper py-4 print:hidden">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => markShared.mutate()}
              className={buttonClass('primary')}
            >
              Share on WhatsApp
            </a>
            <Button variant="secondary" onClick={() => void copyLink()}>
              {copied ? 'Link copied' : 'Copy link'}
            </Button>
            <Button variant="ghost" onClick={() => window.print()}>
              Save as PDF
            </Button>
          </div>
        </>
      )}
    </main>
  )
}

export default StudyPlanPage
