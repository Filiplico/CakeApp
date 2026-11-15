import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError, createOrder } from '../api'
import CakeCanvas from '../cake-builder/CakeCanvas'
import { DEFAULT_CONFIG, type CakeConfig } from '../cake-builder/options'
import { EMPTY_FORM, ORDER_FORM_ID, buildOrderPayload, type OrderForm } from '../cake-builder/order'
import type { CakeScene, SceneMode } from '../cake-builder/scene/CakeScene'
import DesignStep from '../cake-builder/steps/DesignStep'
import DetailsStep from '../cake-builder/steps/DetailsStep'
import FlavourStep from '../cake-builder/steps/FlavourStep'
import OrderComplete from '../cake-builder/steps/OrderComplete'
import { useCakeArt } from '../cake-builder/useCakeArt'
import '../cake-builder/cake-builder.css'

type Step = 'design' | 'flavour' | 'details' | 'boxing' | 'done'

const STEPS: { id: Step; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'flavour', label: 'Flavour' },
  { id: 'details', label: 'Details' },
]

const SCENE_MODE: Record<Step, SceneMode> = {
  design: 'design',
  flavour: 'flavour',
  details: 'design',
  boxing: 'boxed',
  done: 'boxed',
}

const HINT: Record<Step, string> = {
  design: 'Drag to turn the cake',
  flavour: 'A look inside your cake',
  details: 'Drag to turn the cake',
  boxing: 'Boxing it up…',
  done: 'Boxed and ready',
}

/**
 * The custom order page: a live 3D cake on the left and a three-step builder on the right
 * (design, flavour, details), ending with the cake being boxed up.
 */
export default function CustomOrder() {
  const sceneRef = useRef<CakeScene | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const [step, setStep] = useState<Step>('design')
  const [config, setConfig] = useState<CakeConfig>(DEFAULT_CONFIG)
  const cakeArt = useCakeArt(config.tierColors[0])

  const [form, setForm] = useState<OrderForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
  }, [step])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const order = await createOrder(buildOrderPayload(form, config, cakeArt.art))
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
    cakeArt.reset()
    setForm(EMPTY_FORM)
    setOrderId(null)
    setStep('design')
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const finished = step === 'boxing' || step === 'done'

  return (
    <main className="studio">
      <section className="studio__stage" aria-label="Cake preview">
        <CakeCanvas config={config} art={cakeArt.canvas} mode={SCENE_MODE[step]} sceneRef={sceneRef} />
        <p className="studio__hint">{HINT[step]}</p>
      </section>

      <section className="studio__panel" ref={panelRef}>
        {!finished && (
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

        {step === 'design' && <DesignStep config={config} setConfig={setConfig} cakeArt={cakeArt} />}
        {step === 'flavour' && <FlavourStep config={config} setConfig={setConfig} />}
        {step === 'details' && (
          <DetailsStep
            config={config}
            art={cakeArt.art}
            form={form}
            setForm={setForm}
            error={submitError}
            onSubmit={handleSubmit}
          />
        )}
        {finished && <OrderComplete boxing={step === 'boxing'} orderId={orderId} form={form} onStartOver={startOver} />}

        {!finished && (
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
              <button type="submit" form={ORDER_FORM_ID} className="btn btn-dark" disabled={submitting}>
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
