'use client'

import { useDesign } from '@/lib/designContext'
import {
  Circle,
  Heart,
  Hexagon,
  Pentagon,
  Rectangle,
  Shape,
  Star,
  Text as TextShape,
  Triangle,
} from '@/lib/types'
import { Center, Grid, Html, OrbitControls, Text3D } from '@react-three/drei'
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  thickness: number
  holePlacementMode?: boolean
  onHolePlaced?: (x: number, y: number) => void
  selectedHoleId?: string | null
  onHoleSelected?: (holeId: string | null) => void
}

// Helper to create bent geometry for rectangles as a single mesh
function createBentGeometry(rect: Rectangle, depth: number) {
  if (!rect.bends || rect.bends.length === 0) return null

  // Sort bends by position
  const sortedBends = [...rect.bends].sort((a, b) => a.position - b.position)

  // Only support horizontal bends for now
  const horizontalBends = sortedBends.filter(b => b.orientation === 'horizontal')
  if (horizontalBends.length === 0) return null

  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  const indices: number[] = []

  const halfWidth = rect.width / 2
  const halfDepth = depth / 2

  // Build vertices along the bent path
  let currentY = 0
  let currentZ = -rect.height / 2
  let currentAngle = 0

  // Add vertices for each segment
  const segments = []
  let prevPos = 0

  horizontalBends.forEach((bend) => {
    const segmentHeight = bend.position - prevPos
    if (segmentHeight > 0) {
      segments.push({
        height: segmentHeight,
        endAngle: currentAngle,
      })
    }

    const angleRad = (bend.angle * Math.PI) / 180
    const bendDirection = bend.direction === 'up' ? 1 : -1
    currentAngle += angleRad * bendDirection
    prevPos = bend.position
  })

  // Final segment
  const finalHeight = rect.height - prevPos
  if (finalHeight > 0) {
    segments.push({
      height: finalHeight,
      endAngle: currentAngle,
    })
  }

  // Generate vertices
  currentY = 0
  currentZ = -rect.height / 2
  let vertexIndex = 0

  segments.forEach((segment, segIndex) => {
    const startY = currentY
    const startZ = currentZ
    const angle = segment.endAngle

    // Calculate end position
    const endZ = startZ + segment.height * Math.cos(angle)
    const endY = startY + segment.height * Math.sin(angle)

    // Add 4 vertices for this segment (front face)
    // Bottom left
    vertices.push(-halfWidth, startY, startZ)
    // Bottom right
    vertices.push(halfWidth, startY, startZ)
    // Top left
    vertices.push(-halfWidth, endY, endZ)
    // Top right
    vertices.push(halfWidth, endY, endZ)

    // Add back face vertices
    vertices.push(-halfWidth - depth, startY, startZ)
    vertices.push(halfWidth + depth, startY, startZ)
    vertices.push(-halfWidth - depth, endY, endZ)
    vertices.push(halfWidth + depth, endY, endZ)

    // Add faces for this segment
    const base = segIndex * 8
    // Front face
    indices.push(base, base + 1, base + 2)
    indices.push(base + 1, base + 3, base + 2)
    // Back face
    indices.push(base + 4, base + 6, base + 5)
    indices.push(base + 5, base + 6, base + 7)
    // Left face
    indices.push(base, base + 2, base + 4)
    indices.push(base + 2, base + 6, base + 4)
    // Right face
    indices.push(base + 1, base + 5, base + 3)
    indices.push(base + 3, base + 5, base + 7)

    // Connect to next segment if exists
    if (segIndex < segments.length - 1) {
      // Top face connecting to next segment
      indices.push(base + 2, base + 3, base + 10)
      indices.push(base + 3, base + 11, base + 10)
    }

    currentY = endY
    currentZ = endZ
  })

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

function Shape3D({
  shape,
  is2DView,
  setControlsEnabled,
  thickness,
  holePlacementMode = false,
  onHolePlaced,
  selectedHoleId,
  onHoleSelected,
}: Shape3DProps) {
  const { selectedShapeId, selectShape, updateShape } = useDesign()
  const { camera, raycaster, gl } = useThree()
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const isSelected = selectedShapeId === shape.id

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    // If in hole placement mode, place a hole at click position
    if (holePlacementMode && onHolePlaced && isSelected) {
      // Get the intersection point
      const point = e.point
      // Convert from world coordinates to shape-relative coordinates
      const relativeX = point.x - shape.position.x
      const relativeY = point.z - shape.position.y
      onHolePlaced(relativeX, relativeY)
      return
    }

    if (!isDragging) {
      selectShape(shape.id)
      if (onHoleSelected) onHoleSelected(null)
    }
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    // Show cursor coordinates when in hole placement mode and shape is selected
    if (holePlacementMode && isSelected && onHolePlaced) {
      const point = e.point
      const relativeX = point.x - shape.position.x
      const relativeY = point.z - shape.position.y

      // Store in window for the HTML overlay to access
      ;(window as any).__holePreviewCoords = { x: relativeX, y: relativeY }
    }
  }

  const handlePointerOut = () => {
    // Clear preview coords when leaving shape
    if (holePlacementMode) {
      ;(window as any).__holePreviewCoords = null
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

  const color = isSelected ? '#10B981' : hovered ? '#60A5FA' : shape.color || '#6B7280'
  const depth = thickness / 10 // Convert mm to appropriate scale (2mm -> 0.2 units)
  const yPosition = is2DView ? 0 : depth / 2
  const hasHoles = shape.holes && shape.holes.length > 0

  // Compute CSG geometry with holes - optimized dependencies
  const geometryWithHoles = useMemo(() => {
    if (!hasHoles) return null

    try {
      const evaluator = new Evaluator()
      let baseBrush: Brush | null = null

      // Create base shape brush
      if (shape.type === 'rectangle') {
        const rect = shape as Rectangle
        const baseGeom = new THREE.BoxGeometry(rect.width, depth, rect.height)
        baseBrush = new Brush(baseGeom)
      } else if (shape.type === 'circle') {
        const circle = shape as Circle
        const baseGeom = new THREE.CylinderGeometry(circle.radius, circle.radius, depth, 64)
        baseBrush = new Brush(baseGeom)
        baseBrush.updateMatrixWorld()
      }

      if (!baseBrush || !shape.holes) return null

      // Subtract each hole
      let result = baseBrush
      for (const hole of shape.holes) {
        let holeBrush: Brush | null = null

        if (hole.type === 'rectangle' && hole.width && hole.height) {
          const holeGeom = new THREE.BoxGeometry(hole.width, depth + 1, hole.height)
          holeBrush = new Brush(holeGeom)
          holeBrush.position.set(hole.position.x, 0, hole.position.y)
        } else if (hole.type === 'circle' && hole.radius) {
          const holeGeom = new THREE.CylinderGeometry(hole.radius, hole.radius, depth + 1, 32)
          holeBrush = new Brush(holeGeom)
          holeBrush.position.set(hole.position.x, 0, hole.position.y)
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
  }, [
    hasHoles,
    shape.type,
    shape.type === 'rectangle' ? (shape as Rectangle).width : null,
    shape.type === 'rectangle' ? (shape as Rectangle).height : null,
    shape.type === 'circle' ? (shape as Circle).radius : null,
    depth,
    JSON.stringify(shape.holes?.map(h => ({ ...h }))),
  ])

  switch (shape.type) {
    case 'rectangle': {
      const rect = shape as Rectangle

      const cornerRadius = rect.cornerRadius || 0
      // Temporarily disable rounded corners when holes are present (CSG doesn't support ExtrudeGeometry)
      const hasRoundedCorners = cornerRadius > 0 && !hasHoles

      // Create rounded rectangle geometry
      const roundedRectGeometry = useMemo(() => {
        if (!hasRoundedCorners) return null

        const width = rect.width
        const height = rect.height
        const radius = Math.min(cornerRadius, width / 2, height / 2) // Ensure radius doesn't exceed half dimensions

        // Create a 2D shape with rounded corners
        const shape = new THREE.Shape()
        const x = -width / 2
        const y = -height / 2

        shape.moveTo(x + radius, y)
        shape.lineTo(x + width - radius, y)
        shape.quadraticCurveTo(x + width, y, x + width, y + radius)
        shape.lineTo(x + width, y + height - radius)
        shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        shape.lineTo(x + radius, y + height)
        shape.quadraticCurveTo(x, y + height, x, y + height - radius)
        shape.lineTo(x, y + radius)
        shape.quadraticCurveTo(x, y, x + radius, y)

        const extrudeSettings = {
          depth: depth,
          bevelEnabled: false,
        }

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        geometry.rotateX(-Math.PI / 2)
        return geometry
      }, [hasRoundedCorners, rect.width, rect.height, cornerRadius, depth])

      if (hasRoundedCorners && roundedRectGeometry) {
        return (
          <mesh
            position={[rect.position.x, yPosition, rect.position.y]}
            rotation={[0, shape.rotation || 0, 0]}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => {
              setHovered(false)
              handlePointerOut()
            }}
            geometry={roundedRectGeometry}
          >
            <meshStandardMaterial
              color={color}
              emissive={isSelected ? '#059669' : '#000000'}
              emissiveIntensity={isSelected ? 0.2 : 0}
            />
          </mesh>
        )
      }

      // In 3D view with bends, render as single bent geometry
      const bentGeometry = !is2DView && rect.bends && rect.bends.length > 0 ? createBentGeometry(rect, depth) : null

      if (bentGeometry) {
        return (
          <mesh
            position={[rect.position.x, yPosition, rect.position.y]}
            rotation={[0, shape.rotation || 0, 0]}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => {
              setHovered(false)
              handlePointerOut()
            }}
            geometry={bentGeometry}
          >
            <meshStandardMaterial
              color={color}
              emissive={isSelected ? '#059669' : '#000000'}
              emissiveIntensity={isSelected ? 0.2 : 0}
            />
          </mesh>
        )
      }

      return (
        <mesh
          position={[rect.position.x, yPosition, rect.position.y]}
          rotation={[0, shape.rotation || 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => {
            setHovered(false)
            handlePointerOut()
          }}
          geometry={geometryWithHoles || undefined}
        >
          {!geometryWithHoles && <boxGeometry args={[rect.width, depth, rect.height]} />}
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#059669' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
      )
    }

    case 'circle': {
      const circle = shape as Circle

      return (
        <mesh
          position={[circle.position.x, yPosition, circle.position.y]}
          rotation={[0, shape.rotation || 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          geometry={geometryWithHoles || undefined}
        >
          {!geometryWithHoles && (
            <cylinderGeometry args={[circle.radius, circle.radius, depth, 64]} />
          )}
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#059669' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
      )
    }

    case 'triangle': {
      const triangle = shape as Triangle
      const triangleShape = createPolygonShape(3, triangle.size)
      const extrudeSettings = { depth: depth, bevelEnabled: false }

      return (
        <mesh
          position={[triangle.position.x, yPosition, triangle.position.y]}
          rotation={[-Math.PI / 2, shape.rotation || 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[triangleShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#059669' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
      )
    }

    case 'pentagon': {
      const pentagon = shape as Pentagon
      const pentagonShape = createPolygonShape(5, pentagon.size)
      const extrudeSettings = { depth: depth, bevelEnabled: false }

      return (
        <mesh
          position={[pentagon.position.x, yPosition, pentagon.position.y]}
          rotation={[-Math.PI / 2, shape.rotation || 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[pentagonShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#059669' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
      )
    }

    case 'hexagon': {
      const hexagon = shape as Hexagon
      const hexagonShape = createPolygonShape(6, hexagon.size)
      const extrudeSettings = { depth: depth, bevelEnabled: false }

      return (
        <mesh
          position={[hexagon.position.x, yPosition, hexagon.position.y]}
          rotation={[-Math.PI / 2, shape.rotation || 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[hexagonShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#059669' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
      )
    }

    case 'star': {
      const star = shape as Star
      const starShape = createStarShape(star.outerRadius, star.innerRadius, star.points)
      const extrudeSettings = { depth: depth, bevelEnabled: false }

      return (
        <mesh
          position={[star.position.x, yPosition, star.position.y]}
          rotation={[-Math.PI / 2, shape.rotation || 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[starShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#059669' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
      )
    }

    case 'heart': {
      const heart = shape as Heart
      const heartShape = createHeartShape(heart.size)
      const extrudeSettings = { depth: depth, bevelEnabled: false }

      return (
        <mesh
          position={[heart.position.x, yPosition, heart.position.y]}
          rotation={[-Math.PI / 2, shape.rotation || 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <extrudeGeometry args={[heartShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={isSelected ? '#059669' : '#000000'}
            emissiveIntensity={isSelected ? 0.2 : 0}
          />
        </mesh>
      )
    }

    case 'text': {
      const text = shape as TextShape

      return (
        <group
          position={[text.position.x, yPosition, text.position.y]}
          rotation={[0, shape.rotation || 0, 0]}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Center>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={text.fontSize}
              height={depth}
              curveSegments={12}
              bevelEnabled={false}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {text.text || 'TEXT'}
              <meshStandardMaterial
                color={color}
                emissive={isSelected ? '#166534' : '#000000'}
                emissiveIntensity={isSelected ? 0.2 : 0}
              />
            </Text3D>
          </Center>
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
  thickness?: number
  holePlacementMode?: boolean
  onHolePlaced?: (x: number, y: number) => void
  selectedHoleId?: string | null
  onHoleSelected?: (holeId: string | null) => void
  selectedBendId?: string | null
  onBendSelected?: (bendId: string | null) => void
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

// Component to render hole position labels and visual markers in 3D space
function HoleLabels({
  shape,
  displayUnit,
  fromMm,
  selectedHoleId,
  onHoleSelected,
  thickness,
}: {
  shape: Shape
  displayUnit: string
  fromMm: (v: number) => number
  selectedHoleId: string | null
  onHoleSelected?: (id: string | null) => void
  thickness: number
}) {
  if (!shape.holes || shape.holes.length === 0) return null

  const depth = thickness / 10

  // Helper to convert hole position from center-based to bottom-left based
  const holeToBottomLeft = (holePosX: number, holePosY: number): { x: number; y: number } => {
    if (shape.type === 'rectangle') {
      const rect = shape as Rectangle
      return {
        x: holePosX + rect.width / 2,
        y: holePosY + rect.height / 2,
      }
    }
    return { x: holePosX, y: holePosY }
  }

  return (
    <>
      {shape.holes.filter(h => h.type === 'circle').map(hole => {
        const bottomLeftPos = holeToBottomLeft(hole.position.x, hole.position.y)
        const worldX = shape.position.x + hole.position.x
        const worldZ = shape.position.y + hole.position.y
        const isSelected = hole.id === selectedHoleId

        const xDisplay = fromMm(bottomLeftPos.x).toFixed(1)
        const yDisplay = fromMm(bottomLeftPos.y).toFixed(1)
        const holeRadius = hole.radius || 1

        const diameter = holeRadius * 2
        const diameterDisplay = fromMm(diameter).toFixed(1)

        return (
          <group key={hole.id} position={[worldX, depth / 2, worldZ]}>
            {/* Invisible clickable area for hole selection */}
            <mesh
              onClick={e => {
                e.stopPropagation()
                if (onHoleSelected) onHoleSelected(hole.id)
              }}
              position={[0, depth / 2 + 0.05, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[holeRadius + 1, 32]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

// Component to render bend lines in 3D space
function BendLines({
  shape,
  thickness,
  selectedBendId,
  onBendSelected,
}: {
  shape: Shape
  thickness: number
  selectedBendId: string | null
  onBendSelected?: (id: string | null) => void
}) {
  if (!shape.bends || shape.bends.length === 0 || shape.type !== 'rectangle') return null

  const rect = shape as Rectangle
  const depth = thickness / 10

  return (
    <>
      {shape.bends.map(bend => {
        const isSelected = bend.id === selectedBendId

        // Calculate bend line position and dimensions
        let lineStart, lineEnd, lineLength
        if (bend.orientation === 'horizontal') {
          // Horizontal bend line (left to right)
          const yPos = bend.position - rect.height / 2 // Convert from bottom edge to center-based
          lineStart = [-rect.width / 2, 0, yPos]
          lineEnd = [rect.width / 2, 0, yPos]
          lineLength = rect.width
        } else {
          // Vertical bend line (top to bottom)
          const xPos = bend.position - rect.width / 2 // Convert from left edge to center-based
          lineStart = [xPos, 0, -rect.height / 2]
          lineEnd = [xPos, 0, rect.height / 2]
          lineLength = rect.height
        }

        // Calculate arrow position for direction indicator
        const arrowSize = Math.min(lineLength * 0.1, 5)
        const midpoint = [
          (lineStart[0] + lineEnd[0]) / 2,
          depth / 2 + 0.2,
          (lineStart[2] + lineEnd[2]) / 2,
        ]

        return (
          <group
            key={bend.id}
            position={[shape.position.x, depth / 2, shape.position.y]}
            onClick={e => {
              e.stopPropagation()
              if (onBendSelected) onBendSelected(bend.id)
            }}
          >
            {/* Bend line - using thin box instead of line geometry */}
            <mesh
              position={[(lineStart[0] + lineEnd[0]) / 2, depth / 2 + 0.1, (lineStart[2] + lineEnd[2]) / 2]}
              rotation={bend.orientation === 'horizontal' ? [0, 0, 0] : [0, Math.PI / 2, 0]}
            >
              <boxGeometry args={[lineLength, 0.3, 0.3]} />
              <meshBasicMaterial color={isSelected ? '#f97316' : '#ea580c'} />
            </mesh>

            {/* Direction arrow */}
            <mesh position={[midpoint[0], midpoint[1], midpoint[2]]}>
              <coneGeometry
                args={[
                  arrowSize * 0.3,
                  arrowSize,
                  8,
                ]}
              />
              <meshBasicMaterial color={isSelected ? '#f97316' : '#ea580c'} />
            </mesh>

            {/* Clickable area for selection */}
            <mesh position={[(lineStart[0] + lineEnd[0]) / 2, 0, (lineStart[2] + lineEnd[2]) / 2]}>
              {bend.orientation === 'horizontal' ? (
                <boxGeometry args={[lineLength, depth + 1, 1]} />
              ) : (
                <boxGeometry args={[1, depth + 1, lineLength]} />
              )}
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {/* Bend angle label */}
            <Html
              position={[midpoint[0], midpoint[1] + 2, midpoint[2]]}
              center
              distanceFactor={10}
              style={{ pointerEvents: 'none' }}
            >
              <div className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-bold shadow-lg">
                {bend.angle}° {bend.direction === 'up' ? '↑' : '↓'}
              </div>
            </Html>
          </group>
        )
      })}
    </>
  )
}

export default function DesignCanvas({
  is2DView = false,
  displayUnit = 'mm',
  thickness = 2,
  holePlacementMode = false,
  onHolePlaced,
  selectedHoleId = null,
  onHoleSelected,
  selectedBendId = null,
  onBendSelected,
}: DesignCanvasProps) {
  const { shapes, selectShape, selectedShapeId } = useDesign()
  const [controlsEnabled, setControlsEnabled] = useState(true)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)

  const handleCanvasClick = (e: ThreeEvent<MouseEvent>) => {
    // Only deselect if clicking on the background (not a shape)
    if (e.object.type === 'GridHelper' || !e.object) {
      selectShape(null)
      if (onHoleSelected) onHoleSelected(null)
    }
  }

  // Helper to convert mm to display unit
  const fromMm = (valueMm: number): number => {
    switch (displayUnit) {
      case 'mm':
        return valueMm
      case 'cm':
        return valueMm / 10
      case 'm':
        return valueMm / 1000
    }
  }

  const selectedShape = shapes.find(s => s.id === selectedShapeId)

  // Dynamic grid settings based on display unit
  const gridSettings = {
    mm: { size: 2000, cellSize: 10, sectionSize: 100, fadeDistance: 1000 },
    cm: { size: 2000, cellSize: 100, sectionSize: 1000, fadeDistance: 1000 },
    m: { size: 10000, cellSize: 1000, sectionSize: 10000, fadeDistance: 5000 },
  }

  const grid = gridSettings[displayUnit]

  // Component to show cursor coordinates
  const CursorTooltip = () => {
    const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
      const interval = setInterval(() => {
        const windowCoords = (window as any).__holePreviewCoords
        if (windowCoords) {
          setCoords(windowCoords)
        } else {
          setCoords(null)
        }
      }, 16) // ~60fps

      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY })
      }
      window.addEventListener('mousemove', handleMouseMove)

      return () => {
        clearInterval(interval)
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }, [])

    if (!coords || !holePlacementMode || !selectedShape) return null

    // Convert from center-based to bottom-left based
    const bottomLeftX = coords.x + (selectedShape.type === 'rectangle' ? (selectedShape as Rectangle).width / 2 : 0)
    const bottomLeftY = coords.y + (selectedShape.type === 'rectangle' ? (selectedShape as Rectangle).height / 2 : 0)

    return (
      <div
        style={{
          position: 'fixed',
          left: mousePos.x + 20,
          top: mousePos.y + 20,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
        className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-xl font-mono text-sm font-bold border-2 border-blue-400"
      >
        X: {fromMm(bottomLeftX).toFixed(1)} {displayUnit}
        <br />
        Y: {fromMm(bottomLeftY).toFixed(1)} {displayUnit}
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-slate-50 relative">
      <CursorTooltip />
      <Canvas
        camera={{
          position: [50, 50, 50],
          fov: 60,
          near: 0.1,
          far: 10000,
        }}
        onPointerMissed={() => selectShape(null)}
        style={{ cursor: holePlacementMode && selectedShapeId ? 'crosshair' : 'default' }}
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
          cellThickness={0.8}
          cellColor="#64748B"
          sectionSize={grid.sectionSize}
          sectionThickness={1.5}
          sectionColor="#475569"
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
        {shapes.map(shape => (
          <Shape3D
            key={shape.id}
            shape={shape}
            is2DView={is2DView}
            setControlsEnabled={setControlsEnabled}
            thickness={thickness}
            holePlacementMode={holePlacementMode}
            onHolePlaced={onHolePlaced}
            selectedHoleId={selectedHoleId}
            onHoleSelected={onHoleSelected}
          />
        ))}

        {/* Render hole labels for selected shape */}
        {selectedShape && (
          <HoleLabels
            shape={selectedShape}
            displayUnit={displayUnit}
            fromMm={fromMm}
            selectedHoleId={selectedHoleId}
            onHoleSelected={onHoleSelected}
            thickness={thickness}
          />
        )}

        {/* Render bend lines for selected shape */}
        {selectedShape && (
          <BendLines
            shape={selectedShape}
            thickness={thickness}
            selectedBendId={selectedBendId}
            onBendSelected={onBendSelected}
          />
        )}
      </Canvas>
    </div>
  )
}
