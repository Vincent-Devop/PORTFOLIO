import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const networkPoints: [number, number, number][] = [
  [-1.35, .76, .12], [-.97, 1.02, -.08], [-.59, .77, .1], [-.91, .46, .06],
  [-.35, .14, .02], [-.06, -.22, .08], [.3, .04, -.04], [.43, .48, .1],
  [.91, .62, -.08], [1.32, .4, .06], [1.05, .02, .13], [.96, -.43, -.06],
  [.57, -.24, .04], [-.34, -.62, -.07], [.03, -.63, .1],
]

const networkSegments = [
  [0, 1], [1, 2], [2, 3], [3, 0], [2, 4], [4, 5], [5, 6], [6, 7],
  [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7], [5, 13],
  [13, 14], [14, 12],
]

const linkPositions = new Float32Array(networkSegments.flatMap(([start, end]) => [...networkPoints[start], ...networkPoints[end]]))
const shieldShape = new THREE.Shape()
shieldShape.moveTo(0, .68)
shieldShape.lineTo(.48, .43)
shieldShape.lineTo(.4, -.26)
shieldShape.quadraticCurveTo(.29, -.55, 0, -.75)
shieldShape.quadraticCurveTo(-.29, -.55, -.4, -.26)
shieldShape.lineTo(-.48, .43)
shieldShape.closePath()
const shieldGeometry = new THREE.ShapeGeometry(shieldShape)

function NetworkLinks() {
  return <lineSegments>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[linkPositions, 3]} /></bufferGeometry>
    <lineBasicMaterial color="#8d7aff" transparent opacity={.3} />
  </lineSegments>
}

function NetworkNodes() {
  return <group>
    {networkPoints.map(([x, y, z], index) => <mesh key={index} position={[x, y, z]}>
      <sphereGeometry args={[index < 4 || index > 7 && index < 12 ? .055 : .038, 12, 12]} />
      <meshBasicMaterial color={index === 0 || index === 9 ? '#53d9e8' : '#b4a4ff'} />
    </mesh>)}
  </group>
}

function ServerStack() {
  return <group position={[-.11, -.26, .12]}>
    {[-.33, 0, .33].map((y, index) => <group key={index} position={[0, y, 0]}>
      <mesh><boxGeometry args={[.45, .23, .3]} /><meshStandardMaterial color="#171c2c" metalness={.3} roughness={.45} /></mesh>
      <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(.45, .23, .3)]} /><lineBasicMaterial color="#9b8cff" transparent opacity={.7} /></lineSegments>
      <mesh position={[-.12, 0, .16]}><sphereGeometry args={[.025, 10, 10]} /><meshBasicMaterial color="#55dae8" /></mesh>
      <mesh position={[.08, 0, .16]}><boxGeometry args={[.12, .018, .008]} /><meshBasicMaterial color="#7762ed" /></mesh>
    </group>)}
  </group>
}

function SecurityShield() {
  return <group position={[1.16, .08, .08]} rotation={[0, -.12, -.08]} scale={.62}>
    <mesh geometry={shieldGeometry}><meshBasicMaterial color="#7056e8" transparent opacity={.2} side={THREE.DoubleSide} /></mesh>
    <lineSegments><edgesGeometry args={[shieldGeometry]} /><lineBasicMaterial color="#a99aff" transparent opacity={.9} /></lineSegments>
    <mesh position={[0, .04, .025]}><torusGeometry args={[.19, .013, 8, 32]} /><meshBasicMaterial color="#58dbe8" /></mesh>
    <mesh position={[0, -.02, .04]}><boxGeometry args={[.12, .16, .025]} /><meshBasicMaterial color="#58dbe8" transparent opacity={.75} /></mesh>
  </group>
}

function InfrastructureScene() {
  const scene = useRef<THREE.Group>(null)
  useFrame(({ clock, pointer }) => {
    if (!scene.current) return
    scene.current.rotation.y = pointer.x * .16 + Math.sin(clock.elapsedTime * .16) * .025
    scene.current.rotation.x = pointer.y * .1
  })

  return <group ref={scene}>
    <ambientLight intensity={1.2} />
    <pointLight position={[-2, 3, 4]} color="#7770ff" intensity={3} />
    <NetworkLinks />
    <NetworkNodes />
    <ServerStack />
    <SecurityShield />
  </group>
}

export default function ParticleCanvas() {
  return <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} dpr={[1, 1.35]} gl={{ antialias: true, alpha: true }}>
    <InfrastructureScene />
  </Canvas>
}
