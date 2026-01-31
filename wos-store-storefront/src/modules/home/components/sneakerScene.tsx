// components/SneakerScene.tsx
'use client'

import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type Props = {
    modelName: string
}

export default function SneakerScene({ modelName }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const width = container.clientWidth
        const height = container.clientHeight

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(3, width / height, 0.1, 1000)
        camera.position.set(3, 3, 3)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height)
        container.appendChild(renderer.domElement)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.enableZoom = false
        controls.update()

        scene.add(new THREE.AmbientLight(0xffffff, 0.7))
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        scene.add(directionalLight)

        const loader = new GLTFLoader()
        loader.load(`/models/${modelName}.glb`, (gltf : any) => {
            const model = gltf.scene
            const box = new THREE.Box3().setFromObject(model)
            const center = box.getCenter(new THREE.Vector3())
            model.position.sub(center)
            scene.add(model)
        })

        const animate = () => {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }

        animate()

        return () => {
            renderer.dispose()
            container.innerHTML = ''
        }
    }, [modelName])

    return <div ref={containerRef} className="w-full h-full" />
}
