const TERMS_URL = 'https://smetase.com/terms'
const PRIVACY_URL = 'https://smetase.com/privacy'

const linkClass = 'text-ink underline underline-offset-2'

// Under every "Continue with Google" button: the Google button stays locked until this is ticked,
// so signing in is the agreement (the API records it).
const SignInTerms = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className="mt-4 flex cursor-pointer items-start justify-center gap-2.5 text-xs leading-5 text-muted">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 size-4 shrink-0 cursor-pointer accent-ink"
    />
    <span>
      I agree to the{' '}
      <a href={TERMS_URL} target="_blank" rel="noreferrer" className={linkClass}>
        Terms
      </a>{' '}
      and{' '}
      <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className={linkClass}>
        Privacy Policy
      </a>
      .
    </span>
  </label>
)

export default SignInTerms
