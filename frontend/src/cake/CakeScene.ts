import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { FILLINGS, RAINBOW, SPONGES, activeToppingTiers, type CakeConfig, type ToppingId } from './options'
import { crossSectionTexture, glowTexture, seededRandom } from './textures'

export type SceneMode = 'design' | 'flavour' | 'boxed'

interface Tier {
  radius: number
  y: number
  height: number
  color: string
}

interface Rig {
  azimuth: number
  elevation: number
  distance: number
  x: number
  y: number
}

const FOV = 32
const BEVEL = 0.05
const PLATE_MARGIN = 0.32
const ART_HEIGHT_RATIO = 0.64
const GOLD = '#c9a87c'
const SPRINKLE_COLORS = ['#f28fa5', '#f7d36b', '#8fc7e8', '#a5d6a0', '#ffffff', '#c9a1e6']

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const segment = (t: number, start: number, duration: number) => clamp01((t - start) / duration)
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)
const easeOutBack = (p: number) => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2)
function easeOutBounce(p: number): number {
  const n = 7.5625
  const d = 2.75
  if (p < 1 / d) return n * p * p
  if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75
  if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375
  return n * (p -= 2.625 / d) * p + 0.984375
}

/**
 * The 3D cake preview. Plain three.js driven imperatively: React hands it a
 * config and a mode, and it rebuilds the cake and animates between states.
 *
 * The cake is always modelled as a front and a back half so the flavour step
 * can pull the halves apart and show the layers inside.
 */
export class CakeScene {
  private readonly container: HTMLElement
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
  private readonly timer = new THREE.Clock()
  private readonly resizeObserver: ResizeObserver
  private readonly environment: THREE.Texture

  private readonly cakeGroup = new THREE.Group()
  private readonly backHalf = new THREE.Group()
  private readonly frontHalf = new THREE.Group()
  private readonly sidePlate = new THREE.Group()
  private readonly glow: THREE.Mesh
  private boxGroup: THREE.Group | null = null

  private config: CakeConfig | null = null
  private artTexture: THREE.CanvasTexture | null = null
  private tiers: Tier[] = []
  private flames: THREE.Mesh[] = []
  private mode: SceneMode = 'design'
  private cut = 0
  private pop = 0
  private frame = 0
  private elapsed = 0
  private disposed = false

  private boxing: { time: number; resolve: () => void; parts: BoxParts } | null = null

  private rig: Rig = { azimuth: 0.3, elevation: 0.32, distance: 9, x: 0, y: 0.8 }
  private goal: Rig = { ...this.rig }
  private drag: { id: number; x: number; y: number; touch: boolean } | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    this.scene.environment = this.environment
    this.scene.environmentIntensity = 0.4

    this.scene.add(new THREE.HemisphereLight('#ffffff', '#8c7a66', 0.55))
    const key = new THREE.DirectionalLight('#fff3e2', 1.45)
    key.position.set(3.5, 7, 5)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left = -6
    key.shadow.camera.right = 6
    key.shadow.camera.top = 7
    key.shadow.camera.bottom = -3
    key.shadow.camera.near = 1
    key.shadow.camera.far = 24
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.02
    this.scene.add(key)
    const fill = new THREE.DirectionalLight('#dfe6ff', 0.35)
    fill.position.set(-5, 3, -3)
    this.scene.add(fill)

    this.glow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: glowTexture(), transparent: true, depthWrite: false }),
    )
    this.glow.rotation.x = -Math.PI / 2
    this.glow.position.y = -0.11
    this.scene.add(this.glow)

    this.cakeGroup.add(this.backHalf, this.frontHalf)
    this.scene.add(this.cakeGroup, this.sidePlate)

    const canvas = this.renderer.domElement
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerUp)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()
    this.frame = requestAnimationFrame(this.tick)
  }

  // ------------------------------------------------------------------ API

  setConfig(config: CakeConfig): void {
    const tiersChanged = this.config?.tiers !== config.tiers
    this.config = config
    this.build()
    if (tiersChanged) this.pop = 1
    this.updateGoal()
  }

  /** The AI design (or lettering), already drawn to a canvas. Null removes it. */
  setArt(canvas: HTMLCanvasElement | null): void {
    this.artTexture?.dispose()
    this.artTexture = null
    if (canvas) {
      this.artTexture = new THREE.CanvasTexture(canvas)
      this.artTexture.colorSpace = THREE.SRGBColorSpace
      this.artTexture.anisotropy = 8
      // Turn the front of the cake to the viewer so the new design is in view.
      this.goal.azimuth = Math.round(this.rig.azimuth / (Math.PI * 2)) * Math.PI * 2
    }
    if (this.config) this.build()
  }

  setMode(mode: SceneMode): void {
    if (mode === this.mode) return
    this.mode = mode
    if (mode !== 'boxed') this.removeBox()
    this.updateGoal()
  }

  /** Closes the cake, builds a box around it, and resolves once it is tied up. */
  playBoxing(): Promise<void> {
    this.removeBox()
    this.mode = 'boxed'
    this.updateGoal()
    const parts = this.buildBox()
    return new Promise((resolve) => {
      this.boxing = { time: 0, resolve, parts }
    })
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.frame)
    this.resizeObserver.disconnect()
    this.boxing?.resolve()
    this.boxing = null
    this.removeBox()
    this.clearGroup(this.backHalf)
    this.clearGroup(this.frontHalf)
    this.clearGroup(this.sidePlate)
    this.artTexture?.dispose()
    this.environment.dispose()
    const glowMaterial = this.glow.material as THREE.MeshBasicMaterial
    glowMaterial.map?.dispose()
    glowMaterial.dispose()
    this.glow.geometry.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  // ------------------------------------------------------------- building

  private get baseRadius(): number {
    return this.tiers[0]?.radius ?? 1.2
  }

  private get cakeHeight(): number {
    const top = this.tiers[this.tiers.length - 1]
    return top ? top.y + top.height : 1
  }

  private clearGroup(group: THREE.Group): void {
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry.dispose()
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        const map = (material as THREE.MeshStandardMaterial).map
        if (map && map !== this.artTexture) map.dispose()
        material.dispose()
      }
    })
    group.clear()
  }

  /** Adds a decoration to whichever half of the cake it sits on. */
  private place(obj: THREE.Object3D): void {
    ;(obj.position.z >= 0 ? this.frontHalf : this.backHalf).add(obj)
  }

  private build(): void {
    const config = this.config
    if (!config) return
    this.clearGroup(this.backHalf)
    this.clearGroup(this.frontHalf)
    this.clearGroup(this.sidePlate)
    this.flames = []

    const n = config.tiers
    const height = n === 1 ? 0.85 : 0.72
    const base = 1.15 + 0.2 * (n - 1)
    this.tiers = Array.from({ length: n }, (_, i) => ({
      radius: base - 0.33 * i,
      y: i * height,
      height,
      color: config.tierColors[i],
    }))

    const sponge = SPONGES.find((s) => s.id === config.sponge)!.color
    const filling = FILLINGS.find((f) => f.id === config.filling)!.color
    const halves: [THREE.Group, number][] = [
      [this.frontHalf, -Math.PI / 2],
      [this.backHalf, Math.PI / 2],
    ]

    this.tiers.forEach((tier, index) => {
      const profile = [new THREE.Vector2(tier.radius, 0), new THREE.Vector2(tier.radius, tier.height - BEVEL)]
      for (let i = 1; i <= 6; i++) {
        const a = (i / 6) * (Math.PI / 2)
        profile.push(
          new THREE.Vector2(tier.radius - BEVEL + Math.cos(a) * BEVEL, tier.height - BEVEL + Math.sin(a) * BEVEL),
        )
      }
      profile.push(new THREE.Vector2(0, tier.height))

      for (const [group, phiStart] of halves) {
        const frosting = new THREE.MeshStandardMaterial({ color: tier.color, roughness: 0.62 })
        const shell = new THREE.Mesh(new THREE.LatheGeometry(profile, 40, phiStart, Math.PI), frosting)
        shell.position.y = tier.y
        group.add(shell)

        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(tier.radius * 2, tier.height),
          new THREE.MeshStandardMaterial({
            map: crossSectionTexture(tier.color, sponge, filling, tier.radius, tier.height, BEVEL, 11 + index),
            roughness: 0.92,
            alphaTest: 0.5,
          }),
        )
        face.position.y = tier.y + tier.height / 2
        if (group === this.frontHalf) face.rotation.y = Math.PI
        face.userData.noShadow = true
        group.add(face)
      }
    })

    this.buildPlates()
    const decorations = new Set(config.decorations)
    const colors = config.decorationColors
    if (decorations.has('ribbon')) this.addRibbons(colors.ribbon)
    if (decorations.has('pearls')) this.addPearls(colors.pearls)
    if (decorations.has('sprinkles')) this.addSprinkles(colors.sprinkles)
    if (decorations.has('flowers')) this.addFlowers(colors.flowers)
    this.addToppings()
    this.addArt()

    for (const group of [this.backHalf, this.frontHalf, this.sidePlate]) {
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.receiveShadow = true
        mesh.castShadow = !mesh.userData.noShadow
      })
    }
    this.applyCut()
  }

  private buildPlates(): void {
    const radius = this.baseRadius + PLATE_MARGIN
    const makePlate = () => {
      const plate = new THREE.Group()
      const board = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius - 0.03, 0.05, 72),
        new THREE.MeshStandardMaterial({ color: '#fbf8f3', roughness: 0.35 }),
      )
      board.position.y = -0.025
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.014, 10, 96),
        new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.3, metalness: 0.9 }),
      )
      rim.rotation.x = Math.PI / 2
      rim.position.y = -0.002
      plate.add(board, rim)
      return plate
    }
    // The main plate stays with the back half; the front half gets its own when the cake opens.
    this.backHalf.add(makePlate())
    this.sidePlate.add(makePlate())
  }

  private artArc(): number {
    return Math.min(1.7, (this.tiers[0].height * ART_HEIGHT_RATIO * 2) / this.tiers[0].radius)
  }

  private addArt(): void {
    if (!this.artTexture) return
    const tier = this.tiers[0]
    const arc = this.artArc()
    const height = tier.height * ART_HEIGHT_RATIO
    const decal = new THREE.Mesh(
      new THREE.CylinderGeometry(tier.radius + 0.006, tier.radius + 0.006, height, 48, 1, true, -arc / 2, arc),
      new THREE.MeshStandardMaterial({
        map: this.artTexture,
        transparent: true,
        depthWrite: false,
        roughness: 0.6,
      }),
    )
    decal.position.y = tier.y + tier.height * 0.52
    decal.userData.noShadow = true
    decal.renderOrder = 2
    this.frontHalf.add(decal)
  }

  /** True when a point on the base tier's side would land on the AI design. */
  private overArt(tierIndex: number, angle: number): boolean {
    if (!this.artTexture || tierIndex !== 0) return false
    const wrapped = Math.atan2(Math.sin(angle), Math.cos(angle))
    return Math.abs(wrapped) < this.artArc() / 2 + 0.08
  }

  private addRibbons(color: string): void {
    for (const tier of this.tiers) {
      for (const [group, start] of [
        [this.frontHalf, -Math.PI / 2],
        [this.backHalf, Math.PI / 2],
      ] as [THREE.Group, number][]) {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(tier.radius + 0.007, tier.radius + 0.007, 0.09, 64, 1, true, start, Math.PI),
          new THREE.MeshStandardMaterial({ color, roughness: 0.34, metalness: 0.6 }),
        )
        band.position.y = tier.y + 0.125
        group.add(band)
      }
    }
  }

  private addPearls(color: string): void {
    const geometry = new THREE.SphereGeometry(0.034, 14, 10)
    const matrix = new THREE.Matrix4()
    for (const tier of this.tiers) {
      const ring = tier.radius + 0.024
      const count = Math.round((Math.PI * 2 * ring) / 0.082 / 2) * 2
      const half = count / 2
      for (const [group, offset] of [
        [this.frontHalf, -Math.PI / 2],
        [this.backHalf, Math.PI / 2],
      ] as [THREE.Group, number][]) {
        const pearls = new THREE.InstancedMesh(
          geometry.clone(),
          new THREE.MeshStandardMaterial({ color, roughness: 0.18, metalness: 0.15 }),
          half,
        )
        for (let i = 0; i < half; i++) {
          const angle = offset + ((i + 0.5) / half) * Math.PI
          matrix.makeTranslation(Math.sin(angle) * ring, tier.y + 0.034, Math.cos(angle) * ring)
          pearls.setMatrixAt(i, matrix)
        }
        group.add(pearls)
      }
    }
    geometry.dispose()
  }

  private addSprinkles(colorChoice: string): void {
    const rand = seededRandom(23)
    const front: { matrix: THREE.Matrix4; color: THREE.Color }[] = []
    const back: typeof front = []
    const position = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const spin = new THREE.Quaternion()
    const scale = new THREE.Vector3(1, 1, 1)
    const up = new THREE.Vector3(0, 1, 0)
    const forward = new THREE.Vector3(0, 0, 1)

    this.tiers.forEach((tier, index) => {
      const count = Math.round(70 * tier.radius)
      for (let i = 0; i < count; i++) {
        const angle = rand() * Math.PI * 2
        const y = tier.y + 0.2 + rand() * (tier.height - 0.34)
        const tilt = rand() * Math.PI
        const mixed = SPRINKLE_COLORS[Math.floor(rand() * SPRINKLE_COLORS.length)]
        const color = new THREE.Color(colorChoice === RAINBOW ? mixed : colorChoice)
        if (this.overArt(index, angle)) continue
        position.set(Math.sin(angle) * (tier.radius + 0.008), y, Math.cos(angle) * (tier.radius + 0.008))
        // Lie flat against the side, then spin within the surface.
        quaternion.setFromAxisAngle(up, angle)
        spin.setFromAxisAngle(forward, tilt)
        quaternion.multiply(spin)
        const entry = { matrix: new THREE.Matrix4().compose(position, quaternion, scale), color }
        ;(position.z >= 0 ? front : back).push(entry)
      }
    })

    for (const [group, entries] of [
      [this.frontHalf, front],
      [this.backHalf, back],
    ] as [THREE.Group, typeof front][]) {
      if (!entries.length) continue
      const mesh = new THREE.InstancedMesh(
        new THREE.CapsuleGeometry(0.011, 0.045, 3, 6),
        new THREE.MeshStandardMaterial({ roughness: 0.4 }),
        entries.length,
      )
      entries.forEach((entry, i) => {
        mesh.setMatrixAt(i, entry.matrix)
        mesh.setColorAt(i, entry.color)
      })
      mesh.userData.noShadow = true
      group.add(mesh)
    }
  }

  /** A piped sugar rose: a tight bud wrapped in rings of petals that open outwards. */
  private makeFlower(size: number, petalColor: string): THREE.Group {
    const rose = new THREE.Group()
    const base = new THREE.Color(petalColor)
    const rings = [
      { petals: 3, reach: 0.07, lift: 0.3, tilt: 0.08, scale: 0.25, shade: 0.8 },
      { petals: 5, reach: 0.2, lift: 0.25, tilt: 0.4, scale: 0.3, shade: 0.9 },
      { petals: 6, reach: 0.35, lift: 0.17, tilt: 0.8, scale: 0.35, shade: 1 },
      { petals: 7, reach: 0.48, lift: 0.08, tilt: 1.15, scale: 0.36, shade: 1.06 },
    ]
    rings.forEach((ring, index) => {
      const color = base.clone().multiplyScalar(ring.shade)
      for (let i = 0; i < ring.petals; i++) {
        const a = (i / ring.petals) * Math.PI * 2 + index * 0.7
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(size * ring.scale, 14, 10),
          new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
        )
        // Thin across the radius, then leaned outwards: further out means more open.
        petal.scale.set(1, 0.85, 0.24)
        petal.position.set(Math.cos(a) * size * ring.reach, size * ring.lift, Math.sin(a) * size * ring.reach)
        petal.rotation.order = 'YXZ'
        petal.rotation.y = Math.PI / 2 - a
        petal.rotation.x = ring.tilt
        rose.add(petal)
      }
    })
    const bud = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.11, 10, 8),
      new THREE.MeshStandardMaterial({ color: base.clone().multiplyScalar(0.72), roughness: 0.6 }),
    )
    bud.scale.y = 1.5
    bud.position.y = size * 0.36
    rose.add(bud)
    return rose
  }

  private addFlowers(color: string): void {
    const tint = (amount: number) =>
      `#${new THREE.Color(color).lerp(new THREE.Color('#ffffff'), amount).getHexString()}`
    const up = new THREE.Vector3(0, 1, 0)
    this.tiers.forEach((tier, index) => {
      const centre = 0.8 - index * 0.5
      const blooms = [
        { offset: 0, size: 0.25, color, lift: 0.03 },
        { offset: 0.23 / tier.radius, size: 0.16, color: tint(0.45), lift: 0.01 },
        { offset: -0.23 / tier.radius, size: 0.17, color: tint(0.7), lift: 0.01 },
      ]
      for (const bloom of blooms) {
        const angle = centre + bloom.offset
        const out = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle))
        const flower = this.makeFlower(bloom.size, bloom.color)
        flower.position.copy(out).multiplyScalar(tier.radius + 0.07).setY(tier.y + bloom.lift)
        flower.quaternion.setFromUnitVectors(up, out.clone().multiplyScalar(0.75).setY(0.66).normalize())
        this.place(flower)
      }
      for (const side of [-1, 1]) {
        const angle = centre + (side * 0.4) / tier.radius
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 10, 8),
          new THREE.MeshStandardMaterial({ color: '#7d9a68', roughness: 0.7 }),
        )
        leaf.scale.set(1.25, 0.22, 0.55)
        leaf.position.set(Math.sin(angle) * (tier.radius + 0.08), tier.y + 0.03, Math.cos(angle) * (tier.radius + 0.08))
        leaf.rotation.y = angle + (side * Math.PI) / 2.6
        this.place(leaf)
      }
    })
  }

  /** A star, heart or cloud on a stick, standing at the origin and facing +z. */
  private makeStickTopper(kind: ToppingId, color: string, tall: boolean): THREE.Group {
    const group = new THREE.Group()
    const stickHeight = tall ? 0.34 : 0.24
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, stickHeight, 6),
      new THREE.MeshStandardMaterial({ color: '#efe6d2', roughness: 0.7 }),
    )
    stick.position.y = stickHeight / 2
    group.add(stick)

    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.15 })
    const head = new THREE.Group()
    head.position.y = stickHeight + 0.07

    if (kind === 'clouds') {
      const puffs: [number, number, number][] = [
        [-0.085, -0.015, 0.06],
        [-0.02, 0.03, 0.085],
        [0.065, 0.005, 0.07],
        [0.12, -0.025, 0.045],
        [0.02, -0.03, 0.06],
      ]
      for (const [x, y, radius] of puffs) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), material.clone())
        puff.position.set(x - 0.02, y, 0)
        puff.scale.z = 0.45
        head.add(puff)
      }
      material.dispose()
    } else {
      const shape = new THREE.Shape()
      if (kind === 'stars') {
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? 0.115 : 0.05
          const a = (i / 10) * Math.PI * 2 + Math.PI / 2
          const x = Math.cos(a) * radius
          const y = Math.sin(a) * radius
          if (i === 0) shape.moveTo(x, y)
          else shape.lineTo(x, y)
        }
      } else {
        const steps = 40
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 2
          const x = 16 * Math.pow(Math.sin(t), 3) * 0.0066
          const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.0066 + 0.012
          if (i === 0) shape.moveTo(x, y)
          else shape.lineTo(x, y)
        }
      }
      shape.closePath()
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.022,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 2,
      })
      geometry.translate(0, 0, -0.011)
      head.add(new THREE.Mesh(geometry, material))
    }
    group.add(head)
    return group
  }

  /** A rose sitting on the cake, raised a little so it reads as a cupped bloom rather than a flat disc. */
  private makeRoseTopper(size: number, color: string): THREE.Group {
    const holder = new THREE.Group()
    const rose = this.makeFlower(size, color)
    rose.scale.y = 1.35
    rose.position.y = size * 0.05
    holder.add(rose)
    return holder
  }

  private makeCandle(color: string): THREE.Group {
    const candle = new THREE.Group()
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.3, 10),
      new THREE.MeshStandardMaterial({ color, roughness: 0.5 }),
    )
    stick.position.y = 0.15
    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.03, 5),
      new THREE.MeshStandardMaterial({ color: '#2a2320' }),
    )
    wick.position.y = 0.315
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 10, 10),
      new THREE.MeshBasicMaterial({ color: '#ffc45a' }),
    )
    flame.scale.set(1, 1.9, 1)
    flame.position.y = 0.365
    flame.userData.noShadow = true
    this.flames.push(flame)
    candle.add(stick, wick, flame)
    return candle
  }

  /** Stands toppings evenly around a ring, cycling through the given kinds. */
  private addRing(
    kinds: ToppingId[],
    ring: number,
    y: number,
    spacing: number,
    minimum: number,
    roseSize = 0.3,
  ): void {
    const colors = this.config!.toppingColors
    const wanted = Math.max(minimum, Math.round((Math.PI * 2 * ring) / spacing))
    let count = Math.ceil(wanted / kinds.length) * kinds.length
    if (count % 2) count += kinds.length
    for (let i = 0; i < count; i++) {
      // The half-step keeps every topping clear of the plane the cake is cut along.
      const angle = ((i + 0.5) / count) * Math.PI * 2
      const kind = kinds[i % kinds.length]
      const item =
        kind === 'candles'
          ? this.makeCandle(colors.candles)
          : kind === 'roses'
            ? this.makeRoseTopper(roseSize, colors.roses)
            : this.makeStickTopper(kind, colors[kind], Math.floor(i / kinds.length) % 2 === 0)
      item.position.set(Math.sin(angle) * ring, y, Math.cos(angle) * ring)
      item.rotation.y = angle
      this.place(item)
    }
  }

  private addBalls(ring: number, y: number, color: string, seed: number): void {
    const rand = seededRandom(seed)
    const sizes = [0.085, 0.06, 0.075, 0.052]
    const count = Math.max(8, Math.round((Math.PI * 2 * ring) / 0.19 / 2) * 2)
    for (let i = 0; i < count; i++) {
      const angle = ((i + 0.5) / count) * Math.PI * 2
      const radius = sizes[i % sizes.length]
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 20, 14),
        new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.35 }),
      )
      const reach = ring + (rand() - 0.5) * 0.03
      ball.position.set(Math.sin(angle) * reach, y + radius * 0.92, Math.cos(angle) * reach)
      this.place(ball)
    }
  }

  private addToppings(): void {
    const config = this.config!
    const topIndex = this.tiers.length - 1
    const colors = config.toppingColors

    this.tiers.forEach((tier, index) => {
      const fromTop = topIndex - index
      const here = new Set(config.toppings.filter((id) => activeToppingTiers(config, id).includes(fromTop)))
      if (!here.size) return
      const sticks = (['stars', 'hearts', 'clouds', 'roses'] as ToppingId[]).filter((k) => here.has(k))
      const hasBalls = here.has('balls')
      const hasCandles = here.has('candles')
      const surface = tier.y + tier.height

      if (index === topIndex) {
        // The whole top surface: balls on the rim, toppers inside them, candles in the middle.
        if (hasBalls) this.addBalls(tier.radius - 0.12, surface, colors.balls, 31 + index)
        if (sticks.length) this.addRing(sticks, tier.radius * (hasBalls ? 0.56 : 0.66), surface, 0.44, 4)
        if (hasCandles) this.addRing(['candles'], tier.radius * (sticks.length ? 0.24 : 0.48), surface, 10, 6)
      } else {
        // Lower tiers only have the ledge left around the tier above.
        if (hasBalls) this.addBalls(tier.radius - 0.1, surface, colors.balls, 31 + index)
        const standing: ToppingId[] = hasCandles ? [...sticks, 'candles'] : sticks
        if (standing.length) this.addRing(standing, tier.radius - (hasBalls ? 0.225 : 0.165), surface, 0.5, 6, 0.21)
      }
    })
  }

  // ------------------------------------------------------------------ box

  private buildBox(): BoxParts {
    const size = (this.baseRadius + PLATE_MARGIN) * 2 + 0.3
    const wallHeight = this.cakeHeight + 0.95
    const floor = -0.06
    const card = () => new THREE.MeshStandardMaterial({ color: '#f5f0e8', roughness: 0.85 })
    const gold = () =>
      new THREE.MeshStandardMaterial({ color: '#d6b888', roughness: 0.4, metalness: 0.45, transparent: true, opacity: 0 })

    const group = new THREE.Group()
    const base = new THREE.Mesh(new THREE.BoxGeometry(size + 0.03, 0.03, size + 0.03), card())
    base.position.y = floor - 0.015
    group.add(base)

    // Order: back, left, right, front, so the cake stays visible longest.
    const placements: [number, number, number][] = [
      [0, -size / 2, 0],
      [-size / 2, 0, Math.PI / 2],
      [size / 2, 0, Math.PI / 2],
      [0, size / 2, 0],
    ]
    const walls = placements.map(([x, z, turn]) => {
      const geometry = new THREE.BoxGeometry(size + 0.03, wallHeight, 0.03)
      geometry.translate(0, wallHeight / 2, 0)
      const wall = new THREE.Mesh(geometry, card())
      wall.position.set(x, floor, z)
      wall.rotation.y = turn
      wall.scale.y = 0.0001
      wall.visible = false
      group.add(wall)
      return wall
    })

    const lidHeight = 0.24
    const lidRest = floor + wallHeight - lidHeight / 2 + 0.03
    const lid = new THREE.Mesh(new THREE.BoxGeometry(size + 0.12, lidHeight, size + 0.12), card())
    lid.position.y = lidRest + 2.6
    lid.visible = false
    group.add(lid)

    const lidTop = lidRest + lidHeight / 2
    const fullHeight = lidTop - floor + 0.05
    const ribbon = new THREE.Group()
    const bandA = new THREE.Mesh(new THREE.BoxGeometry(size + 0.16, fullHeight, 0.24), gold())
    const bandB = new THREE.Mesh(new THREE.BoxGeometry(0.24, fullHeight, size + 0.16), gold())
    bandA.position.y = bandB.position.y = floor - 0.03 + fullHeight / 2
    ribbon.add(bandA, bandB)
    ribbon.visible = false
    group.add(ribbon)

    const bow = new THREE.Group()
    const bowMaterial = new THREE.MeshStandardMaterial({ color: '#d6b888', roughness: 0.4, metalness: 0.45 })
    for (const side of [-1, 1]) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 10, 28), bowMaterial.clone())
      loop.scale.set(1.25, 0.7, 1)
      loop.position.set(side * 0.24, 0.13, 0)
      loop.rotation.z = side * 0.45
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.13), bowMaterial.clone())
      tail.position.set(side * 0.27, 0.02, 0.18)
      tail.rotation.y = side * -0.6
      bow.add(loop, tail)
    }
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), bowMaterial)
    knot.position.y = 0.09
    bow.add(knot)
    bow.position.y = lidTop + 0.02
    bow.scale.setScalar(0.0001)
    bow.visible = false
    group.add(bow)

    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
    this.scene.add(group)
    this.boxGroup = group
    return { walls, lid, lidRest, ribbon, bow }
  }

  private removeBox(): void {
    if (this.boxing) {
      this.boxing.resolve()
      this.boxing = null
    }
    if (this.boxGroup) {
      this.scene.remove(this.boxGroup)
      this.clearGroup(this.boxGroup)
      this.boxGroup = null
    }
    this.cakeGroup.visible = true
  }

  private stepBoxing(dt: number): void {
    const boxing = this.boxing
    if (!boxing || !this.boxGroup) return
    boxing.time += dt
    const t = boxing.time
    const { walls, lid, lidRest, ribbon, bow } = boxing.parts

    walls.forEach((wall, i) => {
      const p = segment(t, 0.7 + i * 0.22, 0.75)
      wall.visible = p > 0
      wall.scale.y = Math.max(0.0001, easeOutCubic(p))
    })

    const lidP = segment(t, 2.3, 1.0)
    lid.visible = lidP > 0
    lid.position.y = lidRest + (1 - easeOutBounce(lidP)) * 2.6
    if (lidP >= 1) this.cakeGroup.visible = false

    const ribbonP = segment(t, 3.4, 0.6)
    ribbon.visible = ribbonP > 0
    for (const band of ribbon.children) {
      ;((band as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = ribbonP
    }

    const bowP = segment(t, 3.9, 0.55)
    bow.visible = bowP > 0
    bow.scale.setScalar(Math.max(0.0001, easeOutBack(bowP) * 1.5))

    const hop = segment(t, 4.5, 0.6)
    this.boxGroup.position.y = Math.sin(hop * Math.PI) * 0.22

    if (t >= 5.2) {
      this.boxing = null
      boxing.resolve()
    }
  }

  // --------------------------------------------------------------- camera

  private frameDistance(width: number, height: number): number {
    const tan = Math.tan(THREE.MathUtils.degToRad(FOV / 2))
    const aspect = this.camera.aspect || 1
    return Math.max(height / 2 / tan, width / 2 / (tan * aspect)) * 1.14
  }

  private updateGoal(): void {
    const radius = this.baseRadius
    const plate = radius + PLATE_MARGIN
    const height = this.cakeHeight
    const turns = Math.round(this.rig.azimuth / (Math.PI * 2)) * Math.PI * 2

    if (this.mode === 'flavour') {
      const spread = this.cutOffset()
      this.goal.azimuth = turns
      this.goal.elevation = 0.2
      this.goal.x = spread / 2
      this.goal.y = (height + 0.55 - plate * 0.2) / 2
      this.goal.distance = this.frameDistance(spread + plate * 2 + 0.3, height + 0.6 + plate * 0.4)
    } else if (this.mode === 'boxed') {
      const size = plate * 2 + 0.3
      const boxHeight = height + 0.95
      this.goal.azimuth = turns + 0.6
      this.goal.elevation = 0.42
      this.goal.x = 0
      this.goal.y = boxHeight / 2 - size * 0.1
      this.goal.distance = this.frameDistance(size * 1.7, boxHeight + size * 0.7 + 1.1)
    } else {
      this.goal.elevation = 0.32
      this.goal.x = 0
      this.goal.y = (height + 0.55 - plate * 0.33) / 2
      this.goal.distance = this.frameDistance(plate * 2 + 0.4, height + 0.6 + plate * 0.66)
    }
    const glowSize = (plate + (this.mode === 'flavour' ? this.cutOffset() / 2 : 0)) * 4.4
    this.glow.scale.set(glowSize, glowSize, 1)
    this.glow.position.x = this.goal.x
  }

  private cutOffset(): number {
    return (this.baseRadius + PLATE_MARGIN) * 2 + 0.25
  }

  private applyCut(): void {
    const offset = this.cutOffset() * this.cut
    this.frontHalf.position.x = offset
    this.frontHalf.rotation.y = this.cut * Math.PI
    this.sidePlate.position.x = offset
    this.sidePlate.visible = this.cut > 0.02
    this.sidePlate.scale.setScalar(Math.max(0.0001, Math.min(1, this.cut * 1.6)))
  }

  private resize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    if (!width || !height) return
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.updateGoal()
  }

  private readonly tick = (): void => {
    if (this.disposed) return
    this.frame = requestAnimationFrame(this.tick)
    const dt = Math.min(this.timer.getDelta(), 0.05)
    this.elapsed += dt

    const cutGoal = this.mode === 'flavour' ? 1 : 0
    if (Math.abs(cutGoal - this.cut) > 0.0005) {
      this.cut += (cutGoal - this.cut) * (1 - Math.exp(-dt * 4.2))
      if (Math.abs(cutGoal - this.cut) <= 0.0005) this.cut = cutGoal
      this.applyCut()
    }

    if (this.pop > 0.001) {
      this.pop *= Math.exp(-dt * 7)
      this.cakeGroup.scale.setScalar(1 - 0.07 * this.pop)
    } else if (this.pop !== 0) {
      this.pop = 0
      this.cakeGroup.scale.setScalar(1)
    }

    this.flames.forEach((flame, i) => {
      flame.scale.y = 1.9 + Math.sin(this.elapsed * 17 + i * 1.7) * 0.25
      flame.scale.x = 1 + Math.sin(this.elapsed * 23 + i) * 0.08
    })

    this.stepBoxing(dt)
    if (this.mode === 'boxed' && !this.boxing && !this.drag) this.goal.azimuth += dt * 0.22

    const k = 1 - Math.exp(-dt * 4.5)
    const rig = this.rig
    rig.azimuth += (this.goal.azimuth - rig.azimuth) * k
    rig.elevation += (this.goal.elevation - rig.elevation) * k
    rig.distance += (this.goal.distance - rig.distance) * k
    rig.x += (this.goal.x - rig.x) * k
    rig.y += (this.goal.y - rig.y) * k
    const flat = Math.cos(rig.elevation) * rig.distance
    this.camera.position.set(
      rig.x + Math.sin(rig.azimuth) * flat,
      rig.y + Math.sin(rig.elevation) * rig.distance,
      Math.cos(rig.azimuth) * flat,
    )
    this.camera.lookAt(rig.x, rig.y, 0)

    this.renderer.render(this.scene, this.camera)
  }

  // -------------------------------------------------------------- pointer

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, touch: event.pointerType === 'touch' }
    this.renderer.domElement.setPointerCapture(event.pointerId)
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const drag = this.drag
    if (!drag || drag.id !== event.pointerId) return
    this.goal.azimuth -= (event.clientX - drag.x) * 0.008
    // Touch keeps vertical movement for scrolling the page.
    if (!drag.touch) {
      this.goal.elevation = Math.min(1.15, Math.max(0.04, this.goal.elevation + (event.clientY - drag.y) * 0.006))
    }
    drag.x = event.clientX
    drag.y = event.clientY
  }

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.drag?.id === event.pointerId) this.drag = null
  }
}

interface BoxParts {
  walls: THREE.Mesh[]
  lid: THREE.Mesh
  lidRest: number
  ribbon: THREE.Group
  bow: THREE.Group
}
