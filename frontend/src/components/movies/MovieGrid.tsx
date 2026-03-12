import React from 'react'
import type { MovieSummary } from '../../types'
import MovieCard from './MovieCard'

interface MovieGridProps {
  movies: MovieSummary[]
  loading?: boolean
  emptyMessage?: string
}

const SkeletonCard: React.FC = () => (
  <div className="glass rounded-2xl overflow-hidden">
    <div className="aspect-[2/3] skeleton" />
    <div className="p-3 space-y-2">
      <div className="h-4 skeleton rounded-lg w-3/4" />
      <div className="h-3 skeleton rounded-lg w-1/3" />
    </div>
  </div>
)

const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  loading = false,
  emptyMessage = 'No movies found.',
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-600 dark:text-gray-500">
        <svg className="w-14 h-14 mb-4 opacity-40 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        <p className="text-lg font-medium">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} index={index} />
      ))}
    </div>
  )
}

export default MovieGrid
