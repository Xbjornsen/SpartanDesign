// Shape types
export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'heart'
  | 'text'
  | 'custom'

export interface Position {
  x: number
  y: number
}

export interface Hole {
  id: string
  type: 'rectangle' | 'circle'
  position: Position // Relative to parent shape
  width?: number // For rectangle holes
  height?: number // For rectangle holes
  radius?: number // For circle holes
}

export interface BaseShape {
  id: string
  type: ShapeType
  position: Position
  color?: string
  holes?: Hole[] // Cut holes in the shape
  locked?: boolean // Whether the shape is locked in place
  rotation?: number // Rotation in radians
}

export interface Rectangle extends BaseShape {
  type: 'rectangle'
  width: number
  height: number
  cornerRadius?: number // Corner radius in mm for rounded corners
}

export interface Circle extends BaseShape {
  type: 'circle'
  radius: number
}

export interface Triangle extends BaseShape {
  type: 'triangle'
  size: number // Side length
}

export interface Pentagon extends BaseShape {
  type: 'pentagon'
  size: number // Radius
}

export interface Hexagon extends BaseShape {
  type: 'hexagon'
  size: number // Radius
}

export interface Star extends BaseShape {
  type: 'star'
  outerRadius: number
  innerRadius: number
  points: number // Number of star points (default 5)
}

export interface Heart extends BaseShape {
  type: 'heart'
  size: number
}

export interface Text extends BaseShape {
  type: 'text'
  text: string
  fontSize: number
  fontFamily?: string
}

export interface CustomPath extends BaseShape {
  type: 'custom'
  points: Position[]
}

export type Shape =
  | Rectangle
  | Circle
  | Triangle
  | Pentagon
  | Hexagon
  | Star
  | Heart
  | Text
  | CustomPath

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
