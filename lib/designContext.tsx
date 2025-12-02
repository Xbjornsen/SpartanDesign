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
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
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

  // Undo/Redo history
  const [history, setHistory] = useState<Shape[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Helper to push state to history
  const pushHistory = (newShapes: Shape[]) => {
    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1)
      // Add new state
      newHistory.push(JSON.parse(JSON.stringify(newShapes))) // Deep clone
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift()
        setHistoryIndex(prev => Math.max(0, prev))
        return newHistory
      }
      setHistoryIndex(newHistory.length - 1)
      return newHistory
    })
  }

  const addShape = (shape: Shape) => {
    setShapes(prev => {
      const newShapes = [...prev, shape]
      pushHistory(newShapes)
      return newShapes
    })
  }

  const removeShape = (id: string) => {
    setShapes(prev => {
      const newShapes = prev.filter(shape => shape.id !== id)
      pushHistory(newShapes)
      return newShapes
    })
    if (selectedShapeId === id) {
      setSelectedShapeId(null)
    }
  }

  const updateShape = (id: string, updates: Partial<Shape>) => {
    setShapes(prev => {
      const newShapes = prev.map(shape =>
        shape.id === id ? ({ ...shape, ...updates } as Shape) : shape
      )
      pushHistory(newShapes)
      return newShapes
    })
  }

  const selectShape = (id: string | null) => {
    setSelectedShapeId(id)
  }

  const clearDesign = () => {
    setShapes([])
    setSelectedShapeId(null)
    setHistory([[]])
    setHistoryIndex(0)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setShapes(JSON.parse(JSON.stringify(history[newIndex]))) // Deep clone
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setShapes(JSON.parse(JSON.stringify(history[newIndex]))) // Deep clone
    }
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

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
        undo,
        redo,
        canUndo,
        canRedo,
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
