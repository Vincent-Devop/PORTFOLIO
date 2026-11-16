import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const particleNodes = Array.from({ length: 84 }, (_, index) => {
  const phi = Math.acos(1 - (2 * (index + .5)) / 84)
  const theta = Math.PI * (1 + Math.sqrt(5)) * index
  const radius = 1.72 + Math.sin(index * 1.8) * .08
  return [radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)]
})

const particlePositions = new Float32Array(particleNodes.flat())
const connectorPositions = new Float32Array(particleNodes.flatMap((node, index) => {
  const next = particleNodes[(index + 1) % particleNodes.length]
  const cross = particleNodes[(index + 9) % particleNodes.length]
  return index % 2 === 0 ? [...node, ...next] : [...node, ...cross]
}))

function ParticleStructure() {
  const group = useRef<THREE.Group>(null)
  useFrame(({ clock, pointer }) => {
    if (!group.current) return
    group.current.rotation.y = clock.getElapsedTime() * .12 + pointer.x * .2
    group.current.rotation.x = pointer.y * .14
  })

  return <group ref={group}>
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[particlePositions, 3]} /></bufferGeometry>
      <pointsMaterial color="#7650D8" size={.055} sizeAttenuation transparent opacity={.95} />
    </points>
    <lineSegments>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[connectorPositions, 3]} /></bufferGeometry>
      <lineBasicMaterial color="#C9B5F4" transparent opacity={.7} />
    </lineSegments>
  </group>
}

export default function ParticleCanvas() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 680px), (pointer: coarse), (prefers-reduced-motion: reduce)')
    const update = () => setEnabled(!query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  if (!enabled) return null

  return <Canvas camera={{ position: [0, 0, 5.1], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
    <ParticleStructure />
  </Canvas>
}
