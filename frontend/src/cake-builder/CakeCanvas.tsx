import { useEffect, useRef, useState, type RefObject } from 'react'
import { CakeScene, type SceneMode } from './scene/CakeScene'
import type { CakeConfig } from './options'

interface Props {
  config: CakeConfig
  art: HTMLCanvasElement | null
  mode: SceneMode
  /** Gives the page access to the scene for one-off animations such as boxing. */
  sceneRef: RefObject<CakeScene | null>
}

export default function CakeCanvas({ config, art, mode, sceneRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [failed] = useState(() => !document.createElement('canvas').getContext('webgl2'))

  useEffect(() => {
    if (failed) return
    const scene = new CakeScene(hostRef.current!)
    sceneRef.current = scene
    return () => {
      sceneRef.current = null
      scene.dispose()
    }
  }, [sceneRef, failed])

  // Declared after the mount effect so the scene exists on the first run.
  useEffect(() => {
    sceneRef.current?.setConfig(config)
  }, [config, sceneRef])

  useEffect(() => {
    sceneRef.current?.setArt(art)
  }, [art, sceneRef])

  useEffect(() => {
    sceneRef.current?.setMode(mode)
  }, [mode, sceneRef])

  return (
    <div ref={hostRef} className="studio-canvas" role="img" aria-label="Live 3D preview of your cake">
      {failed && (
        <p className="studio-canvas__fallback">
          The 3D preview needs WebGL, which this browser has switched off. You can still build and order your cake.
        </p>
      )}
    </div>
  )
}
