import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export class SceneManager {
  readonly scene: THREE.Scene
  readonly camera: THREE.PerspectiveCamera
  readonly renderer: THREE.WebGLRenderer
  readonly controls: OrbitControls

  private animFrameId = 0
  private lastTime = 0

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87ceeb)

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(10, 12, 10)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.target.set(0, 0, 0)
    this.controls.maxPolarAngle = Math.PI / 2.2
    this.controls.minDistance = 5
    this.controls.maxDistance = 30
    this.controls.update()

    this.setupLights()
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffffff, 1.2)
    sun.position.set(10, 20, 10)
    sun.castShadow = true
    sun.shadow.camera.near = 0.1
    sun.shadow.camera.far = 60
    sun.shadow.camera.left = -15
    sun.shadow.camera.right = 15
    sun.shadow.camera.top = 15
    sun.shadow.camera.bottom = -15
    this.scene.add(sun)
  }

  start(onTick: (delta: number) => void): void {
    const loop = (time: number) => {
      this.animFrameId = requestAnimationFrame(loop)
      const delta = (time - this.lastTime) / 1000
      this.lastTime = time
      this.controls.update()
      onTick(delta)
      this.renderer.render(this.scene, this.camera)
    }
    requestAnimationFrame(loop)
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  dispose(): void {
    cancelAnimationFrame(this.animFrameId)
    this.controls.dispose()
    this.renderer.dispose()
  }
}
