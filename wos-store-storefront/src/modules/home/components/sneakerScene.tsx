'use client'

import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type Props = {
  modelName: string
}

// Singleton pour le renderer WebGL - évite d'épuiser les contextes Safari
let sharedRenderer: THREE.WebGLRenderer | null = null
let rendererRefCount = 0

function getSharedRenderer(): THREE.WebGLRenderer | null {
  if (sharedRenderer) {
    rendererRefCount++
    return sharedRenderer
  }
  
  try {
    sharedRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'low-power',
      failIfMajorPerformanceCaveat: false,
    })
    rendererRefCount = 1
    return sharedRenderer
  } catch (e) {
    console.warn('Failed to create WebGL renderer:', e)
    return null
  }
}

function releaseSharedRenderer() {
  rendererRefCount--
  // Ne pas détruire le renderer, le garder pour réutilisation
  // Il sera automatiquement garbage collected si la page est fermée
}

// Fonction pour forcer la libération de tous les contextes WebGL (utile en dev)
if (typeof window !== 'undefined') {
  (window as any).__resetWebGLContexts = () => {
    if (sharedRenderer) {
      sharedRenderer.dispose()
      sharedRenderer.forceContextLoss()
      sharedRenderer = null
      rendererRefCount = 0
      console.log('WebGL contexts reset')
    }
  }
}

export default function SneakerScene({ modelName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [webglError, setWebglError] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Obtenir le renderer partagé
    const renderer = getSharedRenderer()
    if (!renderer) {
      setWebglError(true)
      return
    }

    // --- Scene ---
    const scene = new THREE.Scene()

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 1000)
    camera.position.set(3, 3, 3)

    // Configurer et attacher le renderer
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enableZoom = false
    controls.enablePan = false


    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    const lights = [
      new THREE.DirectionalLight(0xffffff, 100),
      new THREE.DirectionalLight(0xffffff, 100),
      new THREE.DirectionalLight(0xffffff, 100),
    ]

    lights[0].position.set(5, 5, 5)
    lights[1].position.set(-5, 3, -5)
    lights[2].position.set(0, 5, -5)

    lights.forEach((l) => scene.add(l))

    // --- Model ---
    let model: THREE.Object3D | null = null
    let baseDistance = 5

    const loader = new GLTFLoader()
    loader.load(`/models/${modelName}.glb`, (gltf) => {
      model = gltf.scene

      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      model.position.sub(center)

      model.rotation.set(-0.4, -0.05, 0.4)

      scene.add(model)

      const maxDim = Math.max(size.x, size.y, size.z)
      baseDistance = maxDim * 2.2

      updateCamera()
    })

    // --- Resize handler ---
    const updateCamera = () => {
      const width = container.clientWidth
      const height = container.clientHeight

      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      const scaleFactor = Math.min(width / 1200, 1)
      const distance = baseDistance / scaleFactor

      camera.position.set(distance, distance, distance)
      camera.lookAt(0, 0, 0)
      controls.target.set(0, 0, 0)
    }

    updateCamera()
    window.addEventListener('resize', updateCamera)

    // --- Animation ---
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      if (model) {
        // Axe vertical LOCAL du modèle (après orientation)
        const localUp = new THREE.Vector3(0, 1, 0)
        .applyQuaternion(model.quaternion)
        .normalize()

        model.rotateOnWorldAxis(localUp, 0.01)
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', updateCamera)
      cancelAnimationFrame(animationId)
      controls.dispose()
      
      // Nettoyer la scène mais garder le renderer
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose()
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose())
          } else {
            object.material?.dispose()
          }
        }
      })
      scene.clear()
      
      // Détacher le canvas du container
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      
      // Libérer la référence (mais garder le renderer pour réutilisation)
      releaseSharedRenderer()
    }
  }, [modelName])

  // Fallback si WebGL n'est pas disponible
  if (webglError) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500 p-4">
          <p className="text-sm">Aperçu 3D indisponible</p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
