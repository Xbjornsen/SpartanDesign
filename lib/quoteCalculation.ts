import {
  Shape,
  Rectangle,
  Circle,
  Triangle,
  Pentagon,
  Hexagon,
  Star,
  Heart,
  Material,
} from './types'

export interface QuoteDetails {
  totalArea: number // in square meters
  materialCost: number
  shapes: {
    type: string
    area: number
    count: number
  }[]
  material: {
    name: string
    thickness: number
    unit: string
    pricePerSquareMeter: number
  }
}

/**
 * Calculate the area of a shape in square millimeters
 */
function calculateShapeArea(shape: Shape): number {
  switch (shape.type) {
    case 'rectangle': {
      const rect = shape as Rectangle
      return rect.width * rect.height
    }

    case 'circle': {
      const circle = shape as Circle
      return Math.PI * circle.radius * circle.radius
    }

    case 'triangle': {
      const triangle = shape as Triangle
      // Equilateral triangle: area = (sqrt(3)/4) * side^2
      return (Math.sqrt(3) / 4) * triangle.size * triangle.size
    }

    case 'pentagon': {
      const pentagon = shape as Pentagon
      // Regular pentagon: area = (1/4) * sqrt(5(5+2*sqrt(5))) * side^2
      // Simplified for inscribed circle radius: area ≈ 2.377 * r^2
      return 2.377 * pentagon.size * pentagon.size
    }

    case 'hexagon': {
      const hexagon = shape as Hexagon
      // Regular hexagon: area = (3*sqrt(3)/2) * side^2
      return ((3 * Math.sqrt(3)) / 2) * hexagon.size * hexagon.size
    }

    case 'star': {
      const star = shape as Star
      // Star area approximation based on outer and inner radius
      const outerArea = Math.PI * star.outerRadius * star.outerRadius
      const innerArea = Math.PI * star.innerRadius * star.innerRadius
      return (outerArea + innerArea) / 2
    }

    case 'heart': {
      const heart = shape as Heart
      // Heart shape area approximation (roughly 75% of a circle)
      const radius = heart.size / 2
      return 0.75 * Math.PI * radius * radius
    }

    default:
      return 0
  }
}

/**
 * Calculate quote details for the entire design
 */
export function calculateQuote(shapes: Shape[], material: Material): QuoteDetails {
  // Group shapes by type
  const shapesByType: Record<string, { area: number; count: number }> = {}

  let totalAreaMm2 = 0

  shapes.forEach(shape => {
    const area = calculateShapeArea(shape)
    totalAreaMm2 += area

    const typeName = shape.type.charAt(0).toUpperCase() + shape.type.slice(1)
    if (!shapesByType[typeName]) {
      shapesByType[typeName] = { area: 0, count: 0 }
    }
    shapesByType[typeName].area += area
    shapesByType[typeName].count += 1
  })

  // Convert to square meters (1 m² = 1,000,000 mm²)
  const totalAreaM2 = totalAreaMm2 / 1_000_000

  // Calculate material cost
  const materialCost = totalAreaM2 * material.pricePerSquareMeter

  // Format shape details
  const shapeDetails = Object.entries(shapesByType).map(([type, data]) => ({
    type,
    area: data.area / 1_000_000, // Convert to m²
    count: data.count,
  }))

  return {
    totalArea: totalAreaM2,
    materialCost,
    shapes: shapeDetails,
    material: {
      name: material.name,
      thickness: material.thickness,
      unit: material.unit,
      pricePerSquareMeter: material.pricePerSquareMeter,
    },
  }
}

/**
 * Format quote details as readable text for email
 */
export function formatQuoteForEmail(quote: QuoteDetails): string {
  let text = 'QUOTE DETAILS\n'
  text += '='.repeat(50) + '\n\n'

  text += `Material: ${quote.material.name}\n`
  text += `Thickness: ${quote.material.thickness}${quote.material.unit}\n`
  text += `Price per m²: $${quote.material.pricePerSquareMeter.toFixed(2)}\n\n`

  text += 'SHAPES:\n'
  text += '-'.repeat(50) + '\n'
  quote.shapes.forEach(shape => {
    text += `${shape.type}: ${shape.count} piece(s), ${(shape.area * 1000).toFixed(2)} cm² total\n`
  })
  text += '\n'

  text += `TOTAL AREA: ${(quote.totalArea * 10000).toFixed(2)} cm² (${quote.totalArea.toFixed(6)} m²)\n`
  text += `ESTIMATED COST: $${quote.materialCost.toFixed(2)}\n`
  text += '\n'
  text +=
    'Note: This is an estimated cost for materials only. Final pricing may vary based on cutting complexity, quantity, and additional services.\n'

  return text
}
