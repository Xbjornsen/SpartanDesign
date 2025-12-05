# Implementation Prompt: Week 1 Critical Improvements

## Project Overview

**SpartanDesign** is a Next.js 16 + React Three Fiber web-based 3D CAD application for laser cutting and sheet metal design. It's built with TypeScript, React 19, and uses Three.js for 3D rendering.

**Current State:**
- Working laser cutting design tool with 8 shape types
- Sheet metal features (holes, bends with 3D visualization)
- SVG export + bend instructions export
- Material selection + instant quoting
- Job submission workflow

**Problem:**
- Main designer file is 1875 lines (unmaintainable)
- Missing critical UX features (drag-to-move, auto-save)
- No 3D export formats (STL)
- Rotation property defined but not editable in UI

**Tech Stack:**
- Next.js 16.0.3 (App Router)
- React 19.2.0
- TypeScript 5.9.3
- React Three Fiber 9.4.0 + Three.js 0.181.1
- @react-three/drei 10.7.7
- Tailwind CSS 4.1.17
- three-bvh-csg 0.0.17

---

## Tasks Overview

Implement 5 critical improvements in priority order:

1. ✅ **Refactor designer page** - Split 1875-line monolith into maintainable modules
2. ✅ **Add drag-to-move** - Biggest UX improvement for lowest effort
3. ✅ **Implement auto-save** - Prevent data loss on browser refresh
4. ✅ **Add STL export** - Unlock 3D printing market
5. ✅ **Fix rotation UI** - Make existing rotation property editable

**Estimated Total Time:** 4-6 days
**Priority:** Complete in order listed (easiest first for quick wins)

---

## 🎯 TASK 1: Fix Rotation UI (Priority: Quick Win)

### Problem
The `rotation` property exists in shape type definitions (`lib/types.ts:44`) but there's no UI to edit it. Users cannot rotate shapes.

### Goal
Add rotation input to properties panel and apply rotation to shape rendering.

### Files to Modify
- `app/designer/page.tsx` (add rotation input in properties panel)
- `components/DesignCanvas.tsx` (apply rotation to mesh rendering)

### Implementation Steps

#### Step 1: Add Rotation Input to Properties Panel

In `app/designer/page.tsx`, find the section where shape properties are edited (around width/height inputs) and add:

```typescript
{/* Rotation Control */}
<div className="space-y-2">
  <label className="block text-sm font-medium">
    Rotation (degrees)
  </label>
  <input
    type="number"
    min="0"
    max="360"
    step="1"
    value={
      selectedShape.rotation
        ? Math.round((selectedShape.rotation * 180) / Math.PI)
        : 0
    }
    onChange={(e) => {
      const degrees = parseFloat(e.target.value) || 0
      const radians = (degrees * Math.PI) / 180
      updateShape(selectedShape.id, { rotation: radians })
    }}
    className="w-full px-3 py-2 border rounded-md"
  />
</div>
```

#### Step 2: Apply Rotation in Shape Rendering

In `components/DesignCanvas.tsx`, find each shape rendering (Rectangle, Circle, etc.) and ensure the mesh has rotation applied:

```typescript
// Example for Rectangle rendering
<mesh
  position={[shape.position.x, shape.position.y, depth / 2]}
  rotation={[0, 0, shape.rotation || 0]}  // Add this line
  onClick={handleClick}
  onPointerOver={handlePointerOver}
  onPointerOut={handlePointerOut}
>
  <boxGeometry args={[rect.width, rect.height, depth]} />
  <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
</mesh>
```

Apply the same pattern to all shape types (Circle, Triangle, Pentagon, Hexagon, Star, Heart, Text).

### Acceptance Criteria
- [ ] Rotation input appears in properties panel for selected shape
- [ ] Input displays current rotation in degrees (0-360)
- [ ] Changing value rotates shape visually in 3D canvas
- [ ] Rotation persists when switching between shapes
- [ ] Works with undo/redo
- [ ] Rotation is included in SVG export
- [ ] No TypeScript errors

### Testing
1. Select a rectangle
2. Set rotation to 45 degrees
3. Verify shape rotates visually
4. Deselect and reselect - rotation value should persist
5. Undo (Ctrl+Z) - rotation should revert
6. Export SVG - check if rotation is applied

---

## 🎯 TASK 2: Implement Auto-Save (Priority: Quick Win)

### Problem
Designs are lost when user refreshes browser or closes tab accidentally. No persistence mechanism exists.

### Goal
Auto-save design to localStorage every 30 seconds and prompt user to restore on page load.

### Files to Create/Modify
- `app/designer/page.tsx` (add auto-save logic)
- Create new component: `components/AutoSaveIndicator.tsx`

### Implementation Steps

#### Step 1: Create Auto-Save Hook

Add this custom hook in `app/designer/page.tsx` or create `hooks/useAutoSave.ts`:

```typescript
function useAutoSave(shapes: Shape[], material: Material, interval = 30000) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    // Check for existing autosave on mount
    const checkAutosave = () => {
      const autosaveKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('autosave_'))
        .sort()
        .reverse()

      if (autosaveKeys.length > 0) {
        const latestKey = autosaveKeys[0]
        const timestamp = parseInt(latestKey.replace('autosave_', ''))
        const savedData = localStorage.getItem(latestKey)

        if (savedData && shapes.length === 0) {
          const shouldRestore = confirm(
            `Found autosaved design from ${new Date(timestamp).toLocaleString()}.\n\nRestore it?`
          )

          if (shouldRestore) {
            const { shapes: savedShapes, material: savedMaterial } = JSON.parse(savedData)
            // Restore logic here - you'll need to implement this
            console.log('Restoring autosaved design:', savedShapes)
          }
        }
      }
    }

    checkAutosave()
  }, [])

  useEffect(() => {
    if (shapes.length === 0) return

    const timer = setInterval(() => {
      const timestamp = Date.now()
      const autosaveData = {
        shapes,
        material,
        timestamp
      }

      localStorage.setItem(`autosave_${timestamp}`, JSON.stringify(autosaveData))
      setLastSaved(new Date())

      // Clean up old autosaves (keep last 5)
      const autosaveKeys = Object.keys(localStorage)
        .filter(key => key.startsWith('autosave_'))
        .sort()

      if (autosaveKeys.length > 5) {
        autosaveKeys.slice(0, -5).forEach(key => {
          localStorage.removeItem(key)
        })
      }

      console.log('Design auto-saved at', new Date().toLocaleTimeString())
    }, interval)

    return () => clearInterval(timer)
  }, [shapes, material, interval])

  return lastSaved
}
```

#### Step 2: Integrate Auto-Save in Designer Page

In `DesignerContent` component:

```typescript
function DesignerContent() {
  const { shapes, material, /* ... other hooks */ } = useDesign()
  const lastSaved = useAutoSave(shapes, material, 30000) // 30 seconds

  // ... rest of component
}
```

#### Step 3: Create Auto-Save Indicator Component

Create `components/AutoSaveIndicator.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'

interface AutoSaveIndicatorProps {
  lastSaved: Date | null
}

export default function AutoSaveIndicator({ lastSaved }: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('Never')

  useEffect(() => {
    if (!lastSaved) return

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)

      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)}h ago`)
      }
    }

    updateTimeAgo()
    const timer = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(timer)
  }, [lastSaved])

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      {lastSaved ? (
        <span>💾 Saved {timeAgo}</span>
      ) : (
        <span>No autosave yet</span>
      )}
    </div>
  )
}
```

#### Step 4: Add Indicator to UI

In `app/designer/page.tsx`, add the indicator to the header or sidebar:

```typescript
<div className="flex items-center gap-4">
  <AutoSaveIndicator lastSaved={lastSaved} />
  {/* ... other header items */}
</div>
```

#### Step 5: Implement Restore Functionality

You'll need to add a method to restore designs. In the DesignContext or page:

```typescript
const restoreFromAutosave = (savedShapes: Shape[], savedMaterial: Material) => {
  // Clear current design
  clearDesign()

  // Restore shapes
  savedShapes.forEach(shape => {
    addShape(shape)
  })

  // Restore material
  setMaterial(savedMaterial)
}
```

### Acceptance Criteria
- [ ] Auto-saves every 30 seconds (only when shapes exist)
- [ ] Shows "Saved Xs ago" indicator in UI
- [ ] On page load with empty design, prompts to restore autosave
- [ ] Keeps last 5 autosaves, deletes older ones
- [ ] Doesn't interfere with normal workflow
- [ ] Works with undo/redo
- [ ] Console logs auto-save events for debugging

### Testing
1. Create a design with 2-3 shapes
2. Wait 30 seconds, verify console log "Design auto-saved"
3. Check localStorage - should see `autosave_[timestamp]` key
4. Refresh page (Ctrl+R)
5. Confirm restoration prompt appears
6. Click "OK" - design should be restored
7. Create 10 autosaves - verify only last 5 are kept

---

## 🎯 TASK 3: Add STL Export (Priority: High Impact)

### Problem
Can only export SVG (2D laser cutting). No 3D export format for 3D printing, which is a huge market.

### Goal
Add STL export functionality to export 3D designs for 3D printing.

### Files to Modify/Create
- Create: `lib/exportSTL.ts`
- Modify: `app/designer/page.tsx` (add Export STL button)

### Implementation Steps

#### Step 1: Create STL Export Utility

Create `lib/exportSTL.ts`:

```typescript
import * as THREE from 'three'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
import { Shape, Rectangle, Circle } from './types'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'

/**
 * Create Three.js mesh from shape definition
 */
function createMeshFromShape(shape: Shape, thickness: number): THREE.Mesh | null {
  let geometry: THREE.BufferGeometry | null = null

  switch (shape.type) {
    case 'rectangle': {
      const rect = shape as Rectangle

      // Basic box geometry
      if (!rect.cornerRadius) {
        geometry = new THREE.BoxGeometry(rect.width, rect.height, thickness)
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

        geometry = new THREE.ExtrudeGeometry(roundedRect, {
          depth: thickness,
          bevelEnabled: false
        })
      }

      // Apply holes using CSG if present
      if (rect.holes && rect.holes.length > 0) {
        let baseBrush = new Brush(geometry)
        baseBrush.updateMatrixWorld()

        const evaluator = new Evaluator()

        rect.holes.forEach(hole => {
          let holeGeometry: THREE.BufferGeometry

          if (hole.type === 'circle') {
            holeGeometry = new THREE.CylinderGeometry(
              hole.radius,
              hole.radius,
              thickness * 1.1, // Slightly longer to ensure complete cut
              32
            )
            // Rotate to align with Z axis
            holeGeometry.rotateX(Math.PI / 2)
          } else {
            // Rectangle hole
            holeGeometry = new THREE.BoxGeometry(
              hole.width!,
              hole.height!,
              thickness * 1.1
            )
          }

          // Position hole relative to shape
          const holeBrush = new Brush(holeGeometry)
          holeBrush.position.set(hole.position.x, hole.position.y, 0)
          holeBrush.updateMatrixWorld()

          // Subtract hole from base
          baseBrush = new Brush(evaluator.evaluate(baseBrush, holeBrush, SUBTRACTION))
        })

        geometry = baseBrush.geometry
      }

      break
    }

    case 'circle': {
      const circle = shape as Circle
      geometry = new THREE.CylinderGeometry(
        circle.radius,
        circle.radius,
        thickness,
        32
      )
      geometry.rotateX(Math.PI / 2)

      // Apply holes if present
      if (circle.holes && circle.holes.length > 0) {
        let baseBrush = new Brush(geometry)
        baseBrush.updateMatrixWorld()
        const evaluator = new Evaluator()

        circle.holes.forEach(hole => {
          const holeGeometry = new THREE.CylinderGeometry(
            hole.radius!,
            hole.radius!,
            thickness * 1.1,
            32
          )
          holeGeometry.rotateX(Math.PI / 2)

          const holeBrush = new Brush(holeGeometry)
          holeBrush.position.set(hole.position.x, hole.position.y, 0)
          holeBrush.updateMatrixWorld()

          baseBrush = new Brush(evaluator.evaluate(baseBrush, holeBrush, SUBTRACTION))
        })

        geometry = baseBrush.geometry
      }

      break
    }

    case 'triangle':
    case 'pentagon':
    case 'hexagon':
    case 'star':
    case 'heart': {
      // For other shapes, you'll need to implement their geometry creation
      // For now, return null or basic placeholder
      console.warn(`STL export not fully implemented for ${shape.type}`)
      return null
    }

    default:
      return null
  }

  if (!geometry) return null

  const material = new THREE.MeshStandardMaterial({ color: 0x808080 })
  const mesh = new THREE.Mesh(geometry, material)

  // Apply shape position and rotation
  mesh.position.set(shape.position.x, shape.position.y, 0)
  if (shape.rotation) {
    mesh.rotation.z = shape.rotation
  }

  return mesh
}

/**
 * Export shapes to STL format
 */
export function exportToSTL(shapes: Shape[], thickness: number = 2): ArrayBuffer {
  const scene = new THREE.Scene()

  // Create meshes for all shapes
  shapes.forEach(shape => {
    const mesh = createMeshFromShape(shape, thickness)
    if (mesh) {
      scene.add(mesh)
    }
  })

  // Export to STL
  const exporter = new STLExporter()
  const stlBinary = exporter.parse(scene, { binary: true })

  return stlBinary as ArrayBuffer
}

/**
 * Download STL file
 */
export function downloadSTL(shapes: Shape[], thickness: number, filename: string = 'design.stl') {
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
}
```

#### Step 2: Add Export STL Button

In `app/designer/page.tsx`, add a button next to "Export SVG":

```typescript
{/* Export STL Button */}
<button
  onClick={() => {
    if (shapes.length === 0) {
      alert('No shapes to export')
      return
    }

    try {
      downloadSTL(shapes, selectedThickness, 'design.stl')
    } catch (error) {
      console.error('STL export failed:', error)
      alert('Failed to export STL. See console for details.')
    }
  }}
  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
>
  Export STL
</button>
```

#### Step 3: Import Required Dependencies

At the top of `lib/exportSTL.ts`, ensure proper imports:

```typescript
// You may need to add this to next.config.js or use dynamic import
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'
```

If you get module resolution errors, you may need to use dynamic import:

```typescript
export async function exportToSTL(shapes: Shape[], thickness: number = 2): Promise<ArrayBuffer> {
  const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter')
  // ... rest of function
}
```

### Acceptance Criteria
- [ ] "Export STL" button appears in header
- [ ] Clicking exports binary STL file
- [ ] File downloads with `.stl` extension
- [ ] Rectangles export correctly
- [ ] Circles export correctly
- [ ] Holes are cut out in exported geometry (not just visual)
- [ ] Shape positions are correct in exported file
- [ ] Rotation is applied correctly
- [ ] File can be opened in Cura, PrusaSlicer, or other slicer
- [ ] No console errors during export

### Testing
1. Create a design with rectangle + circle
2. Add 2-3 holes to rectangle
3. Click "Export STL"
4. Verify file downloads
5. Open in 3D printer slicer software (Cura, PrusaSlicer, etc.)
6. Verify:
   - Shapes appear in correct positions
   - Holes are actual cutouts (not solid)
   - Geometry is manifold (no errors)
   - Can slice for printing

---

## 🎯 TASK 4: Add Drag-to-Move (Priority: Major UX Improvement)

### Problem
Users cannot drag shapes to move them. Must use numeric input fields, which is slow and unintuitive for a CAD tool.

### Goal
Enable click-and-drag to move shapes on the canvas using transform gizmos.

### Files to Modify
- `components/DesignCanvas.tsx` (add TransformControls)
- `app/designer/page.tsx` (manage transform mode state)

### Implementation Steps

#### Step 1: Add Transform Controls to DesignCanvas

In `components/DesignCanvas.tsx`, import TransformControls:

```typescript
import { OrbitControls, Grid, Html, Text3D, Center, TransformControls } from '@react-three/drei'
```

#### Step 2: Create Transform Controls Component

Add this component in `DesignCanvas.tsx`:

```typescript
interface TransformGizmoProps {
  shapeId: string
  position: { x: number; y: number }
  onTransform: (newPosition: { x: number; y: number }) => void
  onTransformEnd: () => void
}

function TransformGizmo({ shapeId, position, onTransform, onTransformEnd }: TransformGizmoProps) {
  const controlsRef = useRef<any>()
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(position.x, position.y, 0)
    }
  }, [position])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const handleChange = () => {
      if (meshRef.current) {
        const newPos = meshRef.current.position
        onTransform({ x: newPos.x, y: newPos.y })
      }
    }

    const handleMouseUp = () => {
      onTransformEnd()
    }

    controls.addEventListener('change', handleChange)
    controls.addEventListener('mouseUp', handleMouseUp)

    return () => {
      controls.removeEventListener('change', handleChange)
      controls.removeEventListener('mouseUp', handleMouseUp)
    }
  }, [onTransform, onTransformEnd])

  return (
    <TransformControls
      ref={controlsRef}
      mode="translate"
      translationSnap={1} // 1mm snap
    >
      <mesh ref={meshRef} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </TransformControls>
  )
}
```

#### Step 3: Add Transform State Management

In `app/designer/page.tsx`, add state for transform mode:

```typescript
const [enableTransform, setEnableTransform] = useState(true)
```

#### Step 4: Integrate Transform Controls in DesignCanvas

Modify the `DesignCanvas` component to accept and use transform controls:

```typescript
interface DesignCanvasProps {
  // ... existing props
  enableTransform?: boolean
  onShapeTransform?: (shapeId: string, position: { x: number; y: number }) => void
}

export default function DesignCanvas({
  // ... existing props
  enableTransform = false,
  onShapeTransform
}: DesignCanvasProps) {
  // ... existing code

  return (
    <Canvas>
      {/* ... existing canvas content */}

      {/* Add transform controls for selected shape */}
      {enableTransform && selectedShapeId && selectedShape && (
        <TransformGizmo
          shapeId={selectedShapeId}
          position={selectedShape.position}
          onTransform={(newPosition) => {
            if (onShapeTransform) {
              onShapeTransform(selectedShapeId, newPosition)
            }
          }}
          onTransformEnd={() => {
            // Optional: trigger history push on drag end
            console.log('Transform completed')
          }}
        />
      )}
    </Canvas>
  )
}
```

#### Step 5: Connect Transform to Designer Page

In `app/designer/page.tsx`, wire up the transform callback:

```typescript
<DesignCanvas
  shapes={shapes}
  selectedShapeId={selectedShapeId}
  selectShape={selectShape}
  updateShape={updateShape}
  enableTransform={!holePlacementMode} // Disable during hole placement
  onShapeTransform={(shapeId, newPosition) => {
    updateShape(shapeId, { position: newPosition })
  }}
  // ... other props
/>
```

#### Step 6: Add Toggle for Transform Mode (Optional)

Add a button to toggle transform gizmo on/off:

```typescript
<button
  onClick={() => setEnableTransform(!enableTransform)}
  className={`px-3 py-1 rounded ${enableTransform ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
>
  Move Tool {enableTransform ? '✓' : ''}
</button>
```

#### Step 7: Disable Orbit Controls During Transform

To prevent camera movement while dragging, modify OrbitControls:

```typescript
<OrbitControls
  enabled={!holePlacementMode} // Already exists
  makeDefault
  enableRotate={!holePlacementMode}
  enablePan={!holePlacementMode}
  // Prevent conflicts with transform controls
  enableDamping={false}
/>
```

### Acceptance Criteria
- [ ] Clicking a shape shows transform gizmo (arrows)
- [ ] Dragging gizmo moves shape smoothly
- [ ] Shape position updates in real-time
- [ ] Orbit controls disabled during drag (no camera movement)
- [ ] Works with grid snapping (1mm increments)
- [ ] Transform ends on mouse release
- [ ] Works with undo/redo
- [ ] Doesn't interfere with hole placement mode
- [ ] Shape stays selected after transform

### Testing
1. Select a rectangle
2. Verify transform gizmo appears (red/green arrows)
3. Drag the gizmo - shape should move
4. Verify position updates in properties panel
5. Release mouse - shape stays in new position
6. Press Ctrl+Z - shape returns to original position
7. Enter hole placement mode - gizmo should disappear
8. Exit hole placement mode - gizmo should reappear

---

## 🎯 TASK 5: Refactor Designer Page (Priority: Foundation)

### Problem
`app/designer/page.tsx` is 1875 lines - a monolithic component that's hard to maintain, test, and extend.

### Goal
Split into focused, maintainable components (<300 lines each) with clear responsibilities.

### Target Architecture

```
app/designer/
  page.tsx (200-300 lines)           # Orchestration only
  components/
    Toolbar.tsx                       # Top toolbar with mode switches
    PropertiesPanel/
      index.tsx                       # Main sidebar container
      ShapeProperties.tsx             # Width, height, rotation inputs
      HoleManager.tsx                 # Hole placement and editing
      BendManager.tsx                 # Bend line management
      MaterialSelector.tsx            # Material and thickness
      QuickActions.tsx                # Lock, delete, export buttons
    modals/
      SubmitJobModal.tsx             # Already exists, move here
      QuoteModal.tsx                 # Create if doesn't exist
  hooks/
    useShapeManipulation.ts          # Shape CRUD operations
    useKeyboardShortcuts.ts          # Undo/redo/delete shortcuts
    useHolePlacement.ts              # Hole placement logic
```

### Implementation Steps

#### Step 1: Create Hooks Directory and Extract Logic

Create `app/designer/hooks/useKeyboardShortcuts.ts`:

```typescript
'use client'

import { useEffect } from 'react'

interface UseKeyboardShortcutsProps {
  onUndo: () => void
  onRedo: () => void
  onDelete?: () => void
  canUndo: boolean
  canRedo: boolean
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  canUndo,
  canRedo,
  enabled = true
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) onUndo()
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        (e.ctrlKey && e.key === 'y')
      ) {
        e.preventDefault()
        if (canRedo) onRedo()
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && onDelete) {
        e.preventDefault()
        onDelete()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onUndo, onRedo, onDelete, canUndo, canRedo, enabled])
}
```

Create `app/designer/hooks/useHolePlacement.ts`:

```typescript
'use client'

import { useState } from 'react'
import { Hole } from '@/lib/types'

export function useHolePlacement() {
  const [holePlacementMode, setHolePlacementMode] = useState(false)
  const [selectedHoleId, setSelectedHoleId] = useState<string | null>(null)
  const [lastHoleDiameterMm, setLastHoleDiameterMm] = useState(5)
  const [snapToGrid, setSnapToGrid] = useState<'off' | 'center' | '1mm' | '0.05in'>('off')

  const toggleHolePlacementMode = () => {
    setHolePlacementMode(!holePlacementMode)
    if (holePlacementMode) {
      setSelectedHoleId(null)
    }
  }

  const selectHole = (holeId: string | null) => {
    setSelectedHoleId(holeId)
  }

  const setHoleDiameter = (diameter: number) => {
    setLastHoleDiameterMm(diameter)
  }

  return {
    holePlacementMode,
    selectedHoleId,
    lastHoleDiameterMm,
    snapToGrid,
    toggleHolePlacementMode,
    selectHole,
    setHoleDiameter,
    setSnapToGrid
  }
}
```

#### Step 2: Create Material Selector Component

Create `app/designer/components/PropertiesPanel/MaterialSelector.tsx`:

```typescript
'use client'

import { Material } from '@/lib/types'

interface MaterialSelectorProps {
  materials: Material[]
  selectedMetalType: string
  selectedThickness: number
  onMetalTypeChange: (type: string) => void
  onThicknessChange: (thickness: number) => void
}

export default function MaterialSelector({
  materials,
  selectedMetalType,
  selectedThickness,
  onMetalTypeChange,
  onThicknessChange
}: MaterialSelectorProps) {
  const metalTypes = Array.from(new Set(materials.map(m => m.name)))
  const availableThicknesses = materials
    .filter(m => m.name === selectedMetalType)
    .map(m => m.thickness)
    .sort((a, b) => a - b)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Material Selection</h3>

      {/* Metal Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Metal Type</label>
        <div className="space-y-2">
          {metalTypes.map(type => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                name="metalType"
                value={type}
                checked={selectedMetalType === type}
                onChange={(e) => onMetalTypeChange(e.target.value)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Thickness */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Thickness</label>
        <select
          value={selectedThickness}
          onChange={(e) => onThicknessChange(parseFloat(e.target.value))}
          className="w-full px-3 py-2 border rounded-md"
        >
          {availableThicknesses.map(thickness => (
            <option key={thickness} value={thickness}>
              {thickness}mm
            </option>
          ))}
        </select>
      </div>

      {/* Current Selection Display */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
        <p className="text-sm">
          <strong>Selected:</strong> {selectedMetalType} - {selectedThickness}mm
        </p>
      </div>
    </div>
  )
}
```

#### Step 3: Create Shape Properties Component

Create `app/designer/components/PropertiesPanel/ShapeProperties.tsx`:

```typescript
'use client'

import { Shape, Rectangle, Circle, Text as TextShape } from '@/lib/types'

interface ShapePropertiesProps {
  shape: Shape
  displayUnit: 'mm' | 'cm' | 'm'
  onUpdate: (updates: Partial<Shape>) => void
}

export default function ShapeProperties({
  shape,
  displayUnit,
  onUpdate
}: ShapePropertiesProps) {
  const toMm = (value: number, unit: string) => {
    if (unit === 'cm') return value * 10
    if (unit === 'm') return value * 1000
    return value
  }

  const fromMm = (value: number, unit: string) => {
    if (unit === 'cm') return value / 10
    if (unit === 'm') return value / 1000
    return value
  }

  if (shape.type === 'rectangle') {
    const rect = shape as Rectangle

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Rectangle Properties</h3>

        {/* Width */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Width ({displayUnit})
          </label>
          <input
            type="number"
            value={fromMm(rect.width, displayUnit)}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0
              onUpdate({ width: toMm(value, displayUnit) } as Partial<Rectangle>)
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Height */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Height ({displayUnit})
          </label>
          <input
            type="number"
            value={fromMm(rect.height, displayUnit)}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0
              onUpdate({ height: toMm(value, displayUnit) } as Partial<Rectangle>)
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Corner Radius */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Corner Radius ({displayUnit})
          </label>
          <input
            type="number"
            min="0"
            value={fromMm(rect.cornerRadius || 0, displayUnit)}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0
              onUpdate({ cornerRadius: toMm(value, displayUnit) } as Partial<Rectangle>)
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Rotation (degrees)
          </label>
          <input
            type="number"
            min="0"
            max="360"
            value={shape.rotation ? Math.round((shape.rotation * 180) / Math.PI) : 0}
            onChange={(e) => {
              const degrees = parseFloat(e.target.value) || 0
              const radians = (degrees * Math.PI) / 180
              onUpdate({ rotation: radians })
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    )
  }

  if (shape.type === 'circle') {
    const circle = shape as Circle

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Circle Properties</h3>

        {/* Diameter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Diameter ({displayUnit})
          </label>
          <input
            type="number"
            value={fromMm(circle.radius * 2, displayUnit)}
            onChange={(e) => {
              const diameter = parseFloat(e.target.value) || 0
              onUpdate({ radius: toMm(diameter, displayUnit) / 2 } as Partial<Circle>)
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Rotation (degrees)
          </label>
          <input
            type="number"
            min="0"
            max="360"
            value={shape.rotation ? Math.round((shape.rotation * 180) / Math.PI) : 0}
            onChange={(e) => {
              const degrees = parseFloat(e.target.value) || 0
              const radians = (degrees * Math.PI) / 180
              onUpdate({ rotation: radians })
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    )
  }

  if (shape.type === 'text') {
    const text = shape as TextShape

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Text Properties</h3>

        {/* Text Content */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Text</label>
          <input
            type="text"
            value={text.text}
            onChange={(e) => {
              onUpdate({ text: e.target.value } as Partial<TextShape>)
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Font Size</label>
          <input
            type="number"
            min="1"
            value={text.fontSize}
            onChange={(e) => {
              const size = parseFloat(e.target.value) || 12
              onUpdate({ fontSize: size } as Partial<TextShape>)
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{shape.type} Properties</h3>
      <p className="text-sm text-gray-600">
        Properties panel not implemented for {shape.type} yet.
      </p>
    </div>
  )
}
```

#### Step 4: Create Properties Panel Container

Create `app/designer/components/PropertiesPanel/index.tsx`:

```typescript
'use client'

import { Shape, Material } from '@/lib/types'
import ShapeProperties from './ShapeProperties'
import MaterialSelector from './MaterialSelector'

interface PropertiesPanelProps {
  selectedShape: Shape | null
  shapes: Shape[]
  materials: Material[]
  selectedMetalType: string
  selectedThickness: number
  displayUnit: 'mm' | 'cm' | 'm'
  onShapeUpdate: (updates: Partial<Shape>) => void
  onMetalTypeChange: (type: string) => void
  onThicknessChange: (thickness: number) => void
}

export default function PropertiesPanel({
  selectedShape,
  shapes,
  materials,
  selectedMetalType,
  selectedThickness,
  displayUnit,
  onShapeUpdate,
  onMetalTypeChange,
  onThicknessChange
}: PropertiesPanelProps) {
  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r overflow-y-auto p-4 space-y-6">
      {/* Material Selection */}
      <MaterialSelector
        materials={materials}
        selectedMetalType={selectedMetalType}
        selectedThickness={selectedThickness}
        onMetalTypeChange={onMetalTypeChange}
        onThicknessChange={onThicknessChange}
      />

      {/* Shape Properties */}
      {selectedShape && (
        <>
          <div className="border-t pt-4" />
          <ShapeProperties
            shape={selectedShape}
            displayUnit={displayUnit}
            onUpdate={onShapeUpdate}
          />
        </>
      )}

      {/* Design Info */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-lg mb-2">Design Info</h3>
        <p className="text-sm text-gray-600">
          Total shapes: {shapes.length}
        </p>
        {selectedShape && (
          <p className="text-sm text-gray-600">
            Selected: {selectedShape.type}
            {selectedShape.locked && ' (Locked)'}
          </p>
        )}
      </div>
    </div>
  )
}
```

#### Step 5: Refactor Main Page to Use New Components

Modify `app/designer/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import DesignCanvas from '@/components/DesignCanvas'
import { DesignProvider, useDesign } from '@/lib/designContext'
import PropertiesPanel from './components/PropertiesPanel'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useHolePlacement } from './hooks/useHolePlacement'
// ... other imports

function DesignerContent() {
  const {
    addShape,
    shapes,
    material,
    selectedShapeId,
    selectShape,
    updateShape,
    removeShape,
    undo,
    redo,
    canUndo,
    canRedo
  } = useDesign()

  const [displayUnit, setDisplayUnit] = useState<'mm' | 'cm' | 'm'>('mm')
  const [selectedMetalType, setSelectedMetalType] = useState('Mild Steel')
  const [selectedThickness, setSelectedThickness] = useState(2)
  const [is2DView, setIs2DView] = useState(true)

  const {
    holePlacementMode,
    selectedHoleId,
    lastHoleDiameterMm,
    snapToGrid,
    toggleHolePlacementMode,
    selectHole,
    setHoleDiameter,
    setSnapToGrid
  } = useHolePlacement()

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: () => {
      if (selectedShapeId) removeShape(selectedShapeId)
    },
    canUndo,
    canRedo
  })

  const selectedShape = shapes.find(s => s.id === selectedShapeId) || null

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">SpartanDesign</h1>

          <div className="flex gap-4">
            <button
              onClick={() => setIs2DView(true)}
              className={`px-4 py-2 rounded ${is2DView ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              2D View
            </button>
            <button
              onClick={() => setIs2DView(false)}
              className={`px-4 py-2 rounded ${!is2DView ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              3D View
            </button>

            <button
              onClick={() => {/* Export SVG logic */}}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Export SVG
            </button>

            <button
              onClick={() => {/* Export STL logic */}}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              Export STL
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Properties Panel (Sidebar) */}
        <PropertiesPanel
          selectedShape={selectedShape}
          shapes={shapes}
          materials={materials}
          selectedMetalType={selectedMetalType}
          selectedThickness={selectedThickness}
          displayUnit={displayUnit}
          onShapeUpdate={(updates) => {
            if (selectedShapeId) {
              updateShape(selectedShapeId, updates)
            }
          }}
          onMetalTypeChange={setSelectedMetalType}
          onThicknessChange={setSelectedThickness}
        />

        {/* 3D Canvas */}
        <div className="flex-1">
          <DesignCanvas
            shapes={shapes}
            selectedShapeId={selectedShapeId}
            selectShape={selectShape}
            updateShape={updateShape}
            is2DView={is2DView}
            displayUnit={displayUnit}
            thickness={selectedThickness}
            holePlacementMode={holePlacementMode}
            selectedHoleId={selectedHoleId}
            onHoleSelected={selectHole}
            snapToGrid={snapToGrid}
          />
        </div>
      </div>
    </div>
  )
}

export default function DesignerPage() {
  return (
    <DesignProvider>
      <DesignerContent />
    </DesignProvider>
  )
}
```

### Acceptance Criteria
- [ ] Main page.tsx is <500 lines
- [ ] All functionality works exactly as before
- [ ] No prop drilling (use context or composition)
- [ ] Each component is <300 lines
- [ ] Components are in logical directories
- [ ] Hooks are reusable and testable
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No regressions in existing features

### Testing
After refactoring, test EVERY feature:
1. Create shapes (rectangle, circle)
2. Edit properties (width, height, rotation)
3. Add holes
4. Add bends
5. Select material
6. Export SVG
7. Export STL
8. Undo/redo
9. Delete shapes
10. Lock/unlock shapes

---

## 📋 IMPLEMENTATION CHECKLIST

### Day 1: Quick Wins
- [ ] Task 5: Fix Rotation UI (1 hour)
  - [ ] Add rotation input to properties panel
  - [ ] Apply rotation to mesh rendering
  - [ ] Test with all shape types
  - [ ] Verify undo/redo works

- [ ] Task 2: Implement Auto-Save (3-4 hours)
  - [ ] Create useAutoSave hook
  - [ ] Add auto-save indicator component
  - [ ] Test save/restore flow
  - [ ] Test cleanup of old autosaves

### Day 2: High Impact Feature
- [ ] Task 3: Add STL Export (4-6 hours)
  - [ ] Create lib/exportSTL.ts
  - [ ] Implement mesh creation from shapes
  - [ ] Add CSG for holes
  - [ ] Add Export STL button
  - [ ] Test in 3D slicer software

### Day 3: Major UX Improvement
- [ ] Task 4: Add Drag-to-Move (6-8 hours)
  - [ ] Add TransformControls to DesignCanvas
  - [ ] Create TransformGizmo component
  - [ ] Wire up to shape updates
  - [ ] Test with all shape types
  - [ ] Test with hole placement mode

### Day 4-6: Foundation
- [ ] Task 1: Refactor Designer Page (2-3 days)
  - [ ] Create hooks directory
  - [ ] Extract useKeyboardShortcuts
  - [ ] Extract useHolePlacement
  - [ ] Create MaterialSelector component
  - [ ] Create ShapeProperties component
  - [ ] Create PropertiesPanel container
  - [ ] Refactor main page.tsx
  - [ ] Test ALL existing features
  - [ ] Fix any regressions

---

## 🧪 TESTING PROTOCOL

After implementing each task, run through this checklist:

### Smoke Test
- [ ] npm run dev starts without errors
- [ ] No TypeScript compilation errors
- [ ] No console errors on page load
- [ ] Canvas renders correctly

### Feature Test
- [ ] Can create rectangle
- [ ] Can create circle
- [ ] Can edit shape dimensions
- [ ] Can rotate shape (after Task 5)
- [ ] Can drag shape to move (after Task 4)
- [ ] Can add holes
- [ ] Can add bends
- [ ] Can export SVG
- [ ] Can export STL (after Task 3)
- [ ] Undo works (Ctrl+Z)
- [ ] Redo works (Ctrl+Shift+Z)
- [ ] Auto-save works (after Task 2)
- [ ] Auto-restore prompts on page load (after Task 2)

### Edge Cases
- [ ] Works with empty design
- [ ] Works with 10+ shapes
- [ ] Works with shapes that have holes
- [ ] Works with shapes that have bends
- [ ] Handles invalid input gracefully
- [ ] Performance is acceptable (<60fps)

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: TransformControls not showing
**Solution:** Ensure the shape mesh exists and has correct position. Check that OrbitControls isn't blocking the transform.

### Issue: STL export fails
**Solution:** Check that all shapes have valid geometry. Use try/catch and log errors. Test with simple shapes first.

### Issue: Auto-save not triggering
**Solution:** Verify interval is set correctly. Check localStorage quota isn't exceeded. Add console.log to confirm timer is running.

### Issue: Rotation not applying
**Solution:** Ensure rotation is in radians, not degrees. Apply to mesh rotation prop: `rotation={[0, 0, shape.rotation || 0]}`

### Issue: Refactored code has regressions
**Solution:** Test incrementally. Keep original code commented out until new code is verified. Test each component in isolation.

---

## 📚 RESOURCES

### Documentation
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Drei Components](https://github.com/pmndrs/drei)
- [Three.js Exporters](https://threejs.org/docs/#examples/en/exporters/STLExporter)

### Code References
- See `CODE_REVIEW_AND_FUSION360_BENCHMARK.md` for full analysis
- Check existing implementation in `components/DesignCanvas.tsx`
- Reference `lib/types.ts` for type definitions

---

## ✅ COMPLETION CRITERIA

All 5 tasks are complete when:

1. **Rotation UI works**
   - Input field exists and updates shape rotation
   - Visual rotation matches input value
   - Persists across sessions

2. **Auto-save works**
   - Saves every 30 seconds
   - Shows "Saved Xs ago" indicator
   - Prompts to restore on page load
   - Cleans up old saves

3. **STL export works**
   - Button exists and downloads file
   - File opens in slicer software
   - Holes are actual cutouts
   - Geometry is valid

4. **Drag-to-move works**
   - Gizmo appears on selection
   - Dragging moves shape smoothly
   - Position updates correctly
   - Works with undo/redo

5. **Refactor is complete**
   - Main page <500 lines
   - Components are modular
   - All features still work
   - No regressions

---

## 🚀 GETTING STARTED

1. Read this entire prompt
2. Review `CODE_REVIEW_AND_FUSION360_BENCHMARK.md`
3. Check current codebase structure
4. Start with Task 5 (rotation UI) - easiest win
5. Work through tasks in order
6. Test thoroughly after each task
7. Commit after each completed task

Good luck! Let's make SpartanDesign even better. 🎯
