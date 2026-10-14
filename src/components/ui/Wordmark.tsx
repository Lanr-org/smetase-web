import { cn } from '../../utils/cn.js'

// The Smetase logo, assembled from the same parts as the landing page (public/logo, copied from
// smetase-landing). The source SVGs are white, so they are inverted for the app's light background.
const W = 652.364
const H = 120

const PARTS = [
  { name: 'mark', left: 0, top: 0, width: 93.818, height: 120 },
  { name: 's', left: 105.6, top: 25.26, width: 67.636, height: 64.364 },
  { name: 'm2', left: 227.76, top: 35.66, width: 14.182, height: 50.182 },
  { name: 'm1', left: 186.34, top: 25.28, width: 53.455, height: 62.182 },
  { name: 't', left: 365.04, top: 10.7, width: 56.727, height: 78.545 },
  { name: 'rest', left: 230.15, top: 25.26, width: 423.273, height: 64.364 },
]

const Wordmark = ({ className }: { className?: string }) => (
  <span
    aria-label="Smetase"
    className={cn('relative inline-block h-[22px] shrink-0', className)}
    role="img"
    style={{ aspectRatio: `${W} / ${H}` }}
  >
    {PARTS.map((part) => (
      <img
        key={part.name}
        alt=""
        className="absolute block invert"
        draggable={false}
        src={`/logo/${part.name}.svg`}
        style={{
          left: `${(part.left / W) * 100}%`,
          top: `${(part.top / H) * 100}%`,
          width: `${(part.width / W) * 100}%`,
          height: `${(part.height / H) * 100}%`,
        }}
      />
    ))}
  </span>
)

export default Wordmark
