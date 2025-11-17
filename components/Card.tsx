import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  borderColor?: 'bronze' | 'crimson' | 'gold'
}

export default function Card({
  children,
  className = '',
  borderColor = 'bronze'
}: CardProps) {
  const borderColors = {
    bronze: 'border-spartan-bronze-500',
    crimson: 'border-spartan-crimson-500',
    gold: 'border-spartan-gold-500'
  }

  return (
    <div className={`bg-white border-l-4 ${borderColors[borderColor]} shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 ${className}`}>
      {children}
    </div>
  )
}
