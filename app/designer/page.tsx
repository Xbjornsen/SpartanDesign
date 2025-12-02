'use client'

import { useState, useEffect } from 'react'
import DesignCanvas from '@/components/DesignCanvas'
import { DesignProvider, useDesign } from '@/lib/designContext'
import {
  Rectangle,
  Circle,
  Triangle,
  Pentagon,
  Hexagon,
  Star,
  Heart,
  Text as TextShape,
  Material,
  Hole,
  Bend,
  ShapeType,
  Shape,
} from '@/lib/types'
import { exportToSVG, downloadSVG, exportBendInstructions, downloadBendInstructions } from '@/lib/exportSVG'
import ShapePalette from '@/components/ShapePalette'
import SubmitJobModal, { CustomerDetails } from '@/components/SubmitJobModal'

const materials: Material[] = [
  // Mild Steel
  { id: 'steel-1mm', name: 'Mild Steel', thickness: 1, pricePerSquareMeter: 45, unit: 'mm' },
  { id: 'steel-1.5mm', name: 'Mild Steel', thickness: 1.5, pricePerSquareMeter: 52, unit: 'mm' },
  { id: 'steel-2mm', name: 'Mild Steel', thickness: 2, pricePerSquareMeter: 60, unit: 'mm' },
  { id: 'steel-3mm', name: 'Mild Steel', thickness: 3, pricePerSquareMeter: 75, unit: 'mm' },
  { id: 'steel-4mm', name: 'Mild Steel', thickness: 4, pricePerSquareMeter: 90, unit: 'mm' },
  { id: 'steel-5mm', name: 'Mild Steel', thickness: 5, pricePerSquareMeter: 110, unit: 'mm' },
  { id: 'steel-6mm', name: 'Mild Steel', thickness: 6, pricePerSquareMeter: 130, unit: 'mm' },

  // Stainless Steel
  {
    id: 'stainless-1mm',
    name: 'Stainless Steel',
    thickness: 1,
    pricePerSquareMeter: 65,
    unit: 'mm',
  },
  {
    id: 'stainless-1.5mm',
    name: 'Stainless Steel',
    thickness: 1.5,
    pricePerSquareMeter: 75,
    unit: 'mm',
  },
  {
    id: 'stainless-2mm',
    name: 'Stainless Steel',
    thickness: 2,
    pricePerSquareMeter: 85,
    unit: 'mm',
  },
  {
    id: 'stainless-3mm',
    name: 'Stainless Steel',
    thickness: 3,
    pricePerSquareMeter: 105,
    unit: 'mm',
  },
  {
    id: 'stainless-4mm',
    name: 'Stainless Steel',
    thickness: 4,
    pricePerSquareMeter: 125,
    unit: 'mm',
  },
  {
    id: 'stainless-5mm',
    name: 'Stainless Steel',
    thickness: 5,
    pricePerSquareMeter: 150,
    unit: 'mm',
  },
  {
    id: 'stainless-6mm',
    name: 'Stainless Steel',
    thickness: 6,
    pricePerSquareMeter: 175,
    unit: 'mm',
  },

  // Aluminium
  { id: 'aluminium-1mm', name: 'Aluminium', thickness: 1, pricePerSquareMeter: 55, unit: 'mm' },
  { id: 'aluminium-1.5mm', name: 'Aluminium', thickness: 1.5, pricePerSquareMeter: 62, unit: 'mm' },
  { id: 'aluminium-2mm', name: 'Aluminium', thickness: 2, pricePerSquareMeter: 70, unit: 'mm' },
  { id: 'aluminium-3mm', name: 'Aluminium', thickness: 3, pricePerSquareMeter: 85, unit: 'mm' },
  { id: 'aluminium-4mm', name: 'Aluminium', thickness: 4, pricePerSquareMeter: 100, unit: 'mm' },
  { id: 'aluminium-5mm', name: 'Aluminium', thickness: 5, pricePerSquareMeter: 120, unit: 'mm' },
  { id: 'aluminium-6mm', name: 'Aluminium', thickness: 6, pricePerSquareMeter: 140, unit: 'mm' },
]

function DesignerContent() {
  const {
    addShape,
    shapes,
    material,
    setMaterial,
    selectedShapeId,
    updateShape,
    removeShape,
    selectShape,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDesign()
  const [defaultWidth, setDefaultWidth] = useState(100)
  const [defaultLength, setDefaultLength] = useState(150)
  const [is2DView, setIs2DView] = useState(true)
  const [selectedMetalType, setSelectedMetalType] = useState('Mild Steel')
  const [selectedThickness, setSelectedThickness] = useState(2)
  const [displayUnit, setDisplayUnit] = useState<'mm' | 'cm' | 'm'>('mm')

  // Hole creation states
  const [newHoleDiameter, setNewHoleDiameter] = useState(0.5)
  const [newHoleWidth, setNewHoleWidth] = useState(0.5)
  const [newHoleHeight, setNewHoleHeight] = useState(0.5)
  const [newHoleX, setNewHoleX] = useState(0)
  const [newHoleY, setNewHoleY] = useState(0)

  // Hole editing states
  const [editingHoleId, setEditingHoleId] = useState<string | null>(null)

  // Hole placement mode states
  const [holePlacementMode, setHolePlacementMode] = useState(false)
  const [selectedHoleId, setSelectedHoleId] = useState<string | null>(null)
  const [lastHoleDiameterMm, setLastHoleDiameterMm] = useState(5) // Remember last used diameter
  const [cornerHoleOffset, setCornerHoleOffset] = useState(10) // Offset from edges for corner holes (in current display unit)

  // Snap to grid state
  const [snapToGrid, setSnapToGrid] = useState<'off' | 'center' | '1mm' | '0.05in'>('off')

  // Bend creation states
  const [newBendPosition, setNewBendPosition] = useState(50) // Distance from edge in display units
  const [newBendOrientation, setNewBendOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [newBendAngle, setNewBendAngle] = useState(90)
  const [newBendDirection, setNewBendDirection] = useState<'up' | 'down'>('up')
  const [newBendRadius, setNewBendRadius] = useState(2) // Default to material thickness
  const [selectedBendId, setSelectedBendId] = useState<string | null>(null)

  // Text editing states
  const [textContent, setTextContent] = useState('TEXT')
  const [textFontSize, setTextFontSize] = useState(10)

  // Submit job modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Quote calculator modal states
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [quoteQuantity, setQuoteQuantity] = useState(1)

  // Collapsible section states
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(false)
  const [isShapeLibraryCollapsed, setIsShapeLibraryCollapsed] = useState(true)

  const selectedShape = shapes.find(s => s.id === selectedShapeId)

  // Unit conversion functions (internal storage is always in mm)
  const toMm = (value: number, unit: 'mm' | 'cm' | 'm'): number => {
    switch (unit) {
      case 'mm':
        return value
      case 'cm':
        return value * 10
      case 'm':
        return value * 1000
    }
  }

  const fromMm = (valueMm: number, unit: 'mm' | 'cm' | 'm'): number => {
    switch (unit) {
      case 'mm':
        return valueMm
      case 'cm':
        return valueMm / 10
      case 'm':
        return valueMm / 1000
    }
  }

  // Get available thicknesses for selected metal type
  const availableThicknesses = materials
    .filter(m => m.name === selectedMetalType)
    .map(m => m.thickness)

  // Handle metal type change
  const handleMetalTypeChange = (metalType: string) => {
    setSelectedMetalType(metalType)
    // Find material with this type and current thickness, or default to first available
    const matchingMaterial = materials.find(
      m => m.name === metalType && m.thickness === selectedThickness
    )
    const fallbackMaterial = materials.find(m => m.name === metalType)
    if (matchingMaterial) {
      setMaterial(matchingMaterial)
    } else if (fallbackMaterial) {
      setMaterial(fallbackMaterial)
      setSelectedThickness(fallbackMaterial.thickness)
    }
  }

  // Handle thickness change
  const handleThicknessChange = (thickness: number) => {
    setSelectedThickness(thickness)
    const matchingMaterial = materials.find(
      m => m.name === selectedMetalType && m.thickness === thickness
    )
    if (matchingMaterial) {
      setMaterial(matchingMaterial)
    }
  }

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) {
          undo()
        }
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y for redo
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault()
        if (canRedo) {
          redo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo])

  // Sync dimension inputs when a shape is selected (convert from mm to display unit)
  useEffect(() => {
    if (selectedShape) {
      if (selectedShape.type === 'rectangle') {
        setDefaultWidth(fromMm(selectedShape.width, displayUnit))
        setDefaultLength(fromMm(selectedShape.height, displayUnit))
      } else if (selectedShape.type === 'circle') {
        setDefaultWidth(fromMm(selectedShape.radius * 2, displayUnit)) // Diameter
        setDefaultLength(fromMm(selectedShape.radius * 2, displayUnit))
      } else if (selectedShape.type === 'text') {
        setTextContent(selectedShape.text)
        setTextFontSize(fromMm(selectedShape.fontSize, displayUnit))
      }
    }
  }, [selectedShapeId, selectedShape, displayUnit])

  // Update selected shape dimensions in real-time (convert to mm for storage)
  const handleWidthChange = (value: number) => {
    setDefaultWidth(value)
    if (selectedShape) {
      const valueMm = toMm(value, displayUnit)
      if (selectedShape.type === 'rectangle') {
        updateShape(selectedShape.id, { width: valueMm } as Partial<Rectangle>)
      } else if (selectedShape.type === 'circle') {
        updateShape(selectedShape.id, { radius: valueMm / 2 } as Partial<Circle>)
      }
    }
  }

  const handleLengthChange = (value: number) => {
    setDefaultLength(value)
    if (selectedShape && selectedShape.type === 'rectangle') {
      const valueMm = toMm(value, displayUnit)
      updateShape(selectedShape.id, { height: valueMm } as Partial<Rectangle>)
    }
  }

  // Text editing handlers
  const handleTextContentChange = (value: string) => {
    setTextContent(value)
    if (selectedShape && selectedShape.type === 'text') {
      updateShape(selectedShape.id, { text: value } as Partial<TextShape>)
    }
  }

  const handleTextFontSizeChange = (value: number) => {
    setTextFontSize(value)
    if (selectedShape && selectedShape.type === 'text') {
      const valueMm = toMm(value, displayUnit)
      updateShape(selectedShape.id, { fontSize: valueMm } as Partial<TextShape>)
    }
  }

  const handleAddRectangle = () => {
    const widthMm = toMm(defaultWidth, displayUnit)
    const heightMm = toMm(defaultLength, displayUnit)

    const newRect: Rectangle = {
      id: `rect-${Date.now()}`,
      type: 'rectangle',
      position: { x: 0, y: 0 },
      width: widthMm,
      height: heightMm,
      color: '#6B7280',
      holes: [],
    }
    addShape(newRect)
    selectShape(newRect.id)
  }

  const handleAddCircle = () => {
    const diameterMm = toMm(Math.min(defaultWidth, defaultLength), displayUnit)

    const newCircle: Circle = {
      id: `circle-${Date.now()}`,
      type: 'circle',
      position: { x: 0, y: 0 },
      radius: diameterMm / 2,
      color: '#6B7280',
      holes: [],
      locked: false,
    }
    addShape(newCircle)
    selectShape(newCircle.id)
  }

  // Generic function to create any shape type
  const handleAddShapeFromPalette = (shapeType: ShapeType) => {
    const defaultSize = toMm(Math.min(defaultWidth, defaultLength), displayUnit)
    let newShape: Shape

    switch (shapeType) {
      case 'rectangle':
        newShape = {
          id: `rect-${Date.now()}`,
          type: 'rectangle',
          position: { x: 0, y: 0 },
          width: toMm(defaultWidth, displayUnit),
          height: toMm(defaultLength, displayUnit),
          color: '#6B7280',
          holes: [],
          locked: false,
        } as Rectangle
        break

      case 'circle':
        newShape = {
          id: `circle-${Date.now()}`,
          type: 'circle',
          position: { x: 0, y: 0 },
          radius: defaultSize / 2,
          color: '#6B7280',
          holes: [],
          locked: false,
        } as Circle
        break

      case 'triangle':
        newShape = {
          id: `triangle-${Date.now()}`,
          type: 'triangle',
          position: { x: 0, y: 0 },
          size: defaultSize,
          color: '#6B7280',
          holes: [],
          locked: false,
        } as Triangle
        break

      case 'pentagon':
        newShape = {
          id: `pentagon-${Date.now()}`,
          type: 'pentagon',
          position: { x: 0, y: 0 },
          size: defaultSize / 2,
          color: '#6B7280',
          holes: [],
          locked: false,
        } as Pentagon
        break

      case 'hexagon':
        newShape = {
          id: `hexagon-${Date.now()}`,
          type: 'hexagon',
          position: { x: 0, y: 0 },
          size: defaultSize / 2,
          color: '#6B7280',
          holes: [],
          locked: false,
        } as Hexagon
        break

      case 'star':
        newShape = {
          id: `star-${Date.now()}`,
          type: 'star',
          position: { x: 0, y: 0 },
          outerRadius: defaultSize / 2,
          innerRadius: defaultSize / 4,
          points: 5,
          color: '#6B7280',
          holes: [],
          locked: false,
        } as Star
        break

      case 'heart':
        newShape = {
          id: `heart-${Date.now()}`,
          type: 'heart',
          position: { x: 0, y: 0 },
          size: defaultSize,
          color: '#6B7280',
          holes: [],
          locked: false,
        } as Heart
        break

      case 'text':
        newShape = {
          id: `text-${Date.now()}`,
          type: 'text',
          position: { x: 0, y: 0 },
          text: 'A',
          fontSize: defaultSize,
          fontFamily: 'Arial',
          color: '#6B7280',
          holes: [],
          locked: false,
        } as TextShape
        break

      default:
        return
    }

    addShape(newShape)
    selectShape(newShape.id)
  }

  const handleToggleLock = () => {
    if (selectedShape) {
      updateShape(selectedShape.id, { locked: !selectedShape.locked })
    }
  }

  const handleDeleteShape = () => {
    if (selectedShapeId) {
      removeShape(selectedShapeId)
    }
  }

  const handleAddHole = (holeType: 'rectangle' | 'circle') => {
    if (!selectedShape) return

    // Convert hole dimensions to mm
    const xMm = toMm(newHoleX, displayUnit)
    const yMm = toMm(newHoleY, displayUnit)

    const newHole = {
      id: `hole-${Date.now()}`,
      type: holeType,
      position: { x: xMm, y: yMm },
      ...(holeType === 'rectangle'
        ? { width: toMm(newHoleWidth, displayUnit), height: toMm(newHoleHeight, displayUnit) }
        : { radius: toMm(newHoleDiameter, displayUnit) / 2 }),
    }

    const updatedHoles = [...(selectedShape.holes || []), newHole]
    updateShape(selectedShape.id, { holes: updatedHoles } as Partial<typeof selectedShape>)
  }

  const handleUpdateHole = (holeId: string, updates: Partial<Hole>) => {
    if (!selectedShape) return

    const updatedHoles = (selectedShape.holes || []).map(hole =>
      hole.id === holeId ? { ...hole, ...updates } : hole
    )
    updateShape(selectedShape.id, { holes: updatedHoles } as Partial<typeof selectedShape>)
  }

  const handleDeleteHole = (holeId: string) => {
    if (!selectedShape) return

    const updatedHoles = (selectedShape.holes || []).filter(hole => hole.id !== holeId)
    updateShape(selectedShape.id, { holes: updatedHoles } as Partial<typeof selectedShape>)
    if (editingHoleId === holeId) {
      setEditingHoleId(null)
    }
    if (selectedHoleId === holeId) {
      setSelectedHoleId(null)
    }
  }

  // Helper: Convert hole position from center-based to bottom-left based
  const holeToBottomLeft = (holePosX: number, holePosY: number, shape: Shape): { x: number; y: number } => {
    if (shape.type === 'rectangle') {
      const rect = shape as Rectangle
      return {
        x: holePosX + rect.width / 2,
        y: holePosY + rect.height / 2,
      }
    }
    // For other shapes, return as-is (centered)
    return { x: holePosX, y: holePosY }
  }

  // Helper: Convert hole position from bottom-left to center-based
  const bottomLeftToHole = (bottomLeftX: number, bottomLeftY: number, shape: Shape): { x: number; y: number } => {
    if (shape.type === 'rectangle') {
      const rect = shape as Rectangle
      return {
        x: bottomLeftX - rect.width / 2,
        y: bottomLeftY - rect.height / 2,
      }
    }
    // For other shapes, return as-is (centered)
    return { x: bottomLeftX, y: bottomLeftY }
  }

  // Helper: Apply snap to grid
  const applySnapToGrid = (value: number): number => {
    if (snapToGrid === 'off') return value
    if (snapToGrid === 'center') return 0 // Snap to center of shape
    const gridSize = snapToGrid === '1mm' ? 1 : 1.27 // 0.05 inches = 1.27mm
    return Math.round(value / gridSize) * gridSize
  }

  // Handle click-to-place hole on canvas
  const handleCanvasClickForHole = (clickX: number, clickY: number) => {
    if (!holePlacementMode || !selectedShape) return

    // Apply snap to grid
    const snappedX = applySnapToGrid(clickX)
    const snappedY = applySnapToGrid(clickY)

    // Use last used diameter (defaults to 5mm on first use)
    const newHole: Hole = {
      id: `hole-${Date.now()}`,
      type: 'circle',
      position: { x: snappedX, y: snappedY },
      radius: lastHoleDiameterMm / 2,
    }

    const updatedHoles = [...(selectedShape.holes || []), newHole]
    updateShape(selectedShape.id, { holes: updatedHoles } as Partial<typeof selectedShape>)
    setSelectedHoleId(newHole.id)
  }

  // Toggle hole placement mode
  const handleToggleHolePlacementMode = () => {
    setHolePlacementMode(!holePlacementMode)
    setSelectedHoleId(null)
  }

  // Add 4 corner holes automatically
  const handleAddCornerHoles = () => {
    if (!selectedShape || selectedShape.type !== 'rectangle') return

    const rect = selectedShape as Rectangle
    const offsetMm = toMm(cornerHoleOffset, displayUnit)

    // Calculate corner positions from bottom-left
    const corners = [
      { x: offsetMm, y: offsetMm, name: 'Bottom-Left' }, // Bottom-left
      { x: rect.width - offsetMm, y: offsetMm, name: 'Bottom-Right' }, // Bottom-right
      { x: rect.width - offsetMm, y: rect.height - offsetMm, name: 'Top-Right' }, // Top-right
      { x: offsetMm, y: rect.height - offsetMm, name: 'Top-Left' }, // Top-left
    ]

    // Convert to center-based coordinates
    const newHoles: Hole[] = corners.map((corner, index) => ({
      id: `hole-corner-${Date.now()}-${index}`,
      type: 'circle',
      position: bottomLeftToHole(corner.x, corner.y, selectedShape),
      radius: lastHoleDiameterMm / 2,
    }))

    const updatedHoles = [...(selectedShape.holes || []), ...newHoles]
    updateShape(selectedShape.id, { holes: updatedHoles } as Partial<typeof selectedShape>)
  }

  // Update hole position from bottom-left coordinates (in display units)
  const handleUpdateHolePositionBottomLeft = (holeId: string, xBottomLeft: number, yBottomLeft: number) => {
    if (!selectedShape) return
    const xMm = toMm(xBottomLeft, displayUnit)
    const yMm = toMm(yBottomLeft, displayUnit)
    const centerPos = bottomLeftToHole(xMm, yMm, selectedShape)
    handleUpdateHole(holeId, { position: centerPos })
  }

  // Update hole diameter from dropdown or custom input (in mm or inches based on displayUnit)
  const handleUpdateHoleDiameter = (holeId: string, diameter: number) => {
    const diameterMm = toMm(diameter, displayUnit)
    handleUpdateHole(holeId, { radius: diameterMm / 2 })
    // Remember this diameter for next hole
    setLastHoleDiameterMm(diameterMm)
  }

  // Bend handlers
  const handleAddBend = () => {
    if (!selectedShape || selectedShape.type !== 'rectangle') return

    const positionMm = toMm(newBendPosition, displayUnit)
    const radiusMm = toMm(newBendRadius, displayUnit)

    const newBend: Bend = {
      id: `bend-${Date.now()}`,
      position: positionMm,
      orientation: newBendOrientation,
      angle: newBendAngle,
      direction: newBendDirection,
      radius: radiusMm,
    }

    const updatedBends = [...(selectedShape.bends || []), newBend]
    updateShape(selectedShape.id, { bends: updatedBends } as Partial<typeof selectedShape>)
    setSelectedBendId(newBend.id)
  }

  const handleUpdateBend = (bendId: string, updates: Partial<Bend>) => {
    if (!selectedShape) return

    const updatedBends = (selectedShape.bends || []).map(bend =>
      bend.id === bendId ? { ...bend, ...updates } : bend
    )
    updateShape(selectedShape.id, { bends: updatedBends } as Partial<typeof selectedShape>)
  }

  const handleDeleteBend = (bendId: string) => {
    if (!selectedShape) return

    const updatedBends = (selectedShape.bends || []).filter(bend => bend.id !== bendId)
    updateShape(selectedShape.id, { bends: updatedBends } as Partial<typeof selectedShape>)
    if (selectedBendId === bendId) {
      setSelectedBendId(null)
    }
  }

  const handleExportSVG = () => {
    if (shapes.length === 0) {
      alert('No shapes to export. Please add some shapes first.')
      return
    }

    try {
      const svgContent = exportToSVG(shapes)
      downloadSVG(svgContent, `design-${Date.now()}.svg`)
    } catch (error) {
      alert('Error exporting SVG: ' + (error as Error).message)
    }
  }

  const handleExportBendInstructions = () => {
    // Check if any shapes have bends
    const hasBends = shapes.some(shape => shape.bends && shape.bends.length > 0)
    if (!hasBends) {
      alert('No bend instructions to export. Please add bends to your design first.')
      return
    }

    try {
      const jsonContent = exportBendInstructions(shapes)
      downloadBendInstructions(jsonContent, `bend-instructions-${Date.now()}.json`)
    } catch (error) {
      alert('Error exporting bend instructions: ' + (error as Error).message)
    }
  }

  // Calculate quote
  const calculateQuote = (quantity: number = 1) => {
    if (shapes.length === 0) return null

    const LASER_CUTTING_BASE = 50 // $50 flat rate for laser cutting
    const BEND_COST = 50 // $50 per bend

    let totalArea = 0 // in square mm
    let totalBends = 0

    shapes.forEach(shape => {
      // Calculate area based on shape type
      if (shape.type === 'rectangle') {
        const rect = shape as Rectangle
        totalArea += rect.width * rect.height
      } else if (shape.type === 'circle') {
        const circle = shape as Circle
        totalArea += Math.PI * circle.radius * circle.radius
      }

      // Count bends
      if (shape.bends) {
        totalBends += shape.bends.length
      }
    })

    // Convert area to square meters
    const areaInSquareMeters = totalArea / 1000000

    // Calculate costs
    const materialCost = areaInSquareMeters * material.pricePerSquareMeter
    const cuttingCost = LASER_CUTTING_BASE
    const bendCost = totalBends * BEND_COST
    const subtotal = materialCost + cuttingCost + bendCost
    const total = subtotal * quantity

    return {
      quantity,
      materialCost,
      cuttingCost,
      bendCost,
      subtotal,
      total,
      totalBends,
      totalArea: areaInSquareMeters,
    }
  }

  const handleOpenSubmitModal = () => {
    if (shapes.length === 0) {
      setSubmitMessage({
        type: 'error',
        text: 'Please add at least one shape to your design before submitting.',
      })
      setTimeout(() => setSubmitMessage(null), 5000)
      return
    }
    setIsSubmitModalOpen(true)
  }

  const handleSubmitJob = async (customerDetails: CustomerDetails) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // Generate SVG content
      const svgContent = exportToSVG(shapes)

      // Send to API
      const response = await fetch('/api/submit-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails,
          shapes,
          material,
          svgContent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit job')
      }

      // Success
      setIsSubmitModalOpen(false)
      setSubmitMessage({
        type: 'success',
        text: 'Job submitted successfully! We will contact you shortly with a detailed quote.',
      })
      setTimeout(() => setSubmitMessage(null), 10000)
    } catch (error) {
      console.error('Submit job error:', error)
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to submit job. Please try again.',
      })
      setTimeout(() => setSubmitMessage(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-slate-100 border-b-2 border-blue-900 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-slate-700 hover:text-blue-700 transition-colors"
            title="Back to Home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <h1 className="font-heading text-2xl font-bold text-blue-900">
            Spartan Design <span className="text-slate-600 font-normal">| 3D Designer</span>
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          {/* View Toggle */}
          <div className="flex bg-slate-200 rounded-lg p-1 border-2 border-slate-300">
            <button
              onClick={() => setIs2DView(true)}
              className={`px-4 py-2 rounded-md transition-all font-semibold ${
                is2DView
                  ? 'bg-slate-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-300'
              }`}
            >
              2D View
            </button>
            <button
              onClick={() => setIs2DView(false)}
              className={`px-4 py-2 rounded-md transition-all font-semibold ${
                !is2DView
                  ? 'bg-slate-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-300'
              }`}
            >
              3D View
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportSVG}
            className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg transition-all shadow-md font-semibold flex items-center gap-2 border-2 border-slate-600"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-white">Export SVG</span>
          </button>

          {/* Quote Calculator Button */}
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-md font-semibold flex items-center gap-2 border-2 border-green-700"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-white">Get Quote</span>
          </button>

          {/* Submit Job Button */}
          <button
            onClick={handleOpenSubmitModal}
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-all shadow-lg font-bold flex items-center gap-2 border-2 border-slate-800"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white">Submit Job</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Tools */}
        <aside className="w-80 bg-white px-5 py-5 overflow-y-auto border-r-2 border-neutral-200 shadow-lg">
          {/* Quick Add Tools Section */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center mb-3 cursor-pointer select-none p-2 hover:bg-neutral-50 rounded-lg transition"
              onClick={() => setIsToolsCollapsed(!isToolsCollapsed)}
            >
              <h2 className="font-heading text-lg font-bold text-neutral-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Quick Add
              </h2>
              <svg
                className={`w-5 h-5 text-primary-600 transition-transform ${isToolsCollapsed ? '-rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {!isToolsCollapsed && (
              <div className="space-y-2">
                <button
                  onClick={handleAddRectangle}
                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 rounded-lg transition-all text-slate-800 font-semibold shadow-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" strokeWidth={2} rx="2" />
                  </svg>
                  <span className="text-slate-800">Add Rectangle</span>
                </button>
                <button
                  onClick={handleAddCircle}
                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 rounded-lg transition-all text-slate-800 font-semibold shadow-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" strokeWidth={2} />
                  </svg>
                  <span className="text-slate-800">Add Circle</span>
                </button>
                <button
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-300 rounded-lg cursor-not-allowed text-slate-500 font-medium flex items-center gap-2 opacity-60"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="text-slate-500">Custom Path (Soon)</span>
                </button>
              </div>
            )}
          </div>

          {/* Shape Library Section */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center mb-3 cursor-pointer select-none p-2 hover:bg-neutral-50 rounded-lg transition"
              onClick={() => setIsShapeLibraryCollapsed(!isShapeLibraryCollapsed)}
            >
              <h2 className="font-heading text-lg font-bold text-neutral-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Shape Library
              </h2>
              <svg
                className={`w-5 h-5 text-accent-600 transition-transform ${isShapeLibraryCollapsed ? '-rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {!isShapeLibraryCollapsed && (
              <ShapePalette onShapeSelect={handleAddShapeFromPalette} displayUnit={displayUnit} />
            )}
          </div>

          <h2 className="font-heading text-lg font-bold mb-3 text-neutral-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Material Selection
          </h2>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition bg-white shadow-sm">
              <input
                type="radio"
                name="metalType"
                value="Mild Steel"
                checked={selectedMetalType === 'Mild Steel'}
                onChange={e => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4 accent-primary-500"
              />
              <span className="font-medium text-neutral-900">Mild Steel</span>
            </label>
            <label className="flex items-center p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition bg-white shadow-sm">
              <input
                type="radio"
                name="metalType"
                value="Stainless Steel"
                checked={selectedMetalType === 'Stainless Steel'}
                onChange={e => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4 accent-primary-500"
              />
              <span className="font-medium text-neutral-900">
                Stainless Steel
              </span>
            </label>
            <label className="flex items-center p-3 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 transition bg-white shadow-sm">
              <input
                type="radio"
                name="metalType"
                value="Aluminium"
                checked={selectedMetalType === 'Aluminium'}
                onChange={e => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4 accent-primary-500"
              />
              <span className="font-medium text-neutral-900">Aluminium</span>
            </label>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-4 text-neutral-900">
            Thickness
          </h2>
          <select
            value={selectedThickness}
            onChange={e => handleThicknessChange(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 shadow-sm"
          >
            {availableThicknesses.map(thickness => {
              return (
                <option key={thickness} value={thickness}>
                  {thickness}mm
                </option>
              )
            })}
          </select>

          <div className="mt-3 p-3 bg-accent-50 rounded-lg border border-accent-200">
            <p className="text-sm text-neutral-800">
              <strong>Selected:</strong> {material.name} {material.thickness}mm
            </p>
          </div>

          <h2 className="font-heading text-lg font-bold mt-6 mb-3 text-neutral-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Units
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDisplayUnit('mm')}
              className={`flex-1 px-3 py-2 rounded-lg border transition shadow-sm font-semibold ${
                displayUnit === 'mm'
                  ? 'bg-slate-600 text-white border-slate-700'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              mm
            </button>
            <button
              onClick={() => setDisplayUnit('cm')}
              className={`flex-1 px-3 py-2 rounded-lg border transition shadow-sm font-semibold ${
                displayUnit === 'cm'
                  ? 'bg-slate-600 text-white border-slate-700'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              cm
            </button>
            <button
              onClick={() => setDisplayUnit('m')}
              className={`flex-1 px-3 py-2 rounded-lg border transition shadow-sm font-semibold ${
                displayUnit === 'm'
                  ? 'bg-slate-600 text-white border-slate-700'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              m
            </button>
          </div>

          <h2 className="font-heading text-lg font-bold mt-6 mb-3 text-neutral-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {selectedShape
              ? selectedShape.type === 'text'
                ? 'Edit Text'
                : 'Edit Dimensions'
              : 'New Shape Size'}
          </h2>
          {selectedShape?.type === 'text' ? (
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1 font-medium text-neutral-900">
                  Text Content
                </label>
                <input
                  type="text"
                  value={textContent}
                  onChange={e => handleTextContentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white text-neutral-900 shadow-sm"
                  placeholder="Enter text..."
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium text-neutral-900">
                  Font Size ({displayUnit})
                </label>
                <input
                  type="number"
                  value={textFontSize}
                  onChange={e => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val) && val > 0) handleTextFontSizeChange(val)
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white text-neutral-900 shadow-sm"
                  placeholder="10"
                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '1'}
                  min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '1'}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1 font-medium text-neutral-900">
                  {selectedShape?.type === 'circle'
                    ? `Diameter (${displayUnit})`
                    : `Width (${displayUnit})`}
                </label>
                <input
                  type="number"
                  value={defaultWidth}
                  onChange={e => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val)) handleWidthChange(val)
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white text-neutral-900 shadow-sm"
                  placeholder="2"
                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                  min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                />
              </div>
              {selectedShape?.type !== 'circle' && (
                <div>
                  <label className="block text-sm mb-1 font-medium text-neutral-900">
                    Length ({displayUnit})
                  </label>
                  <input
                    type="number"
                    value={defaultLength}
                    onChange={e => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val)) handleLengthChange(val)
                    }}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white text-neutral-900 shadow-sm"
                    placeholder="2"
                    step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                  />
                </div>
              )}
              {selectedShape?.type === 'rectangle' && (
                <div>
                  <label className="block text-sm mb-1 font-medium text-neutral-900">
                    Corner Radius ({displayUnit})
                  </label>
                  <input
                    type="number"
                    value={fromMm((selectedShape as any).cornerRadius || 0, displayUnit)}
                    onChange={e => {
                      const val = parseFloat(e.target.value)
                      if (!isNaN(val) && selectedShape) {
                        updateShape(selectedShape.id, {
                          cornerRadius: toMm(val, displayUnit)
                        })
                      }
                    }}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white text-neutral-900 shadow-sm"
                    placeholder="0"
                    step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    min="0"
                  />
                  <p className="text-xs text-neutral-500 mt-1 italic">
                    0 = sharp corners, higher = rounder
                  </p>
                </div>
              )}
            </div>
          )}

          {!selectedShape && (
            <p className="mt-2 text-xs text-neutral-500 italic">
              Set dimensions, then click + Rectangle or + Circle to create a shape
            </p>
          )}

          {selectedShape && (
            <>
              <h2 className="font-heading text-lg font-bold mt-6 mb-3 text-neutral-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Shape Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={handleToggleLock}
                  className={`w-full px-4 py-2 rounded-lg transition shadow-sm ${
                    selectedShape.locked
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-accent-500 hover:bg-accent-600 text-white'
                  }`}
                >
                  {selectedShape.locked ? '🔒 Unlock Shape' : '🔓 Lock Shape'}
                </button>
                <button
                  onClick={handleDeleteShape}
                  className="w-full px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition shadow-sm"
                >
                  Delete Shape
                </button>
              </div>

              {/* Hole Placement Mode Button */}
              <h2 className="font-heading text-lg font-bold mt-6 mb-3 text-neutral-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Holes
              </h2>
              <div className="space-y-2">
                <button
                  onClick={handleToggleHolePlacementMode}
                  className={`w-full px-4 py-2 rounded-lg transition shadow-sm font-semibold ${
                    holePlacementMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-600 hover:bg-slate-700 text-white'
                  }`}
                >
                  {holePlacementMode ? '✓ Hole Placement Mode Active' : 'Add Hole'}
                </button>
                {holePlacementMode && (
                  <p className="text-xs text-blue-600 font-medium">
                    Click inside the shape to place a hole
                  </p>
                )}

                {/* Add 4 Corner Holes Button */}
                {selectedShape?.type === 'rectangle' && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
                    <label className="block text-xs mb-2 font-medium text-neutral-900">
                      Add 4 Corner Holes
                    </label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs mb-1 text-neutral-700">
                          Hole Diameter ({displayUnit})
                        </label>
                        <input
                          type="number"
                          value={fromMm(lastHoleDiameterMm, displayUnit).toFixed(2)}
                          onChange={e => {
                            const val = parseFloat(e.target.value)
                            if (!isNaN(val) && val > 0) setLastHoleDiameterMm(toMm(val, displayUnit))
                          }}
                          className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                          step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '0.1'}
                          min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '0.1'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-neutral-700">
                          Offset from edges ({displayUnit})
                        </label>
                        <input
                          type="number"
                          value={cornerHoleOffset}
                          onChange={e => setCornerHoleOffset(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                          step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '1'}
                          min="0"
                        />
                      </div>
                      <button
                        onClick={handleAddCornerHoles}
                        className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                      >
                        Add 4 Corner Holes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Snap to Grid Toggle */}
              <div className="mt-3">
                <label className="block text-sm mb-1 font-medium text-neutral-900">
                  Snap to Grid
                </label>
                <select
                  value={snapToGrid}
                  onChange={e => setSnapToGrid(e.target.value as 'off' | 'center' | '1mm' | '0.05in')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 shadow-sm"
                >
                  <option value="off">Off</option>
                  <option value="center">Center</option>
                  <option value="1mm">1 mm</option>
                  <option value="0.05in">0.05 in</option>
                </select>
              </div>

              {/* Selected Hole Control Panel */}
              {selectedHoleId && selectedShape && selectedShape.holes && (() => {
                const selectedHole = selectedShape.holes.find(h => h.id === selectedHoleId)
                if (!selectedHole || selectedHole.type !== 'circle') return null

                const bottomLeftPos = holeToBottomLeft(selectedHole.position.x, selectedHole.position.y, selectedShape)
                const diameterMm = (selectedHole.radius || 0) * 2

                // Define diameter presets based on unit
                const diameterPresets = displayUnit === 'mm'
                  ? [3, 4, 5, 6, 8, 10, 12] // mm
                  : [3.175, 4.7625, 6.35, 7.9375, 9.525, 12.7] // inches: 1/8", 3/16", 1/4", 5/16", 3/8", 1/2"
                const presetLabels = displayUnit === 'mm'
                  ? ['3mm', '4mm', '5mm', '6mm', '8mm', '10mm', '12mm']
                  : ['1/8"', '3/16"', '1/4"', '5/16"', '3/8"', '1/2"']

                return (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-300 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-blue-900">Selected Hole</span>
                      <button
                        onClick={() => setSelectedHoleId(null)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Diameter Dropdown */}
                    <div className="mb-2">
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Diameter
                      </label>
                      <select
                        value={diameterPresets.find(p => Math.abs(p - diameterMm) < 0.1) ? diameterMm.toFixed(4) : 'custom'}
                        onChange={e => {
                          if (e.target.value !== 'custom') {
                            handleUpdateHoleDiameter(selectedHole.id, parseFloat(e.target.value))
                          }
                        }}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                      >
                        {diameterPresets.map((preset, idx) => (
                          <option key={preset} value={preset.toFixed(4)}>
                            {presetLabels[idx]}
                          </option>
                        ))}
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    {/* Custom Diameter Input */}
                    <div className="mb-2">
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Custom Diameter ({displayUnit})
                      </label>
                      <input
                        type="number"
                        value={fromMm(diameterMm, displayUnit).toFixed(2)}
                        onChange={e => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val) && val > 0) handleUpdateHoleDiameter(selectedHole.id, val)
                        }}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                        step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                        min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      />
                    </div>

                    {/* X Position (from bottom-left) */}
                    <div className="mb-2">
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        X from Bottom-Left ({displayUnit})
                      </label>
                      <input
                        type="number"
                        value={fromMm(bottomLeftPos.x, displayUnit).toFixed(2)}
                        onChange={e => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val)) handleUpdateHolePositionBottomLeft(selectedHole.id, val, fromMm(bottomLeftPos.y, displayUnit))
                        }}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                        step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      />
                    </div>

                    {/* Y Position (from bottom-left) */}
                    <div>
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Y from Bottom-Left ({displayUnit})
                      </label>
                      <input
                        type="number"
                        value={fromMm(bottomLeftPos.y, displayUnit).toFixed(2)}
                        onChange={e => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val)) handleUpdateHolePositionBottomLeft(selectedHole.id, fromMm(bottomLeftPos.x, displayUnit), val)
                        }}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                        step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      />
                    </div>
                  </div>
                )
              })()}

              {/* Holes Table */}
              {selectedShape.holes && selectedShape.holes.length > 0 && (
                <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-300 shadow-sm">
                  <h3 className="text-sm font-bold text-neutral-900 mb-2">
                    Holes ({selectedShape.holes.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-neutral-300 text-neutral-900 font-semibold">
                          <th className="text-left py-1 px-1">#</th>
                          <th className="text-left py-1 px-1">Ø ({displayUnit})</th>
                          <th className="text-left py-1 px-1">X ({displayUnit})</th>
                          <th className="text-left py-1 px-1">Y ({displayUnit})</th>
                          <th className="text-center py-1 px-1">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedShape.holes.filter(h => h.type === 'circle').map((hole, index) => {
                          const bottomLeftPos = holeToBottomLeft(hole.position.x, hole.position.y, selectedShape)
                          const isSelected = hole.id === selectedHoleId
                          return (
                            <tr
                              key={hole.id}
                              onClick={() => setSelectedHoleId(hole.id)}
                              className={`border-b border-neutral-200 cursor-pointer hover:bg-blue-50 ${
                                isSelected ? 'bg-blue-100 text-neutral-900' : 'text-neutral-900'
                              }`}
                            >
                              <td className="py-1 px-1 text-neutral-900">{index + 1}</td>
                              <td className="py-1 px-1 text-neutral-900">
                                {hole.radius ? fromMm(hole.radius * 2, displayUnit).toFixed(2) : '0.00'}
                              </td>
                              <td className="py-1 px-1 text-neutral-900">
                                {fromMm(bottomLeftPos.x, displayUnit).toFixed(2)}
                              </td>
                              <td className="py-1 px-1 text-neutral-900">
                                {fromMm(bottomLeftPos.y, displayUnit).toFixed(2)}
                              </td>
                              <td className="py-1 px-1 text-center">
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleDeleteHole(hole.id)
                                  }}
                                  className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bends Section - Only for rectangles */}
              {selectedShape?.type === 'rectangle' && (
                <div className="mt-6">
                  <h2 className="font-heading text-lg font-bold mb-3 text-neutral-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Sheet Metal Bends
                  </h2>

                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-300 space-y-2">
                    <div>
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Position from {newBendOrientation === 'horizontal' ? 'Bottom' : 'Left'} Edge ({displayUnit})
                      </label>
                      <input
                        type="number"
                        value={newBendPosition}
                        onChange={e => setNewBendPosition(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                        step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '1'}
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Orientation
                      </label>
                      <select
                        value={newBendOrientation}
                        onChange={e => setNewBendOrientation(e.target.value as 'horizontal' | 'vertical')}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                      >
                        <option value="horizontal">Horizontal (↔)</option>
                        <option value="vertical">Vertical (↕)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Bend Angle
                      </label>
                      <select
                        value={newBendAngle}
                        onChange={e => setNewBendAngle(parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                      >
                        <option value={90}>90°</option>
                        <option value={45}>45°</option>
                        <option value={30}>30°</option>
                        <option value={135}>135°</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Custom Angle (degrees)
                      </label>
                      <input
                        type="number"
                        value={newBendAngle}
                        onChange={e => setNewBendAngle(parseFloat(e.target.value) || 90)}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                        step="1"
                        min="0"
                        max="180"
                      />
                    </div>

                    <div>
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Bend Direction
                      </label>
                      <select
                        value={newBendDirection}
                        onChange={e => setNewBendDirection(e.target.value as 'up' | 'down')}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                      >
                        <option value="up">Up (+Z)</option>
                        <option value="down">Down (-Z)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs mb-1 font-medium text-neutral-900">
                        Inside Bend Radius ({displayUnit})
                      </label>
                      <input
                        type="number"
                        value={newBendRadius}
                        onChange={e => setNewBendRadius(parseFloat(e.target.value) || material.thickness)}
                        className="w-full px-2 py-1 border border-neutral-300 rounded-lg text-sm bg-white text-neutral-900"
                        step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '0.1'}
                        min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '0.1'}
                      />
                      <p className="text-xs text-neutral-500 mt-1 italic">
                        Typical: 1× to 2× material thickness ({material.thickness}mm)
                      </p>
                    </div>

                    <button
                      onClick={handleAddBend}
                      className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                    >
                      Add Bend Line
                    </button>
                  </div>

                  {/* Bends Table */}
                  {selectedShape.bends && selectedShape.bends.length > 0 && (
                    <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-300 shadow-sm">
                      <h3 className="text-sm font-bold text-neutral-900 mb-2">
                        Bend Lines ({selectedShape.bends.length})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-neutral-300 text-neutral-900 font-semibold">
                              <th className="text-left py-1 px-1">#</th>
                              <th className="text-left py-1 px-1">Orient.</th>
                              <th className="text-left py-1 px-1">Pos ({displayUnit})</th>
                              <th className="text-left py-1 px-1">Angle</th>
                              <th className="text-left py-1 px-1">Dir.</th>
                              <th className="text-center py-1 px-1">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedShape.bends.map((bend, index) => {
                              const isSelected = bend.id === selectedBendId
                              return (
                                <tr
                                  key={bend.id}
                                  onClick={() => setSelectedBendId(bend.id)}
                                  className={`border-b border-neutral-200 cursor-pointer hover:bg-orange-50 ${
                                    isSelected ? 'bg-orange-100 text-neutral-900' : 'text-neutral-900'
                                  }`}
                                >
                                  <td className="py-1 px-1 text-neutral-900">{index + 1}</td>
                                  <td className="py-1 px-1 text-neutral-900">
                                    {bend.orientation === 'horizontal' ? '↔' : '↕'}
                                  </td>
                                  <td className="py-1 px-1 text-neutral-900">
                                    {fromMm(bend.position, displayUnit).toFixed(1)}
                                  </td>
                                  <td className="py-1 px-1 text-neutral-900">{bend.angle}°</td>
                                  <td className="py-1 px-1 text-neutral-900">
                                    {bend.direction === 'up' ? '↑' : '↓'}
                                  </td>
                                  <td className="py-1 px-1 text-center">
                                    <button
                                      onClick={e => {
                                        e.stopPropagation()
                                        handleDeleteBend(bend.id)
                                      }}
                                      className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-xs"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg border-2 border-primary-200 shadow-sm">
            <h3 className="font-bold text-sm text-neutral-900 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Design Info
            </h3>
            <div className="space-y-1 text-sm text-neutral-700">
              <p>
                <strong>Shapes:</strong> {shapes.length}
              </p>
              <p>
                <strong>Selected:</strong> {selectedShape ? selectedShape.type : 'None'}
              </p>
              {selectedShape && selectedShape.locked && (
                <p className="text-amber-700 font-medium flex items-center gap-1">
                  🔒 Shape Locked
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="flex-1">
          <DesignCanvas
            is2DView={is2DView}
            displayUnit={displayUnit}
            thickness={material.thickness}
            holePlacementMode={holePlacementMode}
            onHolePlaced={handleCanvasClickForHole}
            selectedHoleId={selectedHoleId}
            onHoleSelected={setSelectedHoleId}
            selectedBendId={selectedBendId}
            onBendSelected={setSelectedBendId}
          />
        </main>
      </div>

      {/* Quote Calculator Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-neutral-900">Price Estimate</h2>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {shapes.length === 0 ? (
              <p className="text-neutral-600 mb-4">Please add shapes to your design to calculate a quote.</p>
            ) : (
              <>
                {/* Quantity Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quoteQuantity}
                    onChange={e => setQuoteQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white text-neutral-900"
                    min="1"
                  />
                </div>

                {/* Quote Breakdown */}
                {(() => {
                  const quote = calculateQuote(quoteQuantity)
                  if (!quote) return null

                  return (
                    <div className="space-y-3">
                      <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-700">Material ({material.name} {material.thickness}mm)</span>
                          <span className="font-medium text-neutral-900">${quote.materialCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-700">Laser Cutting</span>
                          <span className="font-medium text-neutral-900">${quote.cuttingCost.toFixed(2)}</span>
                        </div>
                        {quote.totalBends > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-700">Bending ({quote.totalBends} bends)</span>
                            <span className="font-medium text-neutral-900">${quote.bendCost.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-neutral-300 pt-2 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-700">Subtotal (per unit)</span>
                            <span className="font-medium text-neutral-900">${quote.subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                        {quote.quantity > 1 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-700">Quantity</span>
                            <span className="font-medium text-neutral-900">× {quote.quantity}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-600">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-neutral-900">Total Estimate</span>
                          <span className="text-2xl font-bold text-green-700">${quote.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-500 italic">
                        * This is an estimate. Final price may vary based on complexity and material availability.
                      </p>
                    </div>
                  )
                })()}
              </>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg transition font-semibold"
              >
                Close
              </button>
              {shapes.length > 0 && (
                <button
                  onClick={() => {
                    setIsQuoteModalOpen(false)
                    setIsSubmitModalOpen(true)
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                >
                  Submit Job
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Job Modal */}
      <SubmitJobModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitJob}
        isSubmitting={isSubmitting}
      />

      {/* Success/Error Toast Notification */}
      {submitMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg max-w-md ${
              submitMessage.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {submitMessage.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{submitMessage.text}</p>
              </div>
              <button
                onClick={() => setSubmitMessage(null)}
                className="flex-shrink-0 text-white hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
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
