import type { Dispatch, SetStateAction } from 'react'
import { FILLINGS, SPONGES, type CakeConfig } from '../options'

interface Props {
  config: CakeConfig
  setConfig: Dispatch<SetStateAction<CakeConfig>>
}

export default function FlavourStep({ config, setConfig }: Props) {
  return (
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
  )
}
