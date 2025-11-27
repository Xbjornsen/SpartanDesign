'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Shape, Material, DesignState } from './types'

interface DesignContextType extends DesignState {
  addShape: (shape: Shape) => void
  removeShape: (id: string) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  selectShape: (id: string | null) => void
  setMaterial: (material: Material) => void
  clearDesign: () => void
}

const defaultMaterial: Material = {
  id: 'steel-2mm',
  name: 'Mild Steel',
  thickness: 2,
  pricePerSquareMeter: 60,
  unit: 'mm',
}

const DesignContext = createContext<DesignContextType | undefined>(undefined)

export function DesignProvider({ children }: { children: ReactNode }) {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [material, setMaterial] = useState<Material>(defaultMaterial)
  const [gridUnit] = useState<'mm' | 'inch'>('mm')

  const addShape = (shape: Shape) => {
    setShapes(prev => [...prev, shape])
  }

  const removeShape = (id: string) => {
    setShapes(prev => prev.filter(shape => shape.id !== id))
    if (selectedShapeId === id) {
      setSelectedShapeId(null)
    }
  }

  const updateShape = (id: string, updates: Partial<Shape>) => {
    setShapes(prev =>
      prev.map(shape => (shape.id === id ? ({ ...shape, ...updates } as Shape) : shape))
    )
  }

  const selectShape = (id: string | null) => {
    setSelectedShapeId(id)
  }

  const clearDesign = () => {
    setShapes([])
    setSelectedShapeId(null)
  }

  return (
    <DesignContext.Provider
      value={{
        shapes,
        selectedShapeId,
        material,
        gridUnit,
        addShape,
        removeShape,
        updateShape,
        selectShape,
        setMaterial,
        clearDesign,
      }}
    >
      {children}
    </DesignContext.Provider>
  )
}

export function useDesign() {
  const context = useContext(DesignContext)
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider')
  }
  return context
}
