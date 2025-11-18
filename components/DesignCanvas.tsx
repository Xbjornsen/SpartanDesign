'use client'

import { Canvas, ThreeEvent, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useDesign } from '@/lib/designContext'
import { Shape, Rectangle, Circle, Triangle, Pentagon, Hexagon, Star, Heart, Text as TextShape, Hole } from '@/lib/types'
import { useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'

// Helper function to create regular polygon shape
function createPolygonShape(sides: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape()
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) {
      shape.moveTo(x, y)
    } else {
      shape.lineTo(x, y)
    }
  }
  shape.closePath()
  return shape
}

// Helper function to create star shape
function createStarShape(outerRadius: number, innerRadius: number, points: number): THREE.Shape {
  const shape = new THREE.Shape()
  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    if (i === 0) {
      shape.moveTo(x, y)
    } else {
      shape.lineTo(x, y)
    }
  }
  shape.closePath()
  return shape
}

// Helper function to create heart shape
function createHeartShape(size: number): THREE.Shape {
  const shape = new THREE.Shape()
  const scale = size / 50

  shape.moveTo(0, 15 * scale)
  shape.bezierCurveTo(0, 15 * scale, -10 * scale, 25 * scale, -25 * scale, 25 * scale)
  shape.bezierCurveTo(-55 * scale, 25 * scale, -55 * scale, -10 * scale, -55 * scale, -10 * scale)
  shape.bezierCurveTo(-55 * scale, -25 * scale, -40 * scale, -40 * scale, -25 * scale, -47 * scale)
  shape.bezierCurveTo(-10 * scale, -54 * scale, 0, -50 * scale, 0, -50 * scale)
  shape.bezierCurveTo(0, -50 * scale, 10 * scale, -54 * scale, 25 * scale, -47 * scale)
  shape.bezierCurveTo(40 * scale, -40 * scale, 55 * scale, -25 * scale, 55 * scale, -10 * scale)
  shape.bezierCurveTo(55 * scale, -10 * scale, 55 * scale, 25 * scale, 25 * scale, 25 * scale)
  shape.bezierCurveTo(10 * scale, 25 * scale, 0, 15 * scale, 0, 15 * scale)

  return shape
}

interface Shape3DProps {
  shape: Shape
  is2DView: boolean
  setControlsEnabled: (enabled: boolean) => void
}


function Shape3D({ shape, is2DView, setControlsEnabled }: Shape3DProps) {
  const { selectedShapeId, selectShape, updateShape } = useDesign()
  const { camera, raycaster, gl } = useThree()
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const isSelected = selectedShapeId === shape.id

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (!isDragging) {
      selectShape(shape.id)
    }
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()

    // Only enable dragging if Ctrl key is pressed (resize mode)
    if (e.ctrlKey) {
      setIsDragging(true)
      setControlsEnabled(false) // Disable camera controls during resize
      selectShape(shape.id)
      dragStartPos.current = { x: shape.position.x, y: shape.position.y }
      gl.domElement.style.cursor = 'nwse-resize'
    } else {
      selectShape(shape.id)
    }
  }

  useEffect(() => {
    if (!isDragging || !isSelected) return

    const handleGlobalPointerMove = (e: PointerEvent) => {
      // Only resize when Ctrl is pressed
      if (!e.ctrlKey) {
        setIsDragging(false)
        setControlsEnabled(true) // Re-enable camera controls
        gl.domElement.style.cursor = 'default'
        return
      }

      // Calculate mouse position in normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      // Raycast to ground plane
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(groundPlane, intersection)

      if (intersection) {
        // Resize mode - calculate distance from shape center
        const dx = intersection.x - shape.position.x
        const dz = intersection.z - shape.position.y
        const distance = Math.sqrt(dx * dx + dz * dz)

        if (shape.type === 'rectangle') {
          const rect = shape as Rectangle
          const aspectRatio = rect.width / rect.height
          const newWidth = Math.max(0.1, distance * 2)
          const newHeight = newWidth / aspectRatio
          updateShape(shape.id, { width: newWidth, height: newHeight } as Partial<Rectangle>)
        } else if (shape.type === 'circle') {
          const newRadius = Math.max(0.05, distance)
          updateShape(shape.id, { radius: newRadius } as Partial<Circle>)
        }
        gl.domElement.style.cursor = 'nwse-resize'
      }
    }

    const handleGlobalPointerUp = () => {
      setIsDragging(false)
      setControlsEnabled(true) // Re-enable camera controls
      gl.domElement.style.cursor = 'default'
    }

    window.addEventListener('pointermove', handleGlobalPointerMove)
    window.addEventListener('pointerup', handleGlobalPointerUp)

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove)
      window.removeEventListener('pointerup', handleGlobalPointerUp)
    }
  }, [isDragging, isSelected, shape, updateShape, camera, raycaster, gl, setControlsEnabled])

  const color = isSelected ? '#22c55e' : hovered ? '#60a5fa' : (shape.color || '#3b82f6')
  const yPosition = is2DView ? 0 : 0.05
  const hasHoles = shape.holes && shape.holes.length > 0

  // Compute CSG geometry with holes
  const geometryWithHoles = useMemo(() => {
    if (!hasHoles) return null

    try {
      const evaluator = new Evaluator()
      let baseBrush: Brush | null = null

      // Create base shape brush
      if (shape.type === 'rectangle') {
        const rect = shape as Rectangle
        const baseGeom = new THREE.BoxGeometry(rect.width, 0.1, rect.height)
        baseBrush = new Brush(baseGeom)
      } else if (shape.type === 'circle') {
        const circle = shape as Circle
        const baseGeom = new THREE.CylinderGeometry(circle.radius, circle.radius, 0.1, 64)
        baseBrush = new Brush(baseGeom)
        baseBrush.updateMatrixWorld()
      }

      if (!baseBrush || !shape.holes) return null

      // Subtract each hole
      let result = baseBrush
      for (const hole of shape.holes) {
        let holeBrush: Brush | null = null

        if (hole.type === 'rectangle' && hole.width && hole.height) {
          const holeGeom = new THREE.BoxGeometry(hole.width, 0.2, hole.height)
          holeBrush = new Brush(holeGeom)
          holeBrush.position.set(hole.position.x, 0, hole.position.y)
        } else if (hole.type === 'circle' && hole.radius) {
          const holeGeom = new THREE.CylinderGeometry(hole.radius, hole.radius, 0.2, 64)
          holeBrush = new Brush(holeGeom)
          holeBrush.position.set(hole.position.x, 0, hole.position.y)
          // Keep cylinder vertical (default Y-axis alignment) to cut through flat shapes
          // No rotation needed regardless of parent shape type
        }

        if (holeBrush) {
          holeBrush.updateMatrixWorld()
          result = evaluator.evaluate(result, holeBrush, SUBTRACTION)
        }
      }

      return result.geometry
    } catch (error) {
      console.error('CSG operation failed:', error)
      return null
    }
  }, [shape, hasHoles])

  switch (shape.type) {
    case 'rectangle': {
      const rect = shape as Rectangle

      return (
        <mesh
          position={[rect.position.x, yPosition, rect.position.y]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          geometry={geometryWithHoles || undefined}
        >
          {!geometryWithHoles && <boxGeometry args={[rect.width, 0.1, rect.height]} />}
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#166534' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
            wireframe={true}
          />
        </mesh>
      )
    }

    case 'circle': {
      const circle = shape as Circle

      return (
        <mesh
          position={[circle.position.x, yPosition, circle.position.y]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          geometry={geometryWithHoles || undefined}
        >
          {!geometryWithHoles && <cylinderGeometry args={[circle.radius, circle.radius, 0.1, 64]} />}
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#166534' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
            wireframe={true}
          />
        </mesh>
      )
    }

    case 'triangle': {
      const triangle = shape as Triangle
      const triangleShape = createPolygonShape(3, triangle.size)
      const extrudeSettings = { depth: 0.1, bevelEnabled: false }

      return (
        <mesh
          position={[triangle.position.x, yPosition, triangle.position.y]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[triangleShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#166534' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
            wireframe={true}
          />
        </mesh>
      )
    }

    case 'pentagon': {
      const pentagon = shape as Pentagon
      const pentagonShape = createPolygonShape(5, pentagon.size)
      const extrudeSettings = { depth: 0.1, bevelEnabled: false }

      return (
        <mesh
          position={[pentagon.position.x, yPosition, pentagon.position.y]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[pentagonShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#166534' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
            wireframe={true}
          />
        </mesh>
      )
    }

    case 'hexagon': {
      const hexagon = shape as Hexagon
      const hexagonShape = createPolygonShape(6, hexagon.size)
      const extrudeSettings = { depth: 0.1, bevelEnabled: false }

      return (
        <mesh
          position={[hexagon.position.x, yPosition, hexagon.position.y]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[hexagonShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#166534' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
            wireframe={true}
          />
        </mesh>
      )
    }

    case 'star': {
      const star = shape as Star
      const starShape = createStarShape(star.outerRadius, star.innerRadius, star.points)
      const extrudeSettings = { depth: 0.1, bevelEnabled: false }

      return (
        <mesh
          position={[star.position.x, yPosition, star.position.y]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[starShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#166534' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
            wireframe={true}
          />
        </mesh>
      )
    }

    case 'heart': {
      const heart = shape as Heart
      const heartShape = createHeartShape(heart.size)
      const extrudeSettings = { depth: 0.1, bevelEnabled: false }

      return (
        <mesh
          position={[heart.position.x, yPosition, heart.position.y]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[heartShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#166534' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
            wireframe={true}
          />
        </mesh>
      )
    }

    case 'text': {
      const text = shape as TextShape

      // For text, we'll render a simple box with the text label for now
      // Full text geometry would require loading font files
      return (
        <group
          position={[text.position.x, yPosition, text.position.y]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[text.fontSize, text.fontSize]} />
            <meshStandardMaterial
              color={color}
              emissive={isSelected ? '#166534' : '#000000'}
              emissiveIntensity={isSelected ? 0.2 : 0}
              wireframe={true}
            />
          </mesh>
        </group>
      )
    }

    case 'custom': {
      // For custom paths, we'll implement later with more complex geometry
      return null
    }

    default:
      return null
  }
}

interface DesignCanvasProps {
  is2DView?: boolean
  displayUnit?: 'mm' | 'cm' | 'm'
}

function CameraController({ is2DView }: { is2DView: boolean }) {
  const { camera } = useThree()

  useEffect(() => {
    if (is2DView) {
      // Reset camera to top-down view - higher for larger designs
      camera.position.set(0, 100, 0)
      camera.lookAt(0, 0, 0)
      camera.up.set(0, 0, -1) // Set proper up vector for 2D view
    } else {
      // Reset camera to 3D view - farther out for larger designs
      camera.position.set(50, 50, 50)
      camera.lookAt(0, 0, 0)
      camera.up.set(0, 1, 0) // Standard up vector for 3D
    }
  }, [is2DView, camera])

  return null
}

export default function DesignCanvas({ is2DView = false, displayUnit = 'mm' }: DesignCanvasProps) {
  const { shapes, selectShape } = useDesign()
  const [controlsEnabled, setControlsEnabled] = useState(true)

  const handleCanvasClick = (e: ThreeEvent<MouseEvent>) => {
    // Only deselect if clicking on the background (not a shape)
    if (e.object.type === 'GridHelper' || !e.object) {
      selectShape(null)
    }
  }

  // Dynamic grid settings based on display unit
  const gridSettings = {
    mm: { size: 2000, cellSize: 10, sectionSize: 100, fadeDistance: 1000 },
    cm: { size: 2000, cellSize: 100, sectionSize: 1000, fadeDistance: 1000 },
    m: { size: 10000, cellSize: 1000, sectionSize: 10000, fadeDistance: 5000 }
  }

  const grid = gridSettings[displayUnit]

  return (
    <div className="w-full h-screen bg-neutral-200 dark:bg-neutral-900">
      <Canvas
        camera={{
          position: [50, 50, 50],
          fov: 60,
          near: 0.1,
          far: 10000
        }}
        onPointerMissed={() => selectShape(null)}
      >
        {/* Camera controller for view switching */}
        <CameraController is2DView={is2DView} />

        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[50, 50, 50]} intensity={1.2} />
        <directionalLight position={[-50, 50, -50]} intensity={0.7} />

        {/* Grid helper for reference */}
        <Grid
          args={[grid.size, grid.size]}
          cellSize={grid.cellSize}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={grid.sectionSize}
          sectionThickness={1}
          sectionColor="#4b5563"
          fadeDistance={grid.fadeDistance}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Invisible ground plane for raycasting during drag operations */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} visible={false}>
          <planeGeometry args={[grid.size * 2, grid.size * 2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Orbit controls for camera manipulation */}
        <OrbitControls
          makeDefault
          enabled={controlsEnabled}
          minDistance={0.1}
          maxDistance={5000}
          enableRotate={!is2DView}
          enablePan={true}
          enableZoom={true}
          zoomSpeed={1.5}
          rotateSpeed={1}
          panSpeed={1.5}
        />

        {/* Render all shapes from design state */}
        {shapes.map((shape) => (
          <Shape3D
            key={shape.id}
            shape={shape}
            is2DView={is2DView}
            setControlsEnabled={setControlsEnabled}
          />
        ))}
      </Canvas>
    </div>
  )
}
