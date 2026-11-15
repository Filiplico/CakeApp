import { useEffect, useState } from 'react'
import { ApiError, generateCakeArt } from '../api'
import { letteringCanvas, sanitizeSvg, svgToCanvas } from './scene/textures'

/** What the customer asked for on the cake, and how it was drawn. */
export interface CakeArt {
  prompt: string
  source: 'ai' | 'lettering'
  svg?: string
}

export interface CakeArtMessage {
  tone: 'note' | 'error'
  text: string
}

const UNAVAILABLE =
  'Our AI designer is not available right now, so we piped your words in icing instead. You can try again later.'
const UNDRAWABLE = 'That design could not be drawn, so we piped your words in icing instead.'

/**
 * State for the "On the cake" field: the customer's text, the design the AI drew for it,
 * and that design rendered to a canvas for the 3D scene. Falls back to icing lettering
 * whenever the AI cannot help.
 */
export function useCakeArt(frostingColor: string) {
  const [prompt, setPrompt] = useState('')
  const [art, setArt] = useState<CakeArt | null>(null)
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<CakeArtMessage | null>(null)

  // Lettering is tinted to contrast with the frosting, so it is redrawn when the frosting changes.
  const letteringColor = art?.source === 'lettering' ? frostingColor : null

  useEffect(() => {
    if (!art) return
    let cancelled = false
    const drawing =
      art.source === 'ai' && art.svg ? svgToCanvas(art.svg) : letteringCanvas(art.prompt, letteringColor ?? '#ffffff')
    drawing
      .then((result) => {
        if (!cancelled) setCanvas(result)
      })
      .catch(() => {
        if (cancelled) return
        setArt({ prompt: art.prompt, source: 'lettering' })
        setMessage({ tone: 'note', text: UNDRAWABLE })
      })
    return () => {
      cancelled = true
    }
  }, [art, letteringColor])

  async function generate() {
    const text = prompt.trim()
    if (!text || generating) return
    setGenerating(true)
    setMessage(null)
    try {
      const svg = sanitizeSvg(await generateCakeArt(text, frostingColor))
      if (!svg) throw new ApiError(502, 'The design came back unreadable.')
      setArt({ prompt: text, source: 'ai', svg })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        setMessage({ tone: 'error', text: error.message })
      } else {
        setArt({ prompt: text, source: 'lettering' })
        setMessage({ tone: 'note', text: UNAVAILABLE })
      }
    } finally {
      setGenerating(false)
    }
  }

  function remove() {
    setArt(null)
    setMessage(null)
  }

  function reset() {
    remove()
    setPrompt('')
  }

  return {
    prompt,
    setPrompt,
    art,
    /** The drawing to show on the cake, or null when there is none. */
    canvas: art ? canvas : null,
    generating,
    message,
    generate,
    remove,
    reset,
  }
}

export type CakeArtState = ReturnType<typeof useCakeArt>
