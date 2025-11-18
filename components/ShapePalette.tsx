'use client'

import { useState } from 'react'
import { ShapeType } from '@/lib/types'

interface ShapePaletteProps {
  onShapeSelect: (shapeType: ShapeType) => void
  displayUnit: 'mm' | 'cm' | 'm'
}

interface ShapeConfig {
  type: ShapeType
  icon: React.ReactNode
  label: string
}

export default function ShapePalette({ onShapeSelect, displayUnit }: ShapePaletteProps) {
  const [draggedShape, setDraggedShape] = useState<ShapeType | null>(null)

  const shapes: ShapeConfig[] = [
    {
      type: 'rectangle',
      label: 'Rectangle',
      icon: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <rect x="5" y="10" width="30" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'circle',
      label: 'Circle',
      icon: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'triangle',
      label: 'Triangle',
      icon: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <polygon points="20,5 35,35 5,35" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'pentagon',
      label: 'Pentagon',
      icon: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <polygon points="20,5 35,15 30,32 10,32 5,15" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'hexagon',
      label: 'Hexagon',
      icon: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <polygon points="20,5 32,12 32,28 20,35 8,28 8,12" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'star',
      label: 'Star',
      icon: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <polygon points="20,3 23,15 35,15 25,23 28,35 20,27 12,35 15,23 5,15 17,15" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      type: 'heart',
      label: 'Heart',
      icon: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <path
            d="M20,35 C20,35 5,25 5,15 C5,10 8,7 12,7 C15,7 18,9 20,12 C22,9 25,7 28,7 C32,7 35,10 35,15 C35,25 20,35 20,35 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      type: 'text',
      label: 'Text',
      icon: (
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          <text x="10" y="28" fontFamily="Arial" fontSize="20" fill="currentColor" fontWeight="bold">
            A
          </text>
        </svg>
      ),
    },
  ]

  const handleDragStart = (shapeType: ShapeType) => {
    setDraggedShape(shapeType)
  }

  const handleDragEnd = () => {
    setDraggedShape(null)
  }

  const handleClick = (shapeType: ShapeType) => {
    onShapeSelect(shapeType)
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {shapes.map((shape) => (
          <button
            key={shape.type}
            draggable
            onDragStart={() => handleDragStart(shape.type)}
            onDragEnd={handleDragEnd}
            onClick={() => handleClick(shape.type)}
            className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-all cursor-move
              ${
                draggedShape === shape.type
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                  : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600'
              }
              text-neutral-900 dark:text-neutral-100`}
            title={`Drag to canvas or click to add ${shape.label}`}
          >
            <div className="mb-1">{shape.icon}</div>
            <span className="text-xs text-center">{shape.label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 italic mt-2">
        Drag shapes to canvas or click to add at center
      </p>
    </div>
  )
}
