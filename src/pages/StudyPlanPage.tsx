import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import StudyPlanView from '../components/StudyPlanView.js'
import Button, { buttonClass } from '../components/ui/Button.js'
import Spinner from '../components/ui/Spinner.js'
import { useCreateStudyPlanLink, useRevokeStudyPlanLinks, useStudyPlan } from '../features/studyPlan/useStudyPlan.js'
import { apiErrorMessage } from '../utils/apiError.js'

// The signed-in student's plan, with a public link to send to a parent or sponsor.
const StudyPlanPage = () => {
  const { data: plan, isLoading } = useStudyPlan()
  const createLink = useCreateStudyPlanLink()
  const revokeLinks = useRevokeStudyPlanLinks()
  const [notice, setNotice] = useState<string | null>(null)

  // One link per page visit: sharing twice reuses it instead of minting another.
  const shareUrl = async () => (createLink.data ?? (await createLink.mutateAsync())).url

  const shareOnWhatsApp = async () => {
    // Opened before the request so the popup isn't blocked, then pointed at the link.
    const tab = window.open('', '_blank')
    try {
      const url = await shareUrl()
      const text = encodeURIComponent(`Here's my study-abroad plan from Smetase: ${url}`)
      if (tab) tab.location.href = `https://wa.me/?text=${text}`
      else window.location.href = `https://wa.me/?text=${text}`
    } catch (error) {
      tab?.close()
      setNotice(apiErrorMessage(error, "Couldn't create a link. Try again."))
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(await shareUrl())
      setNotice('Link copied. Anyone with it can view this plan (no sign-in needed).')
    } catch (error) {
      setNotice(
        createLink.data
          ? `Copy this link: ${createLink.data.url}`
          : apiErrorMessage(error, "Couldn't create a link. Try again."),
      )
    }
  }

  const stopSharing = async () => {
    try {
      await revokeLinks.mutateAsync()
      createLink.reset()
      setNotice('Sharing stopped. Links you sent before no longer open.')
    } catch (error) {
      setNotice(apiErrorMessage(error, "Couldn't stop sharing. Try again."))
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
          <StudyPlanView plan={plan} studentName={plan.studentName} />

          <div className="sticky bottom-0 mt-4 border-t border-line bg-paper py-4 print:hidden">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void shareOnWhatsApp()} disabled={createLink.isPending}>
                Share on WhatsApp
              </Button>
              <Button variant="secondary" onClick={() => void copyLink()} disabled={createLink.isPending}>
                Copy link
              </Button>
              <Button variant="ghost" onClick={() => window.print()}>
                Save as PDF
              </Button>
            </div>
            {notice ? (
              <p className="mt-3 break-all text-xs text-muted" role="status">
                {notice}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void stopSharing()}
              disabled={revokeLinks.isPending}
              className="mt-2 text-xs text-muted underline underline-offset-2"
            >
              Stop sharing
            </button>
          </div>
        </>
      )}
    </main>
  )
}

export default StudyPlanPage
