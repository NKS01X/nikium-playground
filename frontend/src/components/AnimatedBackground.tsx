import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(width, height)
    renderer.setClearColor(0x0a0a0a, 0.1)
    containerRef.current.appendChild(renderer.domElement)

    camera.position.z = 5

    // Create animated particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 50

    const positionArray = new Float32Array(particleCount * 3)
    const velocityArray = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positionArray[i] = (Math.random() - 0.5) * 10
      positionArray[i + 1] = (Math.random() - 0.5) * 10
      positionArray[i + 2] = (Math.random() - 0.5) * 10

      velocityArray[i] = (Math.random() - 0.5) * 0.02
      velocityArray[i + 1] = (Math.random() - 0.5) * 0.02
      velocityArray[i + 2] = (Math.random() - 0.5) * 0.02
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    particlesGeometry.userData.velocity = velocityArray

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    })

    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    // Create floating cubes
    const cubes: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[] = []
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.6 + i * 0.1, 0.7, 0.5),
        metalness: 0.7,
        roughness: 0.2,
        emissive: new THREE.Color().setHSL(0.6 + i * 0.1, 0.7, 0.3),
      })
      const cube = new THREE.Mesh(geometry, material)
      cube.position.set((i - 1) * 2, Math.sin(i) * 2, -3)
      cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      cube.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      }
      cubes.push(cube)
      scene.add(cube)
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x6366f1, 0.8)
    pointLight1.position.set(5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xec4899, 0.6)
    pointLight2.position.set(-5, -5, 5)
    scene.add(pointLight2)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Animate particles
      const posAttr = particlesGeometry.getAttribute('position') as THREE.BufferAttribute
      const positions = posAttr.array as Float32Array
      const velocities = particlesGeometry.userData.velocity as Float32Array

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] += velocities[i]
        positions[i + 1] += velocities[i + 1]
        positions[i + 2] += velocities[i + 2]

        // Wrap around
        if (positions[i] > 5) positions[i] = -5
        if (positions[i] < -5) positions[i] = 5
        if (positions[i + 1] > 5) positions[i + 1] = -5
        if (positions[i + 1] < -5) positions[i + 1] = 5
      }
      posAttr.needsUpdate = true

      // Animate cubes
      cubes.forEach((cube) => {
        cube.rotation.x += cube.userData.rotationSpeed.x
        cube.rotation.y += cube.userData.rotationSpeed.y
        cube.rotation.z += cube.userData.rotationSpeed.z
        cube.position.y += Math.sin(Date.now() * 0.001) * 0.005
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
