'use client'

import { useState, useEffect } from 'react'
import DesignCanvas from '@/components/DesignCanvas'
import { DesignProvider, useDesign } from '@/lib/designContext'
import { Rectangle, Circle, Triangle, Pentagon, Hexagon, Star, Heart, Text as TextShape, Material, Hole, ShapeType, Shape } from '@/lib/types'
import { exportToSVG, downloadSVG } from '@/lib/exportSVG'
import ThemeToggle from '@/components/ThemeToggle'
import ShapePalette from '@/components/ShapePalette'

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
  { id: 'stainless-1mm', name: 'Stainless Steel', thickness: 1, pricePerSquareMeter: 65, unit: 'mm' },
  { id: 'stainless-1.5mm', name: 'Stainless Steel', thickness: 1.5, pricePerSquareMeter: 75, unit: 'mm' },
  { id: 'stainless-2mm', name: 'Stainless Steel', thickness: 2, pricePerSquareMeter: 85, unit: 'mm' },
  { id: 'stainless-3mm', name: 'Stainless Steel', thickness: 3, pricePerSquareMeter: 105, unit: 'mm' },
  { id: 'stainless-4mm', name: 'Stainless Steel', thickness: 4, pricePerSquareMeter: 125, unit: 'mm' },
  { id: 'stainless-5mm', name: 'Stainless Steel', thickness: 5, pricePerSquareMeter: 150, unit: 'mm' },
  { id: 'stainless-6mm', name: 'Stainless Steel', thickness: 6, pricePerSquareMeter: 175, unit: 'mm' },

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
  const { addShape, shapes, material, setMaterial, selectedShapeId, updateShape, removeShape, selectShape } = useDesign()
  const [defaultWidth, setDefaultWidth] = useState(2)
  const [defaultLength, setDefaultLength] = useState(2)
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

  // Text editing states
  const [textContent, setTextContent] = useState('TEXT')
  const [textFontSize, setTextFontSize] = useState(10)

  const selectedShape = shapes.find(s => s.id === selectedShapeId)

  // Unit conversion functions (internal storage is always in mm)
  const toMm = (value: number, unit: 'mm' | 'cm' | 'm'): number => {
    switch (unit) {
      case 'mm': return value
      case 'cm': return value * 10
      case 'm': return value * 1000
    }
  }

  const fromMm = (valueMm: number, unit: 'mm' | 'cm' | 'm'): number => {
    switch (unit) {
      case 'mm': return valueMm
      case 'cm': return valueMm / 10
      case 'm': return valueMm / 1000
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
    const matchingMaterial = materials.find(m => m.name === metalType && m.thickness === selectedThickness)
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
    const matchingMaterial = materials.find(m => m.name === selectedMetalType && m.thickness === thickness)
    if (matchingMaterial) {
      setMaterial(matchingMaterial)
    }
  }

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
      color: '#3b82f6',
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
      color: '#3b82f6',
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
          color: '#3b82f6',
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
          color: '#3b82f6',
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
          color: '#3b82f6',
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
          color: '#3b82f6',
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
          color: '#3b82f6',
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
          color: '#3b82f6',
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
          color: '#3b82f6',
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
          color: '#3b82f6',
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
        : { radius: toMm(newHoleDiameter, displayUnit) / 2 }
      )
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

  const handleGetQuote = () => {
    // TODO: Implement quote calculation
    alert('Quote calculation coming soon!')
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white p-4 flex justify-between items-center shadow-md border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Spartan Design</h1>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          <button
            onClick={() => setIs2DView(!is2DView)}
            className={`px-4 py-2 rounded-lg transition-all ${
              is2DView
                ? 'bg-secondary-400 hover:bg-secondary-500 text-white shadow-sm'
                : 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-neutral-900 dark:text-white shadow-sm'
            }`}
          >
            {is2DView ? '2D View' : '3D View'}
          </button>
          <button
            onClick={handleExportSVG}
            className="px-4 py-2 bg-accent-400 hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-600 text-white rounded-lg transition-all shadow-sm"
          >
            Export SVG
          </button>
          <button
            onClick={handleGetQuote}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-all shadow-sm"
          >
            Get Quote
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Tools */}
        <aside className="w-72 bg-neutral-100 dark:bg-neutral-800 px-6 py-5 overflow-y-auto border-r border-neutral-200 dark:border-neutral-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Tools</h2>
          <div className="space-y-2">
            <button
              onClick={handleAddRectangle}
              className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition text-neutral-900 dark:text-neutral-100"
            >
              + Rectangle
            </button>
            <button
              onClick={handleAddCircle}
              className="w-full px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition text-neutral-900 dark:text-neutral-100"
            >
              + Circle
            </button>
            <button
              disabled
              className="w-full px-4 py-2 bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg cursor-not-allowed text-neutral-500 dark:text-neutral-500"
            >
              + Custom Path (Coming Soon)
            </button>
          </div>

          <div className="mt-8">
            <ShapePalette onShapeSelect={handleAddShapeFromPalette} displayUnit={displayUnit} />
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4 text-neutral-900 dark:text-neutral-100">Metal Type</h2>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition bg-white dark:bg-neutral-700">
              <input
                type="radio"
                name="metalType"
                value="Mild Steel"
                checked={selectedMetalType === 'Mild Steel'}
                onChange={(e) => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4 accent-primary-500"
              />
              <span className="font-medium text-neutral-900 dark:text-neutral-100">Mild Steel</span>
            </label>
            <label className="flex items-center p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition bg-white dark:bg-neutral-700">
              <input
                type="radio"
                name="metalType"
                value="Stainless Steel"
                checked={selectedMetalType === 'Stainless Steel'}
                onChange={(e) => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4 accent-primary-500"
              />
              <span className="font-medium text-neutral-900 dark:text-neutral-100">Stainless Steel</span>
            </label>
            <label className="flex items-center p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition bg-white dark:bg-neutral-700">
              <input
                type="radio"
                name="metalType"
                value="Aluminium"
                checked={selectedMetalType === 'Aluminium'}
                onChange={(e) => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4 accent-primary-500"
              />
              <span className="font-medium text-neutral-900 dark:text-neutral-100">Aluminium</span>
            </label>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-4 text-neutral-900 dark:text-neutral-100">Thickness</h2>
          <select
            value={selectedThickness}
            onChange={(e) => handleThicknessChange(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          >
            {availableThicknesses.map(thickness => {
              return (
                <option key={thickness} value={thickness}>
                  {thickness}mm
                </option>
              )
            })}
          </select>

          <div className="mt-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-700">
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              <strong>Selected:</strong> {material.name} {material.thickness}mm
            </p>
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4 text-neutral-900 dark:text-neutral-100">Units</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDisplayUnit('mm')}
              className={`flex-1 px-3 py-2 rounded-lg border transition ${
                displayUnit === 'mm'
                  ? 'bg-accent-500 text-white border-accent-500'
                  : 'bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100'
              }`}
            >
              mm
            </button>
            <button
              onClick={() => setDisplayUnit('cm')}
              className={`flex-1 px-3 py-2 rounded-lg border transition ${
                displayUnit === 'cm'
                  ? 'bg-accent-500 text-white border-accent-500'
                  : 'bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100'
              }`}
            >
              cm
            </button>
            <button
              onClick={() => setDisplayUnit('m')}
              className={`flex-1 px-3 py-2 rounded-lg border transition ${
                displayUnit === 'm'
                  ? 'bg-accent-500 text-white border-accent-500'
                  : 'bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100'
              }`}
            >
              m
            </button>
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4 text-neutral-900 dark:text-neutral-100">
            {selectedShape ? (selectedShape.type === 'text' ? 'Edit Text' : 'Edit Shape Dimensions') : 'New Shape Dimensions'}
          </h2>
          {selectedShape?.type === 'text' ? (
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">Text Content</label>
                <input
                  type="text"
                  value={textContent}
                  onChange={(e) => handleTextContentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  placeholder="Enter text..."
                />
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">Font Size ({displayUnit})</label>
                <input
                  type="number"
                  value={textFontSize}
                  onChange={(e) => handleTextFontSizeChange(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  placeholder="10"
                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '1'}
                  min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.1' : '1'}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedShape?.type === 'circle' ? `Diameter (${displayUnit})` : `Width (${displayUnit})`}
                </label>
                <input
                  type="number"
                  value={defaultWidth}
                  onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  placeholder="2"
                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                  min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                />
              </div>
              {selectedShape?.type !== 'circle' && (
                <div>
                  <label className="block text-sm mb-1 font-medium text-neutral-900 dark:text-neutral-100">Length ({displayUnit})</label>
                  <input
                    type="number"
                    value={defaultLength}
                    onChange={(e) => handleLengthChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-accent-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    placeholder="2"
                    step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                  />
                </div>
              )}
            </div>
          )}

          {!selectedShape && (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 italic">
              Set dimensions, then click + Rectangle or + Circle to create a shape
            </p>
          )}

          {selectedShape && (
            <>
              <h2 className="text-lg font-semibold mt-8 mb-4 text-neutral-900 dark:text-neutral-100">Shape Actions</h2>
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

              <h2 className="text-lg font-semibold mt-8 mb-4 text-neutral-900 dark:text-neutral-100">
                Add New Hole
              </h2>
              <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-300 dark:border-neutral-700">
                <div>
                  <label className="block text-xs mb-1 font-medium text-neutral-900 dark:text-neutral-100">Hole Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddHole('circle')}
                      className="flex-1 px-3 py-2 bg-secondary-400 hover:bg-secondary-500 text-white rounded-lg text-sm transition shadow-sm"
                    >
                      + Circle
                    </button>
                    <button
                      onClick={() => handleAddHole('rectangle')}
                      className="flex-1 px-3 py-2 bg-secondary-400 hover:bg-secondary-500 text-white rounded-lg text-sm transition shadow-sm"
                    >
                      + Rectangle
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1 font-medium text-neutral-900 dark:text-neutral-100">
                      Circle Ø ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleDiameter}
                      onChange={(e) => setNewHoleDiameter(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium text-neutral-900 dark:text-neutral-100">
                      Rect W ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleWidth}
                      onChange={(e) => setNewHoleWidth(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs mb-1 font-medium text-neutral-900 dark:text-neutral-100">
                      Rect H ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleHeight}
                      onChange={(e) => setNewHoleHeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1 font-medium text-neutral-900 dark:text-neutral-100">
                      Position X ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleX}
                      onChange={(e) => setNewHoleX(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium text-neutral-900 dark:text-neutral-100">
                      Position Y ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleY}
                      onChange={(e) => setNewHoleY(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                  Position is relative to shape center (0,0)
                </p>
              </div>

              {selectedShape.holes && selectedShape.holes.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold mt-8 mb-4 text-neutral-900 dark:text-neutral-100">
                    Existing Holes ({selectedShape.holes.length})
                  </h2>
                  <div className="space-y-2">
                    {selectedShape.holes.map((hole, index) => (
                      <div key={hole.id} className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-300 dark:border-neutral-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {hole.type === 'circle' ? 'Circle' : 'Rectangle'} Hole {index + 1}
                          </span>
                          <button
                            onClick={() => handleDeleteHole(hole.id)}
                            className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs transition shadow-sm"
                          >
                            Delete
                          </button>
                        </div>

                        {editingHoleId === hole.id ? (
                          <div className="space-y-2">
                            {hole.type === 'circle' ? (
                              <div>
                                <label className="block text-xs mb-1 text-neutral-900 dark:text-neutral-100">Diameter ({displayUnit})</label>
                                <input
                                  type="number"
                                  value={hole.radius ? fromMm(hole.radius * 2, displayUnit) : 0}
                                  onChange={(e) => {
                                    const diameterMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                    handleUpdateHole(hole.id, { radius: diameterMm / 2 })
                                  }}
                                  className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                  min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                />
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label className="block text-xs mb-1 text-neutral-900 dark:text-neutral-100">Width ({displayUnit})</label>
                                  <input
                                    type="number"
                                    value={fromMm(hole.width || 0, displayUnit)}
                                    onChange={(e) => {
                                      const widthMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                      handleUpdateHole(hole.id, { width: widthMm })
                                    }}
                                    className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                    step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                    min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs mb-1 text-neutral-900 dark:text-neutral-100">Height ({displayUnit})</label>
                                  <input
                                    type="number"
                                    value={fromMm(hole.height || 0, displayUnit)}
                                    onChange={(e) => {
                                      const heightMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                      handleUpdateHole(hole.id, { height: heightMm })
                                    }}
                                    className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                    step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                    min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                  />
                                </div>
                              </>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs mb-1 text-neutral-900 dark:text-neutral-100">Position X ({displayUnit})</label>
                                <input
                                  type="number"
                                  value={fromMm(hole.position.x, displayUnit)}
                                  onChange={(e) => {
                                    const xMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                    handleUpdateHole(hole.id, { position: { ...hole.position, x: xMm } })
                                  }}
                                  className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                />
                              </div>
                              <div>
                                <label className="block text-xs mb-1 text-neutral-900 dark:text-neutral-100">Position Y ({displayUnit})</label>
                                <input
                                  type="number"
                                  value={fromMm(hole.position.y, displayUnit)}
                                  onChange={(e) => {
                                    const yMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                    handleUpdateHole(hole.id, { position: { ...hole.position, y: yMm } })
                                  }}
                                  className="w-full px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingHoleId(null)}
                              className="w-full px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition shadow-sm"
                            >
                              Done Editing
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-neutral-700 dark:text-neutral-300">
                              {hole.type === 'circle'
                                ? `Ø ${hole.radius ? fromMm(hole.radius * 2, displayUnit).toFixed(2) : 0}${displayUnit}`
                                : `${fromMm(hole.width || 0, displayUnit).toFixed(2)} × ${fromMm(hole.height || 0, displayUnit).toFixed(2)}${displayUnit}`}
                            </p>
                            <p className="text-xs text-neutral-700 dark:text-neutral-300">
                              Position: ({fromMm(hole.position.x, displayUnit).toFixed(2)}, {fromMm(hole.position.y, displayUnit).toFixed(2)}){displayUnit}
                            </p>
                            <button
                              onClick={() => setEditingHoleId(hole.id)}
                              className="mt-2 w-full px-3 py-1 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm transition shadow-sm"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <div className="mt-8 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg border border-accent-200 dark:border-accent-700">
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              <strong>Shapes:</strong> {shapes.length}
            </p>
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              <strong>Selected:</strong> {selectedShape ? selectedShape.type : 'None'}
            </p>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="flex-1">
          <DesignCanvas is2DView={is2DView} displayUnit={displayUnit} />
        </main>
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
