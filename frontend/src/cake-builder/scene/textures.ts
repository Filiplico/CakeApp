import * as THREE from 'three'

/** Small deterministic RNG so the cake looks the same on every rebuild. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvasTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/**
 * The inside of one tier as seen on the cut face: a frosting coat around
 * three sponge layers with two bands of filling between them.
 */
export function crossSectionTexture(
  frosting: string,
  sponge: string,
  filling: string,
  radius: number,
  height: number,
  cornerRadius: number,
  seed: number,
): THREE.CanvasTexture {
  const scale = 256 // px per world unit
  const w = Math.round(radius * 2 * scale)
  const h = Math.round(height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const rand = seededRandom(seed)

  // Outer silhouette matches the rounded top edge of the tier.
  const corner = cornerRadius * scale
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(0, corner)
  ctx.quadraticCurveTo(0, 0, corner, 0)
  ctx.lineTo(w - corner, 0)
  ctx.quadraticCurveTo(w, 0, w, corner)
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.clip()

  ctx.fillStyle = frosting
  ctx.fillRect(0, 0, w, h)

  const coat = 0.045 * scale
  const innerX = coat
  const innerY = coat
  const innerW = w - coat * 2
  const innerH = h - coat
  const fillH = innerH * 0.085
  const spongeH = (innerH - fillH * 2) / 3

  let y = innerY
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = sponge
    ctx.fillRect(innerX, y, innerW, spongeH + 1)

    // Crumb: lighter and darker flecks.
    const flecks = Math.round((innerW * spongeH) / 55)
    for (let i = 0; i < flecks; i++) {
      const fx = innerX + rand() * innerW
      const fy = y + rand() * spongeH
      const size = 0.6 + rand() * 1.8
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)'
      ctx.beginPath()
      ctx.ellipse(fx, fy, size * 1.4, size, rand() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    // Slightly darker baked edge at the bottom of each sponge.
    const baked = ctx.createLinearGradient(0, y, 0, y + spongeH)
    baked.addColorStop(0, 'rgba(0,0,0,0)')
    baked.addColorStop(1, 'rgba(0,0,0,0.12)')
    ctx.fillStyle = baked
    ctx.fillRect(innerX, y, innerW, spongeH)
    y += spongeH

    if (layer < 2) {
      ctx.fillStyle = filling
      ctx.beginPath()
      ctx.moveTo(innerX, y)
      const steps = 24
      for (let i = 0; i <= steps; i++) {
        ctx.lineTo(innerX + (innerW * i) / steps, y + (rand() - 0.5) * 3)
      }
      for (let i = steps; i >= 0; i--) {
        ctx.lineTo(innerX + (innerW * i) / steps, y + fillH + (rand() - 0.5) * 3)
      }
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.fillRect(innerX, y + fillH * 0.2, innerW, fillH * 0.18)
      y += fillH
    }
  }

  return canvasTexture(canvas)
}

/** Soft pool of light under the cake stand. */
export function glowTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(201,168,124,0.34)')
  g.addColorStop(0.45, 'rgba(201,168,124,0.1)')
  g.addColorStop(1, 'rgba(201,168,124,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return canvasTexture(canvas)
}

export const ART_WIDTH = 1024
export const ART_HEIGHT = 512

function isDark(hex: string): boolean {
  const c = new THREE.Color(hex)
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 < 0.5
}

/** Draws the customer's words as piped lettering. Used when the AI is unavailable. */
export async function letteringCanvas(text: string, frosting: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = ART_WIDTH
  canvas.height = ART_HEIGHT
  const ctx = canvas.getContext('2d')!
  const family = '"Cormorant Garamond", Georgia, serif'
  try {
    await document.fonts.load(`italic 500 120px ${family}`)
  } catch {
    // The fallback serif is fine.
  }

  const words = text.trim().split(/\s+/)
  const maxWidth = ART_WIDTH - 80
  let fontSize = 190
  let lines: string[] = []
  for (; fontSize >= 44; fontSize -= 8) {
    ctx.font = `italic 500 ${fontSize}px ${family}`
    lines = []
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    lines.push(line)
    const fitsWidth = lines.every((l) => ctx.measureText(l).width <= maxWidth)
    if (fitsWidth && lines.length * fontSize * 1.05 <= ART_HEIGHT - 60) break
  }

  const dark = isDark(frosting)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  const lineHeight = fontSize * 1.05
  const top = ART_HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((l, i) => {
    const y = top + i * lineHeight
    ctx.strokeStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.55)'
    ctx.lineWidth = fontSize * 0.07
    ctx.strokeText(l, ART_WIDTH / 2, y + 3)
    ctx.fillStyle = dark ? '#f3dcb4' : '#6b3f2a'
    ctx.fillText(l, ART_WIDTH / 2, y)
  })
  return canvas
}

/**
 * Strips anything active from model-written SVG. It is only ever drawn through
 * an <img>, which already blocks scripts, so this is a second layer.
 */
export function sanitizeSvg(source: string): string | null {
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
  const root = doc.documentElement
  if (!root || root.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) return null

  doc.querySelectorAll('script, foreignObject, image, iframe, a, style, animate, set').forEach((el) => el.remove())
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim()
      const isLink = name === 'href' || name === 'xlink:href'
      if (name.startsWith('on') || (isLink && !value.startsWith('#')) || /url\(\s*['"]?(?!#)/i.test(value)) {
        el.removeAttribute(attr.name)
      }
    }
  })

  if (!root.getAttribute('viewBox')) root.setAttribute('viewBox', '0 0 800 400')
  root.setAttribute('width', String(ART_WIDTH))
  root.setAttribute('height', String(ART_HEIGHT))
  root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  return new XMLSerializer().serializeToString(root)
}

/** Rasterises sanitised SVG so it can be used as a texture. */
export function svgToCanvas(svg: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = ART_WIDTH
      canvas.height = ART_HEIGHT
      canvas.getContext('2d')!.drawImage(img, 0, 0, ART_WIDTH, ART_HEIGHT)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('The generated design could not be drawn.'))
    }
    img.src = url
  })
}
