import React from 'react'
import { Link } from 'react-router-dom'
import type { MovieSummary } from '../../types'
import { getPosterUrl, formatRating, formatYear } from '../../utils/imageUtils'
import WatchlistButton from './WatchlistButton.tsx'

interface MovieCardProps {
  movie: MovieSummary
  index?: number
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, index = 0 }) => {
  const rating = movie.vote_average ?? 0
  const ratingClass = rating >= 7 ? 'rating-high' : rating >= 5 ? 'rating-mid' : 'rating-low'

  return (
    <div
      className={`glass-card group relative animate-fade-up anim-delay-${Math.min(index, 11)}`}
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-2xl bg-gray-800">
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/placeholder-poster.svg'
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Overview on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-white text-xs line-clamp-4 leading-relaxed">{movie.overview}</p>
          </div>
        </div>
      </Link>

      {/* Rating Badge */}
      <div className="absolute top-2 left-2 glow-badge flex items-center gap-1">
        <svg className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 shrink-0" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className={`text-xs font-bold ${ratingClass}`}>
          {formatRating(movie.vote_average)}
        </span>
      </div>

      {/* Watchlist Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <WatchlistButton movie={movie} size="sm" />
      </div>

      {/* Info */}
      <div className="p-3">
        <Link to={`/movie/${movie.id}`}>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
            {movie.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatYear(movie.release_date)}</p>
      </div>
    </div>
  )
}

export default MovieCard
