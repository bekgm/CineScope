import React, { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMovieDetail, getSimilarMovies, getRecommendations, getMovieVideos, getMovieCredits } from '../api/movieApi'
import type { MovieDetail, MovieSummary, VideoItem, CastMember, CrewMember, ListType } from '../types'
import {
  getPosterUrl,
  getBackdropUrl,
  formatRating,
  formatRuntime,
  formatDate,
  formatPopularity,
  formatCurrency,
  formatYear,
} from '../utils/imageUtils'
import { useWatchlist } from '../context/WatchlistContext'
import { useLanguage } from '../context/LanguageContext'
import MovieGrid from '../components/movies/MovieGrid'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'

const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185'

const LIST_ICONS: Record<ListType, string> = {
  watchlist:   'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z',
  watched:     'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  favourites:  'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
}

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const movieId = Number(id)
  const { isInList, addToList, removeFromList } = useWatchlist()
  const { t } = useLanguage()

  const LIST_CONFIG = [
    { type: 'watchlist'  as ListType, label: t('list_watchlist'),  icon: LIST_ICONS.watchlist },
    { type: 'watched'    as ListType, label: t('list_watched'),    icon: LIST_ICONS.watched },
    { type: 'favourites' as ListType, label: t('list_favourites'), icon: LIST_ICONS.favourites },
  ]

  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [similar, setSimilar] = useState<MovieSummary[]>([])
  const [recommendations, setRecommendations] = useState<MovieSummary[]>([])
  const [extrasLoading, setExtrasLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'similar' | 'recommendations'>('recommendations')

  const [videos, setVideos] = useState<VideoItem[]>([])
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null)

  const [cast, setCast] = useState<CastMember[]>([])
  const [crew, setCrew] = useState<CrewMember[]>([])

  const [listLoading, setListLoading] = useState<ListType | null>(null)

  const fetchMovie = useCallback(async () => {
    if (!movieId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getMovieDetail(movieId)
      setMovie(data)
      document.title = `${data.title} – CineScope`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movie')
    } finally {
      setLoading(false)
    }
  }, [movieId])

  useEffect(() => {
    fetchMovie()
    window.scrollTo({ top: 0 })
    return () => { document.title = 'CineScope' }
  }, [fetchMovie])

  useEffect(() => {
    if (!movieId) return
    setExtrasLoading(true)
    Promise.all([
      getSimilarMovies(movieId),
      getRecommendations(movieId),
      getMovieVideos(movieId),
      getMovieCredits(movieId),
    ])
      .then(([sim, rec, vids, credits]) => {
        setSimilar(sim.results.slice(0, 12))
        setRecommendations(rec.results.slice(0, 12))
        const trailers = vids.results.filter((v) => v.type === 'Trailer')
        const allVideos = [
          ...trailers,
          ...vids.results.filter((v) => v.type !== 'Trailer'),
        ]
        setVideos(allVideos)
        if (allVideos.length > 0) setActiveVideoKey(allVideos[0].key)
        setCast(credits.cast)
        setCrew(credits.crew)
      })
      .catch(() => {})
      .finally(() => setExtrasLoading(false))
  }, [movieId])

  const handleListToggle = async (listType: ListType) => {
    if (!movie || listLoading) return
    setListLoading(listType)
    const movieAsSummary: MovieSummary = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      overview: movie.overview,
      popularity: movie.popularity,
      genre_ids: movie.genres?.map((g) => g.id) ?? [],
    }
    try {
      if (isInList(movie.id, listType)) {
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
            list_type: listType,
          },
          listType,
        )
      }
    } finally {
      setListLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMessage message={error || 'Movie not found'} onRetry={fetchMovie} />
      </div>
    )
  }

  const rating = movie.vote_average ?? 0
  const ratingColor =
    rating >= 7 ? 'text-green-500' : rating >= 5 ? 'text-yellow-500' : 'text-red-500'

  const director = crew.find((c) => c.job === 'Director')
  const writers = crew.filter((c) => c.job === 'Screenplay' || c.job === 'Writer')

  const activeMovies = activeTab === 'similar' ? similar : recommendations

  return (
    <div>
      {/* Backdrop Hero */}
      <div className="relative h-72 sm:h-96 lg:h-[28rem] overflow-hidden bg-gray-900">
        {movie.backdrop_path && (
          <img
            src={getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            className="w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 sm:-mt-64 lg:-mt-72 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 w-48 sm:w-56 lg:w-64 mx-auto md:mx-0">
            <img
              src={getPosterUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="w-full rounded-xl shadow-2xl"
              onError={(e) => { ;(e.target as HTMLImageElement).src = '/placeholder-poster.svg' }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-gray-500 dark:text-gray-400 italic mb-3">"{movie.tagline}"</p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-primary-600/20 text-primary-300 border border-primary-600/30"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 mb-5 text-sm">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className={`font-bold text-base ${ratingColor}`}>
                  {formatRating(movie.vote_average)}
                </span>
                {movie.vote_count && (
            <span className="text-gray-500 dark:text-gray-400">
                ({movie.vote_count.toLocaleString()} {t('votes')})
              </span>
                )}
              </div>
              <span className="text-gray-600 dark:text-gray-300">{formatDate(movie.release_date)}</span>
              <span className="text-gray-600 dark:text-gray-300">{formatRuntime(movie.runtime)}</span>
              <span className="text-gray-600 dark:text-gray-300">{formatPopularity(movie.popularity)} {t('popularityStat')}</span>
            </div>

            {/* Multi-list buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {LIST_CONFIG.map(({ type, label, icon }) => {
                const active = isInList(movie.id, type)
                const busy = listLoading === type
                return (
                  <button
                    key={type}
                    onClick={() => handleListToggle(type)}
                    disabled={!!listLoading}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-primary-600 text-white hover:bg-red-600'
                        : 'bg-black/10 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-primary-600/20 hover:text-primary-600 dark:hover:text-primary-300'
                    } disabled:opacity-50`}
                  >
                    {busy ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                    )}
                {active ? t('removeFrom', { label }) : t('addTo', { label })}
                  </button>
                )
              })}
            </div>

            {/* Director / Writers */}
            {(director || writers.length > 0) && (
              <div className="flex flex-wrap gap-4 mb-5 text-sm">
                {director && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t('directedBy', { name: '' })}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{director.name}</span>
                  </div>
                )}
                {writers.length > 0 && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t('writtenBy', { names: '' })}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {writers.map((w) => w.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('overview')}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-black/5 dark:bg-white/5 rounded-xl p-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t('statusLabel')}</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium">{movie.status ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t('releaseYear')}</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium">{formatYear(movie.release_date)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t('runtime')}</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium">{formatRuntime(movie.runtime)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t('budget')}</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium">{formatCurrency(movie.budget)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t('revenue')}</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium">{formatCurrency(movie.revenue)}</p>
              </div>
              {movie.homepage && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-0.5">{t('homepageLabel')}</p>
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 hover:underline truncate block"
                  >
                    {t('visitSite')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trailers Section */}
        {videos.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('trailersAndVideos')}</h2>
            {/* Main player */}
            {activeVideoKey && (
              <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden bg-black mb-4 shadow-2xl">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideoKey}?rel=0`}
                  title="Movie trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {/* Thumbnail row */}
            {videos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {videos.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setActiveVideoKey(v.key)}
                    className={`shrink-0 relative rounded-lg overflow-hidden w-40 h-24 group transition-all ${
                      activeVideoKey === v.key ? 'ring-2 ring-primary-500' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`}
                      alt={v.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                      <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="absolute bottom-0 left-0 right-0 px-2 py-1 text-xs text-white bg-black/60 truncate">
                      {v.name}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Cast & Crew Section */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cast')}</h2>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">
              {cast.map((member) => (
                <div key={`${member.id}-${member.character}`} className="shrink-0 w-28 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                    {member.profile_path ? (
                      <img
                        src={`${PROFILE_BASE}${member.profile_path}`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl text-gray-400">${member.name[0]}</div>`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                        {member.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2">
                    {member.name}
                  </p>
                  {member.character && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {member.character}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar / Recommendations */}
        <section className="mt-14">
          <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
            {(['recommendations', 'similar'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 -mb-3 text-base font-semibold capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'recommendations' ? 'Recommendations' : 'Similar Movies'}
              </button>
            ))}
          </div>
          <MovieGrid
            movies={activeMovies}
            loading={extrasLoading}
            emptyMessage={t('noMoviesFound')}
          />
        </section>
      </main>
    </div>
  )
}

export default MovieDetailPage
