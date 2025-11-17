'use client'

import { useState, useEffect } from 'react'
import DesignCanvas from '@/components/DesignCanvas'
import { DesignProvider, useDesign } from '@/lib/designContext'
import { Rectangle, Circle, Material, Hole } from '@/lib/types'
import { exportToSVG, downloadSVG } from '@/lib/exportSVG'

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
    }
    addShape(newCircle)
    selectShape(newCircle.id)
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Spartan Design</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setIs2DView(!is2DView)}
            className={`px-4 py-2 rounded transition ${
              is2DView
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {is2DView ? '2D View' : '3D View'}
          </button>
          <button
            onClick={handleExportSVG}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
          >
            Export SVG
          </button>
          <button
            onClick={handleGetQuote}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition"
          >
            Get Quote
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Tools */}
        <aside className="w-64 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Tools</h2>
          <div className="space-y-2">
            <button
              onClick={handleAddRectangle}
              className="w-full px-4 py-2 bg-white border rounded hover:bg-gray-50 transition"
            >
              + Rectangle
            </button>
            <button
              onClick={handleAddCircle}
              className="w-full px-4 py-2 bg-white border rounded hover:bg-gray-50 transition"
            >
              + Circle
            </button>
            <button
              disabled
              className="w-full px-4 py-2 bg-gray-200 border rounded cursor-not-allowed text-gray-500"
            >
              + Custom Path (Coming Soon)
            </button>
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4">Metal Type</h2>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="metalType"
                value="Mild Steel"
                checked={selectedMetalType === 'Mild Steel'}
                onChange={(e) => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4"
              />
              <span className="font-medium">Mild Steel</span>
            </label>
            <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="metalType"
                value="Stainless Steel"
                checked={selectedMetalType === 'Stainless Steel'}
                onChange={(e) => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4"
              />
              <span className="font-medium">Stainless Steel</span>
            </label>
            <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="metalType"
                value="Aluminium"
                checked={selectedMetalType === 'Aluminium'}
                onChange={(e) => handleMetalTypeChange(e.target.value)}
                className="mr-3 w-4 h-4"
              />
              <span className="font-medium">Aluminium</span>
            </label>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-4">Thickness</h2>
          <select
            value={selectedThickness}
            onChange={(e) => handleThicknessChange(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border rounded"
          >
            {availableThicknesses.map(thickness => {
              return (
                <option key={thickness} value={thickness}>
                  {thickness}mm
                </option>
              )
            })}
          </select>

          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Selected:</strong> {material.name} {material.thickness}mm
            </p>
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4">Units</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setDisplayUnit('mm')}
              className={`flex-1 px-3 py-2 rounded border transition ${
                displayUnit === 'mm'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-50 border-gray-300'
              }`}
            >
              mm
            </button>
            <button
              onClick={() => setDisplayUnit('cm')}
              className={`flex-1 px-3 py-2 rounded border transition ${
                displayUnit === 'cm'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-50 border-gray-300'
              }`}
            >
              cm
            </button>
            <button
              onClick={() => setDisplayUnit('m')}
              className={`flex-1 px-3 py-2 rounded border transition ${
                displayUnit === 'm'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white hover:bg-gray-50 border-gray-300'
              }`}
            >
              m
            </button>
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4">
            {selectedShape ? 'Edit Shape Dimensions' : 'New Shape Dimensions'}
          </h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1 font-medium">
                {selectedShape?.type === 'circle' ? `Diameter (${displayUnit})` : `Width (${displayUnit})`}
              </label>
              <input
                type="number"
                value={defaultWidth}
                onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="2"
                step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
              />
            </div>
            {selectedShape?.type !== 'circle' && (
              <div>
                <label className="block text-sm mb-1 font-medium">Length ({displayUnit})</label>
                <input
                  type="number"
                  value={defaultLength}
                  onChange={(e) => handleLengthChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                  min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                />
              </div>
            )}
          </div>

          {!selectedShape && (
            <p className="mt-2 text-xs text-gray-500 italic">
              Set dimensions, then click + Rectangle or + Circle to create a shape
            </p>
          )}

          {selectedShape && (
            <>
              <h2 className="text-lg font-semibold mt-8 mb-4">Shape Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={handleDeleteShape}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  Delete Shape
                </button>
              </div>

              <h2 className="text-lg font-semibold mt-8 mb-4">
                Add New Hole
              </h2>
              <div className="space-y-3 p-3 bg-gray-50 rounded border">
                <div>
                  <label className="block text-xs mb-1 font-medium">Hole Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddHole('circle')}
                      className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition"
                    >
                      + Circle
                    </button>
                    <button
                      onClick={() => handleAddHole('rectangle')}
                      className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition"
                    >
                      + Rectangle
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1 font-medium">
                      Circle Ø ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleDiameter}
                      onChange={(e) => setNewHoleDiameter(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">
                      Rect W ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleWidth}
                      onChange={(e) => setNewHoleWidth(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs mb-1 font-medium">
                      Rect H ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleHeight}
                      onChange={(e) => setNewHoleHeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                      min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1 font-medium">
                      Position X ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleX}
                      onChange={(e) => setNewHoleX(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 font-medium">
                      Position Y ({displayUnit})
                    </label>
                    <input
                      type="number"
                      value={newHoleY}
                      onChange={(e) => setNewHoleY(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded text-sm"
                      step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic">
                  Position is relative to shape center (0,0)
                </p>
              </div>

              {selectedShape.holes && selectedShape.holes.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold mt-8 mb-4">
                    Existing Holes ({selectedShape.holes.length})
                  </h2>
                  <div className="space-y-2">
                    {selectedShape.holes.map((hole, index) => (
                      <div key={hole.id} className="p-3 bg-gray-50 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            {hole.type === 'circle' ? 'Circle' : 'Rectangle'} Hole {index + 1}
                          </span>
                          <button
                            onClick={() => handleDeleteHole(hole.id)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
                          >
                            Delete
                          </button>
                        </div>

                        {editingHoleId === hole.id ? (
                          <div className="space-y-2">
                            {hole.type === 'circle' ? (
                              <div>
                                <label className="block text-xs mb-1">Diameter ({displayUnit})</label>
                                <input
                                  type="number"
                                  value={hole.radius ? fromMm(hole.radius * 2, displayUnit) : 0}
                                  onChange={(e) => {
                                    const diameterMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                    handleUpdateHole(hole.id, { radius: diameterMm / 2 })
                                  }}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                  min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                />
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label className="block text-xs mb-1">Width ({displayUnit})</label>
                                  <input
                                    type="number"
                                    value={fromMm(hole.width || 0, displayUnit)}
                                    onChange={(e) => {
                                      const widthMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                      handleUpdateHole(hole.id, { width: widthMm })
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                    step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                    min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs mb-1">Height ({displayUnit})</label>
                                  <input
                                    type="number"
                                    value={fromMm(hole.height || 0, displayUnit)}
                                    onChange={(e) => {
                                      const heightMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                      handleUpdateHole(hole.id, { height: heightMm })
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                    step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                    min={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                  />
                                </div>
                              </>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs mb-1">Position X ({displayUnit})</label>
                                <input
                                  type="number"
                                  value={fromMm(hole.position.x, displayUnit)}
                                  onChange={(e) => {
                                    const xMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                    handleUpdateHole(hole.id, { position: { ...hole.position, x: xMm } })
                                  }}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                />
                              </div>
                              <div>
                                <label className="block text-xs mb-1">Position Y ({displayUnit})</label>
                                <input
                                  type="number"
                                  value={fromMm(hole.position.y, displayUnit)}
                                  onChange={(e) => {
                                    const yMm = toMm(parseFloat(e.target.value) || 0, displayUnit)
                                    handleUpdateHole(hole.id, { position: { ...hole.position, y: yMm } })
                                  }}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  step={displayUnit === 'm' ? '0.001' : displayUnit === 'cm' ? '0.01' : '0.1'}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingHoleId(null)}
                              className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition"
                            >
                              Done Editing
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-gray-600">
                              {hole.type === 'circle'
                                ? `Ø ${hole.radius ? fromMm(hole.radius * 2, displayUnit).toFixed(2) : 0}${displayUnit}`
                                : `${fromMm(hole.width || 0, displayUnit).toFixed(2)} × ${fromMm(hole.height || 0, displayUnit).toFixed(2)}${displayUnit}`}
                            </p>
                            <p className="text-xs text-gray-600">
                              Position: ({fromMm(hole.position.x, displayUnit).toFixed(2)}, {fromMm(hole.position.y, displayUnit).toFixed(2)}){displayUnit}
                            </p>
                            <button
                              onClick={() => setEditingHoleId(hole.id)}
                              className="mt-2 w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
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

          <div className="mt-8 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Shapes:</strong> {shapes.length}
            </p>
            <p className="text-sm text-gray-700">
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
