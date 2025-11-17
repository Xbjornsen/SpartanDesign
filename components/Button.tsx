import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'gold'
  onClick?: () => void
  className?: string
}

export default function Button({
  children,
  variant = 'primary',
  onClick,
  className = ''
}: ButtonProps) {
  const baseStyles = 'px-8 py-3 font-bold uppercase tracking-wider rounded-none border-2 transition-all duration-300'

  const variants = {
    primary: 'bg-spartan-crimson-600 text-white border-spartan-crimson-600 hover:bg-transparent hover:text-spartan-crimson-600 shadow-lg hover:shadow-xl',
    outline: 'bg-transparent text-spartan-stone-900 border-spartan-bronze-600 hover:bg-spartan-bronze-600 hover:text-white',
    gold: 'bg-spartan-gold-500 text-spartan-stone-900 border-spartan-gold-500 hover:bg-transparent hover:text-spartan-gold-600'
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
