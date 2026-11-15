import { useRef, useEffect } from 'react'

/**
 * Plays the logo animation on a canvas, turning the video's black background transparent
 * so the logo sits directly on the page.
 */
export default function LogoVideo({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let rafId: number

    const syncSize = () => {
      if (video.videoWidth) {
        canvas.width  = video.videoWidth
        canvas.height = video.videoHeight
      }
    }

    // Uses each pixel's brightness as its opacity, so black becomes fully transparent.
    const removeBlack = () => {
      const { width: w, height: h } = canvas
      const frame = ctx.getImageData(0, 0, w, h)
      const px    = frame.data
      for (let i = 0; i < px.length; i += 4) {
        px[i + 3] = Math.round((px[i] + px[i + 1] + px[i + 2]) / 3)
      }
      ctx.putImageData(frame, 0, 0)
    }

    const drawFrame = () => {
      syncSize()
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      removeBlack()
    }

    const paint = () => {
      drawFrame()
      if (!video.paused && !video.ended) rafId = requestAnimationFrame(paint)
    }

    const onPlay = () => {
      rafId = requestAnimationFrame(paint)
    }

    video.addEventListener('loadedmetadata', syncSize)
    video.addEventListener('play', onPlay)
    video.addEventListener('ended', drawFrame)

    if (!video.paused) onPlay()
    else video.play().catch(() => {})

    return () => {
      cancelAnimationFrame(rafId)
      video.removeEventListener('loadedmetadata', syncSize)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('ended', drawFrame)
    }
  }, [])

  return (
    <>
      <video
        ref={videoRef}
        src="/ReneCakesLogoVideo.MP4"
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <canvas ref={canvasRef} className={className} />
    </>
  )
}
