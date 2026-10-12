import { useMutation, useQueryClient } from '@tanstack/react-query'
import Button from '../components/ui/Button.js'
import Wordmark from '../components/ui/Wordmark.js'
import { queryKeys } from '../lib/api/queryKeys.js'
import { studentApi } from '../lib/api/studentApi.js'

const TERMS_URL = 'https://smetase.com/terms'
const PRIVACY_URL = 'https://smetase.com/privacy'

// Shown once, before anything else, until the student clicks "I agree" (the API locks chat,
// matches and plans until then). A new terms version on the server shows it again.
const AgreementPage = () => {
  const queryClient = useQueryClient()
  const accept = useMutation({
    mutationFn: studentApi.acceptTerms,
    onSuccess: (me) => queryClient.setQueryData(queryKeys.me, me),
  })

  return (
    <main className="flex min-h-dvh flex-col px-6 py-8">
      <header>
        <Wordmark />
      </header>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <h1 className="font-display text-3xl font-semibold leading-[1.15] tracking-tight">Before we start</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          I agree to the{' '}
          <a href={TERMS_URL} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-4">
            Terms
          </a>{' '}
          and{' '}
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </p>
        <Button className="mt-8 w-full" disabled={accept.isPending} onClick={() => accept.mutate()}>
          I agree
        </Button>
        {accept.isError ? (
          <p role="alert" className="mt-3 text-center text-sm text-caution">
            Something went wrong. Please try again.
          </p>
        ) : null}
      </div>
    </main>
  )
}

export default AgreementPage
