import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdvisorCard from '../components/AdvisorCard.js'
import ChatPanel from '../components/ChatPanel.js'
import JourneyRail from '../components/JourneyRail.js'
import MobileTabs, { type Tab } from '../components/layout/MobileTabs.js'
import TopBar from '../components/layout/TopBar.js'
import NextStepCard, { type NextStepTarget } from '../components/NextStepCard.js'
import PlanPanel from '../components/PlanPanel.js'
import TelegramCard from '../components/TelegramCard.js'
import { useJourney } from '../features/journey/useJourney.js'
import { cn } from '../utils/cn.js'

// Desktop: journey │ chat │ plan. Mobile: one tab at a time plus the next-step card.
const AppPage = () => {
  const [tab, setTab] = useState<Tab>('CHAT')
  const navigate = useNavigate()
  const { data: journey } = useJourney()

  const goTo = (target: NextStepTarget) => {
    if (target === 'STUDY_PLAN') navigate('/study-plan')
    else setTab(target)
  }

  return (
    <div className="flex h-dvh flex-col">
      <TopBar />
      {journey ? (
        <div className="flex-none border-b border-line p-3 lg:hidden">
          <NextStepCard step={journey.nextStep} onAction={goTo} compact />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            'w-full overflow-y-auto border-line lg:block lg:w-80 lg:flex-none lg:border-r',
            tab === 'JOURNEY' ? 'block' : 'hidden',
          )}
        >
          {journey ? (
            <div className="hidden p-4 lg:block">
              <NextStepCard step={journey.nextStep} onAction={goTo} />
            </div>
          ) : null}
          <JourneyRail />
          <AdvisorCard />
          <TelegramCard />
        </aside>

        <section className={cn('min-w-0 flex-1 lg:flex', tab === 'CHAT' ? 'flex' : 'hidden')}>
          <ChatPanel />
        </section>

        <aside
          className={cn(
            'w-full overflow-y-auto border-line lg:block lg:w-[420px] lg:flex-none lg:border-l',
            tab === 'PLAN' ? 'block' : 'hidden',
          )}
        >
          <PlanPanel onOpenStudyPlan={() => navigate('/study-plan')} />
        </aside>
      </div>

      <MobileTabs value={tab} onChange={setTab} />
    </div>
  )
}

export default AppPage
