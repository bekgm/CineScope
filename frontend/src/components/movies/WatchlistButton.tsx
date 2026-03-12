import React from 'react'
import type { MovieSummary, ListType } from '../../types'
import { useWatchlist } from '../../context/WatchlistContext'
import { useLanguage } from '../../context/LanguageContext'

interface WatchlistButtonProps {
  movie: MovieSummary
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  listType?: ListType
}

const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  movie,
  size = 'md',
  showLabel = false,
  listType = 'watchlist',
}) => {
  const { isInList, addToList, removeFromList } = useWatchlist()
  const { t } = useLanguage()
  const inList = isInList(movie.id, listType)
  const label = t(`list_${listType}` as Parameters<typeof t>[0])
  const [loading, setLoading] = React.useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      if (inList) {
        await removeFromList(movie.id, listType)
      } else {
        await addToList(
          {
            movie_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            overview: movie.overview,
          },
          listType,
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  const btnSize =
    size === 'sm'
      ? 'p-1.5'
      : size === 'lg'
      ? 'p-3'
      : showLabel
      ? 'px-4 py-2 gap-2'
      : 'p-2'

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={inList ? t('removeFrom', { label }) : t('addTo', { label })}
      className={`${btnSize} rounded-full flex items-center justify-center transition-all duration-200
        ${inList
          ? 'bg-primary-600 text-white hover:bg-red-600'
          : 'bg-black/60 backdrop-blur-sm text-white hover:bg-primary-600'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {loading ? (
        <svg className={`${iconSize} animate-spin`} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className={iconSize} fill={inList ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {inList ? t('removeFrom', { label }) : t('addTo', { label })}
        </span>
      )}
    </button>
  )
}

export default WatchlistButton
