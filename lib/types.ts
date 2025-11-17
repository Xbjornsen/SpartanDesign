// Shape types
export type ShapeType = 'rectangle' | 'circle' | 'custom'

export interface Position {
  x: number
  y: number
}

export interface Hole {
  id: string
  type: 'rectangle' | 'circle'
  position: Position // Relative to parent shape
  width?: number  // For rectangle holes
  height?: number // For rectangle holes
  radius?: number // For circle holes
}

export interface BaseShape {
  id: string
  type: ShapeType
  position: Position
  color?: string
  holes?: Hole[] // Cut holes in the shape
}

export interface Rectangle extends BaseShape {
  type: 'rectangle'
  width: number
  height: number
}

export interface Circle extends BaseShape {
  type: 'circle'
  radius: number
}

export interface CustomPath extends BaseShape {
  type: 'custom'
  points: Position[]
}

export type Shape = Rectangle | Circle | CustomPath

// Material types
export interface Material {
  id: string
  name: string
  thickness: number // in mm
  pricePerSquareMeter: number
  unit: 'mm' | 'inch'
}

// Design state
export interface DesignState {
  shapes: Shape[]
  selectedShapeId: string | null
  material: Material
  gridUnit: 'mm' | 'inch'
}
