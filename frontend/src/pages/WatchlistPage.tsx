import React from 'react'
import { Link } from 'react-router-dom'
import { useWatchlist } from '../context/WatchlistContext'
import { useLanguage } from '../context/LanguageContext'
import type { ListType, WatchlistItem } from '../types'
import { getPosterUrl, formatRating, formatYear } from '../utils/imageUtils'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const TABS: { type: ListType; label: string }[] = [
  { type: 'watchlist', label: 'Want to Watch' },
  { type: 'watched', label: 'Watched' },
  { type: 'favourites', label: 'Favourites' },
]

const WatchlistPage: React.FC = () => {
  const { getListItems, loading, removeFromList } = useWatchlist()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = React.useState<ListType>('watchlist')
  const [removingId, setRemovingId] = React.useState<number | null>(null)

  const TABS: { type: ListType; label: string }[] = [
    { type: 'watchlist', label: t('tab_watchlist') },
    { type: 'watched',   label: t('tab_watched') },
    { type: 'favourites', label: t('tab_favourites') },
  ]

  const items: WatchlistItem[] = getListItems(activeTab)

  const handleRemove = async (movieId: number) => {    setRemovingId(movieId)
    try {
      await removeFromList(movieId, activeTab)
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('myLists')}</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
        {TABS.map(({ type, label }) => {
          const count = getListItems(type).length
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === type
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === type
                    ? 'bg-primary-600/20 text-primary-600 dark:text-primary-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('listEmpty', { label: TABS.find((tab) => tab.type === activeTab)?.label ?? '' })}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('listEmptyHint')}
          </p>
          <Link to="/" className="btn-primary">
            {t('browseMovies')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-row sm:flex-col">
              <Link to={`/movie/${item.movie_id}`} className="shrink-0 sm:shrink sm:w-full w-24">
                <img
                  src={getPosterUrl(item.poster_path)}
                  alt={item.title}
                  className="w-24 sm:w-full h-36 sm:h-56 md:h-64 object-cover"
                  onError={(e) => { ;(e.target as HTMLImageElement).src = '/placeholder-poster.svg' }}
                />
              </Link>
              <div className="flex flex-col flex-1 p-4 justify-between">
                <div>
                  <Link to={`/movie/${item.movie_id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatYear(item.release_date)}</span>
                    {item.vote_average != null && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {formatRating(item.vote_average)}
                      </span>
                    )}
                  </div>
                  {item.overview && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 hidden sm:block">
                      {item.overview}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(item.movie_id)}
                  disabled={removingId === item.movie_id}
                  className="mt-3 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {removingId === item.movie_id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default WatchlistPage

