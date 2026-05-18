import * as THREE from 'three'
import type { IncidentKind } from '../game/EventSystem'

interface KindStyle {
  bg: string
  ring: string
  glyph: string
}

const STYLE: Record<IncidentKind, KindStyle> = {
  fire:      { bg: '#f97316', ring: 'rgba(255, 224, 174, 0.95)', glyph: '🔥' },
  breakdown: { bg: '#a855f7', ring: 'rgba(232, 213, 255, 0.95)', glyph: '⚙' },
  strike:    { bg: '#0ea5e9', ring: 'rgba(186, 230, 253, 0.95)', glyph: '✋' },
}

const cache = new Map<string, THREE.CanvasTexture>()

function getTexture(kind: IncidentKind, escalated: boolean): THREE.CanvasTexture {
  const key = `${kind}-${escalated ? 'esc' : 'norm'}`
  const cached = cache.get(key)
  if (cached) return cached

  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const style = STYLE[kind]

  const glow = ctx.createRadialGradient(size / 2, size / 2, 18, size / 2, size / 2, size / 2)
  glow.addColorStop(0, hexWithAlpha(style.bg, escalated ? 0.85 : 0.6))
  glow.addColorStop(1, hexWithAlpha(style.bg, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)

  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2)
  ctx.fillStyle = style.bg
  ctx.fill()
  ctx.strokeStyle = style.ring
  ctx.lineWidth = escalated ? 6 : 4
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.42}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(style.glyph, size / 2, size / 2 + 3)

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

export function createIncidentSprite(kind: IncidentKind, escalated: boolean): THREE.Sprite {
  const material = new THREE.SpriteMaterial({
    map: getTexture(kind, escalated),
    depthWrite: false,
    transparent: true,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.7, 0.7, 0.7)
  return sprite
}

function hexWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
