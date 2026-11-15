import { useEffect, useState } from 'react'

type ApiState<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: T }

/**
 * Loads data from the API and re-loads whenever `key` changes (for example a route id).
 * Results from an earlier key are ignored, so a slow response can never overwrite a newer one.
 */
export function useApi<T>(load: () => Promise<T>, key: string = ''): ApiState<T> {
  const [result, setResult] = useState<{ key: string; state: ApiState<T> } | null>(null)

  useEffect(() => {
    let cancelled = false
    load().then(
      (data) => !cancelled && setResult({ key, state: { status: 'ready', data } }),
      (error: Error) => !cancelled && setResult({ key, state: { status: 'error', message: error.message } }),
    )
    return () => {
      cancelled = true
    }
    // `load` is usually an inline function; `key` is what decides when to load again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return result?.key === key ? result.state : { status: 'loading' }
}
