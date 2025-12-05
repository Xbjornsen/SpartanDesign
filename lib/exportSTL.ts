import * as THREE from 'three'
import { STLExporter } from 'three/addons/exporters/STLExporter.js'
import { Shape, Rectangle, Circle, Triangle, Pentagon, Hexagon, Star, Heart, Text as TextShape } from './types'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'

/**
 * Helper to create regular polygon shape
 */
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

/**
 * Helper to create star shape
 */
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

/**
 * Helper to create heart shape
 */
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

/**
 * Create Three.js mesh from shape definition
 */
function createMeshFromShape(shape: Shape, thickness: number): THREE.Mesh | null {
  let geometry: THREE.BufferGeometry | null = null

  switch (shape.type) {
    case 'rectangle': {
      const rect = shape as Rectangle

      // Create basic box geometry
      if (!rect.cornerRadius) {
        geometry = new THREE.BoxGeometry(rect.width, thickness, rect.height)
      } else {
        // Rounded rectangle using ExtrudeGeometry
        const roundedRect = new THREE.Shape()
        const r = rect.cornerRadius
        const w = rect.width / 2
        const h = rect.height / 2

        roundedRect.moveTo(-w + r, -h)
        roundedRect.lineTo(w - r, -h)
        roundedRect.quadraticCurveTo(w, -h, w, -h + r)
        roundedRect.lineTo(w, h - r)
        roundedRect.quadraticCurveTo(w, h, w - r, h)
        roundedRect.lineTo(-w + r, h)
        roundedRect.quadraticCurveTo(-w, h, -w, h - r)
        roundedRect.lineTo(-w, -h + r)
        roundedRect.quadraticCurveTo(-w, -h, -w + r, -h)

        const extrudeSettings = {
          depth: thickness,
          bevelEnabled: false,
        }

        geometry = new THREE.ExtrudeGeometry(roundedRect, extrudeSettings)
        // Rotate to align with XY plane
        geometry.rotateX(-Math.PI / 2)
      }

      // Apply holes using CSG if present
      if (rect.holes && rect.holes.length > 0 && geometry) {
        try {
          let baseBrush = new Brush(geometry)
          baseBrush.updateMatrixWorld()

          const evaluator = new Evaluator()

          rect.holes.forEach(hole => {
            let holeGeometry: THREE.BufferGeometry

            if (hole.type === 'circle' && hole.radius) {
              holeGeometry = new THREE.CylinderGeometry(
                hole.radius,
                hole.radius,
                thickness * 1.2, // Slightly longer to ensure complete cut
                32
              )
              // Rotate to align with Y axis
              holeGeometry.rotateX(Math.PI / 2)
            } else if (hole.type === 'rectangle' && hole.width && hole.height) {
              holeGeometry = new THREE.BoxGeometry(hole.width, thickness * 1.2, hole.height)
            } else {
              return
            }

            // Position hole relative to shape
            const holeBrush = new Brush(holeGeometry)
            holeBrush.position.set(hole.position.x, 0, hole.position.y)
            holeBrush.updateMatrixWorld()

            // Subtract hole from base
            const result = evaluator.evaluate(baseBrush, holeBrush, SUBTRACTION)
            baseBrush = new Brush(result)
          })

          geometry = baseBrush.geometry
        } catch (error) {
          console.warn('CSG hole operation failed, exporting without holes:', error)
        }
      }

      break
    }

    case 'circle': {
      const circle = shape as Circle
      geometry = new THREE.CylinderGeometry(circle.radius, circle.radius, thickness, 64)
      geometry.rotateX(Math.PI / 2)

      // Apply holes if present
      if (circle.holes && circle.holes.length > 0) {
        try {
          let baseBrush = new Brush(geometry)
          baseBrush.updateMatrixWorld()
          const evaluator = new Evaluator()

          circle.holes.forEach(hole => {
            if (hole.type === 'circle' && hole.radius) {
              const holeGeometry = new THREE.CylinderGeometry(
                hole.radius,
                hole.radius,
                thickness * 1.2,
                32
              )
              holeGeometry.rotateX(Math.PI / 2)

              const holeBrush = new Brush(holeGeometry)
              holeBrush.position.set(hole.position.x, 0, hole.position.y)
              holeBrush.updateMatrixWorld()

              const result = evaluator.evaluate(baseBrush, holeBrush, SUBTRACTION)
              baseBrush = new Brush(result)
            }
          })

          geometry = baseBrush.geometry
        } catch (error) {
          console.warn('CSG hole operation failed, exporting without holes:', error)
        }
      }

      break
    }

    case 'triangle': {
      const triangle = shape as Triangle
      const triangleShape = createPolygonShape(3, triangle.size)
      const extrudeSettings = { depth: thickness, bevelEnabled: false }
      geometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings)
      geometry.rotateX(-Math.PI / 2)
      break
    }

    case 'pentagon': {
      const pentagon = shape as Pentagon
      const pentagonShape = createPolygonShape(5, pentagon.size)
      const extrudeSettings = { depth: thickness, bevelEnabled: false }
      geometry = new THREE.ExtrudeGeometry(pentagonShape, extrudeSettings)
      geometry.rotateX(-Math.PI / 2)
      break
    }

    case 'hexagon': {
      const hexagon = shape as Hexagon
      const hexagonShape = createPolygonShape(6, hexagon.size)
      const extrudeSettings = { depth: thickness, bevelEnabled: false }
      geometry = new THREE.ExtrudeGeometry(hexagonShape, extrudeSettings)
      geometry.rotateX(-Math.PI / 2)
      break
    }

    case 'star': {
      const star = shape as Star
      const starShape = createStarShape(star.outerRadius, star.innerRadius, star.points)
      const extrudeSettings = { depth: thickness, bevelEnabled: false }
      geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings)
      geometry.rotateX(-Math.PI / 2)
      break
    }

    case 'heart': {
      const heart = shape as Heart
      const heartShape = createHeartShape(heart.size)
      const extrudeSettings = { depth: thickness, bevelEnabled: false }
      geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings)
      geometry.rotateX(-Math.PI / 2)
      break
    }

    case 'text': {
      // Text shapes are not easily exportable to STL without the font file
      // We'll skip them for now
      console.warn('Text shapes are not supported in STL export')
      return null
    }

    default:
      return null
  }

  if (!geometry) return null

  const material = new THREE.MeshStandardMaterial({ color: 0x808080 })
  const mesh = new THREE.Mesh(geometry, material)

  // Apply shape position and rotation
  mesh.position.set(shape.position.x, 0, shape.position.y)
  if (shape.rotation) {
    mesh.rotation.y = shape.rotation
  }

  return mesh
}

/**
 * Export shapes to STL format
 */
export function exportToSTL(shapes: Shape[], thickness: number = 2): ArrayBuffer {
  const scene = new THREE.Scene()

  // Create meshes for all shapes
  let meshCount = 0
  shapes.forEach(shape => {
    const mesh = createMeshFromShape(shape, thickness)
    if (mesh) {
      scene.add(mesh)
      meshCount++
    }
  })

  if (meshCount === 0) {
    throw new Error('No valid shapes to export')
  }

  // Export to STL
  const exporter = new STLExporter()
  const stlBinary = exporter.parse(scene, { binary: true })

  return stlBinary as ArrayBuffer
}

/**
 * Download STL file
 */
export function downloadSTL(shapes: Shape[], thickness: number, filename: string = 'design.stl') {
  try {
    const stlData = exportToSTL(shapes, thickness)
    const blob = new Blob([stlData], { type: 'application/octet-stream' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('STL export failed:', error)
    throw error
  }
}
