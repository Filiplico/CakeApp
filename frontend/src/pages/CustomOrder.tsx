import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import CakeCanvas from '../components/CakeCanvas'
import type { CakeScene, SceneMode } from '../cake/CakeScene'
import {
  ACCENT_COLORS,
  DECORATIONS,
  DEFAULT_CONFIG,
  FILLINGS,
  FROSTING_COLORS,
  MAX_TIERS,
  RAINBOW,
  SPONGES,
  TOPPINGS,
  activeToppingTiers,
  tierName,
  type CakeConfig,
  type ToppingId,
} from '../cake/options'
import { letteringCanvas, sanitizeSvg, svgToCanvas } from '../cake/textures'
import { ApiError, createOrder, generateCakeArt } from '../api'
import '../styles/custom-order.css'

type Step = 'design' | 'flavour' | 'details' | 'boxing' | 'done'

/** What the customer asked for on the cake, and how it was drawn. */
interface CakeArt {
  prompt: string
  source: 'ai' | 'lettering'
  svg?: string
}

const STEPS: { id: Step; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'flavour', label: 'Flavour' },
  { id: 'details', label: 'Details' },
]

const EMPTY_FORM = {
  customerName: '',
  phone: '',
  email: '',
  pickupOrDelivery: 'PICKUP' as 'PICKUP' | 'DELIVERY',
  address: '',
  dateNeeded: '',
  notes: '',
}

function tomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

interface OptionRowProps {
  label: string
  active: boolean
  color: string
  /** Offers the multicolour mix as an extra choice (sprinkles). */
  rainbow?: boolean
  /** Tier choices for this option, top tier first. Left out when there is nothing to choose. */
  tiers?: { label: string; selected: boolean; onToggle: () => void }[]
  onToggle: () => void
  onColor: (color: string) => void
}

/** One topping or decoration: a toggle, plus its colour choices once it is switched on. */
function OptionRow({ label, active, color, rainbow, tiers, onToggle, onColor }: OptionRowProps) {
  return (
    <div className="studio-option">
      <button type="button" className="studio-option__toggle" aria-pressed={active} onClick={onToggle}>
        {label}
      </button>
      {active && (
        <div className="studio-colors__swatches">
          {rainbow && (
            <button
              type="button"
              className="studio-swatch studio-swatch--rainbow"
              title="Rainbow"
              aria-label={`${label}: rainbow`}
              aria-pressed={color === RAINBOW}
              onClick={() => onColor(RAINBOW)}
            />
          )}
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              className="studio-swatch"
              style={{ background: c.hex }}
              title={c.name}
              aria-label={`${label}: ${c.name}`}
              aria-pressed={color === c.hex}
              onClick={() => onColor(c.hex)}
            />
          ))}
          <label className="studio-swatch studio-swatch--custom" title="Custom colour">
            <input
              type="color"
              value={color === RAINBOW ? '#ffffff' : color}
              aria-label={`${label}: custom colour`}
              onChange={(e) => onColor(e.target.value)}
            />
          </label>
        </div>
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

export default function CustomOrder() {
  const sceneRef = useRef<CakeScene | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<Step>('design')
  const [config, setConfig] = useState<CakeConfig>(DEFAULT_CONFIG)

  const [prompt, setPrompt] = useState('')
  const [art, setArt] = useState<CakeArt | null>(null)
  const [artCanvas, setArtCanvas] = useState<HTMLCanvasElement | null>(null)
  const [generating, setGenerating] = useState(false)
  const [artMessage, setArtMessage] = useState<{ tone: 'note' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)

  const baseColor = config.tierColors[0]
  // Lettering is tinted to contrast with the frosting, so it follows the base colour.
  const letteringColor = art?.source === 'lettering' ? baseColor : null

  useEffect(() => {
    if (!art) return
    let cancelled = false
    const drawing =
      art.source === 'ai' && art.svg ? svgToCanvas(art.svg) : letteringCanvas(art.prompt, letteringColor ?? '#ffffff')
    drawing
      .then((canvas) => {
        if (!cancelled) setArtCanvas(canvas)
      })
      .catch(() => {
        if (cancelled) return
        setArt({ prompt: art.prompt, source: 'lettering' })
        setArtMessage({ tone: 'note', text: 'That design could not be drawn, so we piped your words in icing instead.' })
      })
    return () => {
      cancelled = true
    }
  }, [art, letteringColor])

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
  }, [step])

  const sceneMode: SceneMode = step === 'flavour' ? 'flavour' : step === 'boxing' || step === 'done' ? 'boxed' : 'design'
  const tierIndexes = Array.from({ length: config.tiers }, (_, i) => config.tiers - 1 - i)

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

  async function handleGenerate() {
    const text = prompt.trim()
    if (!text || generating) return
    setGenerating(true)
    setArtMessage(null)
    try {
      const svg = sanitizeSvg(await generateCakeArt(text, baseColor))
      if (!svg) throw new ApiError(502, 'The design came back unreadable.')
      setArt({ prompt: text, source: 'ai', svg })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setArtMessage({ tone: 'error', text: error.message })
      } else {
        setArt({ prompt: text, source: 'lettering' })
        setArtMessage({
          tone: 'note',
          text: 'Our AI designer is not available right now, so we piped your words in icing instead. You can try again later.',
        })
      }
    } finally {
      setGenerating(false)
    }
  }

  function removeArt() {
    setArt(null)
    setArtMessage(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const order = await createOrder({
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        pickupOrDelivery: form.pickupOrDelivery,
        address: form.pickupOrDelivery === 'DELIVERY' ? form.address.trim() : null,
        dateNeeded: form.dateNeeded,
        notes: form.notes.trim() || null,
        customizationJson: JSON.stringify({
          tiers: config.tiers,
          tierColors: config.tierColors.slice(0, config.tiers),
          toppings: config.toppings.map((id) => ({
            id,
            color: config.toppingColors[id],
            tiers: activeToppingTiers(config, id).map((fromTop) => tierName(config.tiers - 1 - fromTop, config.tiers)),
          })),
          decorations: config.decorations.map((id) => ({ id, color: config.decorationColors[id] })),
          sponge: config.sponge,
          filling: config.filling,
          art,
        }),
      })
      setOrderId(order.id)
      setStep('boxing')
      await sceneRef.current?.playBoxing()
      setStep('done')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function startOver() {
    setConfig(DEFAULT_CONFIG)
    setArt(null)
    setPrompt('')
    setArtMessage(null)
    setForm(EMPTY_FORM)
    setOrderId(null)
    setStep('design')
  }

  const sponge = SPONGES.find((s) => s.id === config.sponge)!
  const filling = FILLINGS.find((f) => f.id === config.filling)!
  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <main className="studio">
      <section className="studio__stage" aria-label="Cake preview">
        <CakeCanvas config={config} art={art ? artCanvas : null} mode={sceneMode} sceneRef={sceneRef} />
        <p className="studio__hint">
          {step === 'flavour'
            ? 'A look inside your cake'
            : step === 'boxing'
              ? 'Boxing it up…'
              : step === 'done'
                ? 'Boxed and ready'
                : 'Drag to turn the cake'}
        </p>
      </section>

      <section className="studio__panel" ref={panelRef}>
        {step !== 'boxing' && step !== 'done' && (
          <ol className="studio-steps">
            {STEPS.map((s, i) => (
              <li key={s.id} className={i === stepIndex ? 'is-current' : i < stepIndex ? 'is-done' : undefined}>
                <button type="button" disabled={i >= stepIndex} onClick={() => setStep(s.id)}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
        )}

        {step === 'design' && (
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
              {tierIndexes.map((index) => (
                <div className="studio-colors" key={index}>
                  <span className="studio-colors__label">{tierName(index, config.tiers)}</span>
                  <div className="studio-colors__swatches">
                    {FROSTING_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        className="studio-swatch"
                        style={{ background: color.hex }}
                        title={color.name}
                        aria-label={`${tierName(index, config.tiers)}: ${color.name}`}
                        aria-pressed={config.tierColors[index] === color.hex}
                        onClick={() => setTierColor(index, color.hex)}
                      />
                    ))}
                    <label className="studio-swatch studio-swatch--custom" title="Custom colour">
                      <input
                        type="color"
                        value={config.tierColors[index]}
                        aria-label={`${tierName(index, config.tiers)}: custom colour`}
                        onChange={(e) => setTierColor(index, e.target.value)}
                      />
                    </label>
                  </div>
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
                    onToggle={() => setConfig((c) => ({ ...c, toppings: toggle(c.toppings, t.id) }))}
                    onColor={(hex) => setConfig((c) => ({ ...c, toppingColors: { ...c.toppingColors, [t.id]: hex } }))}
                    tiers={
                      config.tiers > 1
                        ? Array.from({ length: config.tiers }, (_, fromTop) => ({
                            label: tierName(config.tiers - 1 - fromTop, config.tiers),
                            selected: activeToppingTiers(config, t.id).includes(fromTop),
                            onToggle: () => toggleToppingTier(t.id, fromTop),
                          }))
                        : undefined
                    }
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
                    rainbow={d.id === 'sprinkles'}
                    onToggle={() => setConfig((c) => ({ ...c, decorations: toggle(c.decorations, d.id) }))}
                    onColor={(hex) =>
                      setConfig((c) => ({ ...c, decorationColors: { ...c.decorationColors, [d.id]: hex } }))
                    }
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
                value={prompt}
                maxLength={200}
                rows={2}
                placeholder="Happy 30th Anna, with little gold stars"
                aria-label="What would you like on the cake?"
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="studio-ai__actions">
                <button
                  type="button"
                  className="btn btn-dark"
                  disabled={!prompt.trim() || generating}
                  onClick={handleGenerate}
                >
                  {generating ? 'Drawing…' : art ? 'Draw again' : 'Draw it on my cake'}
                </button>
                {art && !generating && (
                  <button type="button" className="studio-link" onClick={removeArt}>
                    Remove
                  </button>
                )}
              </div>
              <p className={`studio-ai__message${artMessage?.tone === 'error' ? ' is-error' : ''}`} role="status">
                {generating ? 'Sketching your design. This can take a little while.' : artMessage?.text}
              </p>
            </fieldset>
          </div>
        )}

        {step === 'flavour' && (
          <div className="studio-body">
            <header className="studio-heading">
              <h1>
                Choose the <em>flavour</em>
              </h1>
              <p>We have cut your cake open so you can see the layers.</p>
            </header>

            <fieldset className="studio-group">
              <legend>Sponge</legend>
              <div className="studio-flavours">
                {SPONGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={config.sponge === s.id}
                    onClick={() => setConfig((c) => ({ ...c, sponge: s.id }))}
                  >
                    <span className="studio-flavours__dot" style={{ background: s.color }} />
                    <span>
                      <strong>{s.label}</strong>
                      <small>{s.note}</small>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="studio-group">
              <legend>Filling</legend>
              <div className="studio-flavours studio-flavours--compact">
                {FILLINGS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={config.filling === f.id}
                    onClick={() => setConfig((c) => ({ ...c, filling: f.id }))}
                  >
                    <span className="studio-flavours__dot" style={{ background: f.color }} />
                    <span>
                      <strong>{f.label}</strong>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 'details' && (
          <form className="studio-body" id="order-form" onSubmit={handleSubmit}>
            <header className="studio-heading">
              <h1>
                Your <em>details</em>
              </h1>
              <p>Tell us when you need it and how to reach you.</p>
            </header>

            <dl className="studio-summary">
              <div>
                <dt>Cake</dt>
                <dd>
                  {config.tiers} {config.tiers === 1 ? 'tier' : 'tiers'}, {sponge.label.toLowerCase()} sponge with{' '}
                  {filling.label.toLowerCase()}
                </dd>
              </div>
              {(config.toppings.length > 0 || config.decorations.length > 0) && (
                <div>
                  <dt>Finish</dt>
                  <dd>
                    {[
                      ...TOPPINGS.filter((t) => config.toppings.includes(t.id)),
                      ...DECORATIONS.filter((d) => config.decorations.includes(d.id)),
                    ]
                      .map((o) => o.label.toLowerCase())
                      .join(', ')}
                  </dd>
                </div>
              )}
              {art && (
                <div>
                  <dt>On the cake</dt>
                  <dd>“{art.prompt}”</dd>
                </div>
              )}
            </dl>

            <div className="studio-fields">
              <label>
                Name
                <input
                  required
                  autoComplete="name"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label>
                Email <small>optional</small>
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label>
                Date needed
                <input
                  required
                  type="date"
                  min={tomorrow()}
                  value={form.dateNeeded}
                  onChange={(e) => setForm({ ...form, dateNeeded: e.target.value })}
                />
              </label>
              <div className="studio-fields__wide">
                <span className="studio-fields__label">Collection</span>
                <div className="studio-segments studio-segments--wide">
                  {(['PICKUP', 'DELIVERY'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={form.pickupOrDelivery === option}
                      onClick={() => setForm({ ...form, pickupOrDelivery: option })}
                    >
                      {option === 'PICKUP' ? 'Pick up' : 'Delivery'}
                    </button>
                  ))}
                </div>
              </div>
              {form.pickupOrDelivery === 'DELIVERY' && (
                <label className="studio-fields__wide">
                  Delivery address
                  <input
                    required
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </label>
              )}
              <label className="studio-fields__wide">
                Notes <small>optional</small>
                <textarea
                  rows={3}
                  placeholder="Allergies, the occasion, anything else we should know"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
            </div>
            {submitError && (
              <p className="studio-error" role="alert">
                {submitError}
              </p>
            )}
          </form>
        )}

        {(step === 'boxing' || step === 'done') && (
          <div className="studio-body studio-done" aria-live="polite">
            {step === 'boxing' ? (
              <header className="studio-heading">
                <h1>
                  Boxing up your <em>cake</em>
                </h1>
                <p>One moment while we tie the ribbon.</p>
              </header>
            ) : (
              <>
                <span className="section-eyebrow">Order {orderId !== null ? `No. ${orderId}` : 'received'}</span>
                <header className="studio-heading">
                  <h1>
                    Boxed and <em>ready</em>
                  </h1>
                  <p>
                    Thank you, {form.customerName.trim().split(' ')[0]}. We have your order for{' '}
                    {new Date(`${form.dateNeeded}T00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })} and
                    will call you on {form.phone} to confirm the details.
                  </p>
                </header>
                <div className="studio-done__actions">
                  <button type="button" className="btn btn-dark" onClick={startOver}>
                    Design another cake
                  </button>
                  <Link to="/cakes" className="studio-link">
                    Browse our cakes
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {step !== 'boxing' && step !== 'done' && (
          <footer className="studio-nav">
            {step !== 'design' && (
              <button
                type="button"
                className="studio-link"
                onClick={() => setStep(step === 'details' ? 'flavour' : 'design')}
              >
                Back
              </button>
            )}
            {step === 'details' ? (
              <button type="submit" form="order-form" className="btn btn-dark" disabled={submitting}>
                {submitting ? 'Placing order…' : 'Place order'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setStep(step === 'design' ? 'flavour' : 'details')}
              >
                {step === 'design' ? 'Next: flavour' : 'Next: your details'}
              </button>
            )}
          </footer>
        )}
      </section>
    </main>
  )
}
