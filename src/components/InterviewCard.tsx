import { Link } from 'react-router-dom'
import { useActiveInterview } from '../features/interview/useInterview.js'
import { buttonClass } from './ui/Button.js'

// Sidebar entry to interview practice; says "Continue" when one is already running.
const InterviewCard = () => {
  const { data: active } = useActiveInterview()

  return (
    <div className="m-4 rounded-2xl border border-line p-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">Interview practice</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Rehearse a visa or admission interview. Five questions, a tip after each answer, and a final score.
      </p>
      <Link to="/interview" className={buttonClass('primary', 'sm', 'mt-3')}>
        {active ? 'Continue interview' : 'Practise an interview'}
      </Link>
    </div>
  )
}

export default InterviewCard
