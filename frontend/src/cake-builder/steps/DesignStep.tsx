import type { Dispatch, SetStateAction } from 'react'
import ColorSwatches from '../ColorSwatches'
import OptionRow from '../OptionRow'
import {
  DECORATIONS,
  FROSTING_COLORS,
  MAX_TIERS,
  TOPPINGS,
  activeToppingTiers,
  tierName,
  type CakeConfig,
  type ToppingId,
} from '../options'
import type { CakeArtState } from '../useCakeArt'

interface Props {
  config: CakeConfig
  setConfig: Dispatch<SetStateAction<CakeConfig>>
  cakeArt: CakeArtState
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

export default function DesignStep({ config, setConfig, cakeArt }: Props) {
  // Tiers are stored bottom-up but listed top-down, the way the customer sees the cake.
  const tiersTopDown = Array.from({ length: config.tiers }, (_, i) => config.tiers - 1 - i)

  function setTierColor(index: number, hex: string) {
    setConfig((c) => ({ ...c, tierColors: c.tierColors.map((old, i) => (i === index ? hex : old)) }))
  }

  /** Adds or removes a topping from one tier. A topping always stays on at least one tier. */
  function toggleToppingTier(id: ToppingId, fromTop: number) {
    setConfig((c) => {
      const current = activeToppingTiers(c, id)
      const next = current.includes(fromTop) ? current.filter((t) => t !== fromTop) : [...current, fromTop]
      return next.length ? { ...c, toppingTiers: { ...c.toppingTiers, [id]: next } } : c
    })
  }

  function tierChoices(id: ToppingId) {
    if (config.tiers === 1) return undefined
    return Array.from({ length: config.tiers }, (_, fromTop) => ({
      label: tierName(config.tiers - 1 - fromTop, config.tiers),
      selected: activeToppingTiers(config, id).includes(fromTop),
      onToggle: () => toggleToppingTier(id, fromTop),
    }))
  }

  return (
    <div className="studio-body">
      <header className="studio-heading">
        <h1>
          Design your <em>cake</em>
        </h1>
        <p>Every choice shows up on the cake as you make it.</p>
      </header>

      <fieldset className="studio-group">
        <legend>Tiers</legend>
        <div className="studio-segments">
          {Array.from({ length: MAX_TIERS }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={config.tiers === n}
              onClick={() => setConfig((c) => ({ ...c, tiers: n }))}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="studio-group">
        <legend>Frosting colour</legend>
        {tiersTopDown.map((index) => (
          <div className="studio-colors" key={index}>
            <span className="studio-colors__label">{tierName(index, config.tiers)}</span>
            <ColorSwatches
              label={tierName(index, config.tiers)}
              colors={FROSTING_COLORS}
              value={config.tierColors[index]}
              onChange={(hex) => setTierColor(index, hex)}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className="studio-group">
        <legend>Toppings</legend>
        <div className="studio-options">
          {TOPPINGS.map((t) => (
            <OptionRow
              key={t.id}
              label={t.label}
              active={config.toppings.includes(t.id)}
              color={config.toppingColors[t.id]}
              tiers={tierChoices(t.id)}
              onToggle={() => setConfig((c) => ({ ...c, toppings: toggle(c.toppings, t.id) }))}
              onColor={(hex) => setConfig((c) => ({ ...c, toppingColors: { ...c.toppingColors, [t.id]: hex } }))}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="studio-group">
        <legend>Decorations</legend>
        <div className="studio-options">
          {DECORATIONS.map((d) => (
            <OptionRow
              key={d.id}
              label={d.label}
              active={config.decorations.includes(d.id)}
              color={config.decorationColors[d.id]}
              withRainbow={d.id === 'sprinkles'}
              onToggle={() => setConfig((c) => ({ ...c, decorations: toggle(c.decorations, d.id) }))}
              onColor={(hex) => setConfig((c) => ({ ...c, decorationColors: { ...c.decorationColors, [d.id]: hex } }))}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="studio-group studio-ai">
        <legend>
          On the cake <span className="studio-ai__badge">AI</span>
        </legend>
        <p className="studio-group__help">
          Describe a message or a picture and our AI designer will draw it on the front of the cake.
        </p>
        <textarea
          value={cakeArt.prompt}
          maxLength={200}
          rows={2}
          placeholder="Happy 30th Anna, with little gold stars"
          aria-label="What would you like on the cake?"
          onChange={(e) => cakeArt.setPrompt(e.target.value)}
        />
        <div className="studio-ai__actions">
          <button
            type="button"
            className="btn btn-dark"
            disabled={!cakeArt.prompt.trim() || cakeArt.generating}
            onClick={cakeArt.generate}
          >
            {cakeArt.generating ? 'Drawing…' : cakeArt.art ? 'Draw again' : 'Draw it on my cake'}
          </button>
          {cakeArt.art && !cakeArt.generating && (
            <button type="button" className="studio-link" onClick={cakeArt.remove}>
              Remove
            </button>
          )}
        </div>
        <p className={`studio-ai__message${cakeArt.message?.tone === 'error' ? ' is-error' : ''}`} role="status">
          {cakeArt.generating ? 'Sketching your design. This can take a little while.' : cakeArt.message?.text}
        </p>
      </fieldset>
    </div>
  )
}
