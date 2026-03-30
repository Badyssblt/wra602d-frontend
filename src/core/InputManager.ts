import * as THREE from 'three'

// Distance en px en dessous de laquelle on considère que c'est un clic (pas un drag)
const CLICK_THRESHOLD_PX = 5

export class InputManager {
  readonly mouse = new THREE.Vector2()

  private pointerDownAt: { x: number; y: number } | null = null

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onClick: (mouse: THREE.Vector2) => void,
  ) {
    canvas.addEventListener('pointermove', this.handleMove)
    canvas.addEventListener('pointerdown', this.handleDown)
    canvas.addEventListener('pointerup', this.handleUp)
  }

  private readonly handleMove = (e: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }

  private readonly handleDown = (e: PointerEvent): void => {
    this.pointerDownAt = { x: e.clientX, y: e.clientY }
  }

  private readonly handleUp = (e: PointerEvent): void => {
    if (!this.pointerDownAt) return

    const dx = e.clientX - this.pointerDownAt.x
    const dy = e.clientY - this.pointerDownAt.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    this.pointerDownAt = null

    if (dist < CLICK_THRESHOLD_PX) {
      this.onClick(this.mouse)
    }
  }

  dispose(): void {
    this.canvas.removeEventListener('pointermove', this.handleMove)
    this.canvas.removeEventListener('pointerdown', this.handleDown)
    this.canvas.removeEventListener('pointerup', this.handleUp)
  }
}
