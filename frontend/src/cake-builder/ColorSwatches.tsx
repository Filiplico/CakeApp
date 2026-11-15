import { RAINBOW, type NamedColor } from './options'

interface Props {
  /** Names the thing being coloured, for screen readers ("Top tier", "Ribbon"). */
  label: string
  colors: NamedColor[]
  value: string
  onChange: (color: string) => void
  /** Offers the multicolour mix as an extra first choice. */
  withRainbow?: boolean
}

/** A row of preset colours plus a custom colour picker. */
export default function ColorSwatches({ label, colors, value, onChange, withRainbow }: Props) {
  return (
    <div className="studio-colors__swatches">
      {withRainbow && (
        <button
          type="button"
          className="studio-swatch studio-swatch--rainbow"
          title="Rainbow"
          aria-label={`${label}: rainbow`}
          aria-pressed={value === RAINBOW}
          onClick={() => onChange(RAINBOW)}
        />
      )}
      {colors.map((color) => (
        <button
          key={color.hex}
          type="button"
          className="studio-swatch"
          style={{ background: color.hex }}
          title={color.name}
          aria-label={`${label}: ${color.name}`}
          aria-pressed={value === color.hex}
          onClick={() => onChange(color.hex)}
        />
      ))}
      <label className="studio-swatch studio-swatch--custom" title="Custom colour">
        <input
          type="color"
          value={value === RAINBOW ? '#ffffff' : value}
          aria-label={`${label}: custom colour`}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}
