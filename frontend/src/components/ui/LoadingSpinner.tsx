import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => (
  <div
    className={`${sizes[size]} rounded-full border-gray-300 dark:border-gray-600 border-t-primary-600 animate-spin ${className}`}
    role="status"
    aria-label="Loading"
  />
)

export default LoadingSpinner
