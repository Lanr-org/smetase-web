import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import StudyPlanView from '../components/StudyPlanView.js'
import Button from '../components/ui/Button.js'
import Spinner from '../components/ui/Spinner.js'
import Wordmark from '../components/ui/Wordmark.js'
import { usePublicStudyPlan } from '../features/studyPlan/useStudyPlan.js'

// What a parent or sponsor sees from a shared link. No sign-in; read-only; the live plan.
const PublicStudyPlanPage = () => {
  const { token = '' } = useParams()
  const { data: plan, isLoading, isError } = usePublicStudyPlan(token)

  // The plan names a real student: keep it out of search engines.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  if (isLoading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !plan) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Wordmark />
        <p className="mt-8 font-display text-2xl">This link isn't available</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          It may have expired or been turned off. Ask for a new link to the study plan.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-6 print:py-0">
      <StudyPlanView plan={plan} studentName={plan.studentFirstName} />
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line py-4 text-xs text-muted print:hidden">
        <span>Made with Smetase. This page shows the plan as it is today.</span>
        <Button variant="ghost" size="sm" onClick={() => window.print()}>
          Save as PDF
        </Button>
      </footer>
    </main>
  )
}

export default PublicStudyPlanPage
