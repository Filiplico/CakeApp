import ColorSwatches from './ColorSwatches'
import { ACCENT_COLORS } from './options'

export interface TierChoice {
  label: string
  selected: boolean
  onToggle: () => void
}

interface Props {
  label: string
  active: boolean
  color: string
  withRainbow?: boolean
  /** Which tiers the option sits on, top tier first. Left out when there is nothing to choose. */
  tiers?: TierChoice[]
  onToggle: () => void
  onColor: (color: string) => void
}

/** One topping or decoration: an on/off toggle, then its colour and tier choices once it is on. */
export default function OptionRow({ label, active, color, withRainbow, tiers, onToggle, onColor }: Props) {
  return (
    <div className="studio-option">
      <button type="button" className="studio-option__toggle" aria-pressed={active} onClick={onToggle}>
        {label}
      </button>
      {active && (
        <ColorSwatches
          label={label}
          colors={ACCENT_COLORS}
          value={color}
          onChange={onColor}
          withRainbow={withRainbow}
        />
      )}
      {active && tiers && (
        <div className="studio-option__tiers" role="group" aria-label={`${label}: which tiers`}>
          <span>On</span>
          {tiers.map((tier) => (
            <button key={tier.label} type="button" aria-pressed={tier.selected} onClick={tier.onToggle}>
              {tier.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
