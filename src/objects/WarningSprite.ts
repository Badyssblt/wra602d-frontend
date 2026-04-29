import * as THREE from 'three'

let cachedTexture: THREE.CanvasTexture | null = null

/**
 * Builds (and caches) a 64×64 canvas with a red bubble + white "!" icon used
 * to flag buildings that have no road access.
 */
function getTexture(): THREE.CanvasTexture {
  if (cachedTexture) return cachedTexture

  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Soft outer glow
  const glow = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2)
  glow.addColorStop(0, 'rgba(239, 68, 68, 0.7)')
  glow.addColorStop(1, 'rgba(239, 68, 68, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  // Red disc
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.32, 0, Math.PI * 2)
  ctx.fillStyle = '#dc2626'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.lineWidth = 4
  ctx.stroke()

  // White "!"
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.42}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('!', size / 2, size / 2 + 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  cachedTexture = tex
  return tex
}

export function createWarningSprite(): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: getTexture(),
    depthWrite: false,
    transparent: true,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.6, 0.6, 0.6)
  return sprite
}
