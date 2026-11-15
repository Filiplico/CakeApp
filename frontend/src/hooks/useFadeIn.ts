import { useCallback } from 'react'

/**
 * Fades an element in the first time it scrolls into view, by adding the `visible` class.
 * Returns a callback ref, so it also works for elements that appear after the first render.
 */
export function useFadeIn() {
  return useCallback((element: HTMLElement | null) => {
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
}
