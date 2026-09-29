import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { StudyPlan } from '../lib/api/types.js'
import { formatDate, formatMoney } from '../utils/format.js'
import Wordmark from './ui/Wordmark.js'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-b border-line py-6 last:border-b-0">
    <h2 className="text-xs font-medium uppercase tracking-widest text-muted">{title}</h2>
    <div className="mt-3">{children}</div>
  </section>
)

// The one-page plan itself, shared by the student's own page and the public link parents open.
// studentName is the full name on the student's page and the first name on the public one.
type Props = { plan: Omit<StudyPlan, 'studentName'>; studentName: string }

const StudyPlanView = ({ plan, studentName }: Props) => {
  const firstName = studentName.split(' ')[0] ?? studentName

  return (
    <article className="mt-6">
      <header className="border-b border-line pb-6">
        <Wordmark />
        <h1 className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight">
          Study plan for {studentName}
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
          Tuition only. Living costs, visa fees and other expenses aren't included yet; the Smetase advisor will
          confirm the full cost.
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

      <Section title="Advisor">
        <p className="text-sm">
          {plan.advisor
            ? `${plan.advisor.name} from Smetase is guiding ${firstName} through each step.`
            : `A Smetase advisor joins when ${firstName} is ready to apply.`}
        </p>
      </Section>
    </article>
  )
}

export default StudyPlanView
