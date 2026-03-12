import React, { useCallback, useEffect, useState } from 'react'
import { getTrendingMovies, getGenres, discoverMovies } from '../api/movieApi'
import type { MovieSummary, Genre } from '../types'
import MovieGrid from '../components/movies/MovieGrid'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useLanguage } from '../context/LanguageContext'

const HomePage: React.FC = () => {
  const { t } = useLanguage()
  const [trending, setTrending] = useState<MovieSummary[]>([])
  const [trendingPage, setTrendingPage] = useState(1)
  const [trendingTotalPages, setTrendingTotalPages] = useState(1)
  const [trendingWindow, setTrendingWindow] = useState<'day' | 'week'>('week')
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [trendingLoadingMore, setTrendingLoadingMore] = useState(false)
  const [trendingError, setTrendingError] = useState<string | null>(null)

  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [genreMovies, setGenreMovies] = useState<MovieSummary[]>([])
  const [genrePage, setGenrePage] = useState(1)
  const [genreTotalPages, setGenreTotalPages] = useState(1)
  const [genreLoading, setGenreLoading] = useState(false)
  const [genreLoadingMore, setGenreLoadingMore] = useState(false)
  const [genreError, setGenreError] = useState<string | null>(null)
  const [genreSortBy, setGenreSortBy] = useState('popularity.desc')

  // ── Trending: initial fetch ─────────────────────────────────────────────────
  const fetchTrending = useCallback(async () => {
    setTrendingLoading(true)
    setTrendingError(null)
    try {
      const data = await getTrendingMovies(trendingWindow, 1)
      setTrending(data.results)
      setTrendingPage(1)
      setTrendingTotalPages(Math.min(data.total_pages, 20))
    } catch (err) {
      setTrendingError(err instanceof Error ? err.message : 'Failed to load trending movies')
    } finally {
      setTrendingLoading(false)
    }
  }, [trendingWindow])

  useEffect(() => {
    fetchTrending()
  }, [fetchTrending])

  // ── Trending: load more ─────────────────────────────────────────────────────
  const loadMoreTrending = useCallback(async () => {
    if (trendingLoadingMore || trendingPage >= trendingTotalPages) return
    const nextPage = trendingPage + 1
    setTrendingLoadingMore(true)
    try {
      const data = await getTrendingMovies(trendingWindow, nextPage)
      setTrending((prev) => [...prev, ...data.results])
      setTrendingPage(nextPage)
    } catch {
      // fail silently for load-more
    } finally {
      setTrendingLoadingMore(false)
    }
  }, [trendingLoadingMore, trendingPage, trendingTotalPages, trendingWindow])

  const trendingSentinel = useInfiniteScroll(
    loadMoreTrending,
    !trendingLoading && trendingPage < trendingTotalPages,
  )

  // ── Genres ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    getGenres().then(setGenres).catch(() => {})
  }, [])

  // ── Genre movies: initial fetch ─────────────────────────────────────────────
  const fetchGenreMovies = useCallback(async () => {
    if (!selectedGenre) return
    setGenreLoading(true)
    setGenreError(null)
    try {
      const data = await discoverMovies(selectedGenre, 1, genreSortBy)
      setGenreMovies(data.results)
      setGenrePage(1)
      setGenreTotalPages(Math.min(data.total_pages, 20))
    } catch (err) {
      setGenreError(err instanceof Error ? err.message : 'Failed to load movies')
    } finally {
      setGenreLoading(false)
    }
  }, [selectedGenre, genreSortBy])

  useEffect(() => {
    fetchGenreMovies()
  }, [fetchGenreMovies])

  // ── Genre movies: load more ─────────────────────────────────────────────────
  const loadMoreGenre = useCallback(async () => {
    if (!selectedGenre || genreLoadingMore || genrePage >= genreTotalPages) return
    const nextPage = genrePage + 1
    setGenreLoadingMore(true)
    try {
      const data = await discoverMovies(selectedGenre, nextPage, genreSortBy)
      setGenreMovies((prev) => [...prev, ...data.results])
      setGenrePage(nextPage)
    } catch {
      // fail silently
    } finally {
      setGenreLoadingMore(false)
    }
  }, [selectedGenre, genreLoadingMore, genrePage, genreTotalPages, genreSortBy])

  const genreSentinel = useInfiniteScroll(
    loadMoreGenre,
    !!selectedGenre && !genreLoading && genrePage < genreTotalPages,
  )

  const handleGenreSelect = (genreId: number) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null)
      setGenreMovies([])
    } else {
      setSelectedGenre(genreId)
    }
  }

  const sortOptions = [
    { value: 'popularity.desc', label: t('mostPopular') },
    { value: 'vote_average.desc', label: t('topRated') },
    { value: 'release_date.desc', label: t('newest') },
    { value: 'revenue.desc', label: t('highestRevenue') },
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cinematic Hero */}
      <section className="relative text-center py-16 mb-12 rounded-3xl overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-600/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl animate-blob blob-delay-2" />
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl animate-blob blob-delay-4" />
        {/* Glass overlay */}
        <div className="relative glass rounded-3xl py-14 px-6">
          <h1 className="text-5xl sm:text-6xl font-black mb-4 text-gradient animate-fade-up">
            CineScope
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto animate-fade-up hero-text-delay">
            {t('heroTagline')}
          </p>
        </div>
      </section>

      {/* Trending Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('trending')}</h2>
          <div className="flex gap-2">
            {(['day', 'week'] as const).map((w) => (
              <button
                key={w}
                onClick={() => {
                  setTrendingWindow(w)
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  trendingWindow === w
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {w === 'day' ? t('today') : t('thisWeek')}
              </button>
            ))}
          </div>
        </div>

        {trendingError ? (
          <ErrorMessage message={trendingError} onRetry={fetchTrending} />
        ) : (
          <>
            <MovieGrid movies={trending} loading={trendingLoading} />
            {/* Infinite scroll sentinel */}
            <div ref={trendingSentinel} className="h-4" />
            {trendingLoadingMore && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </section>

      {/* Genre Filter */}
      {genres.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('browseByGenre')}</h2>
            {selectedGenre && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">{t('sortBy')}</label>
                <select
                  value={genreSortBy}
                  onChange={(e) => { setGenreSortBy(e.target.value) }}
                  aria-label="Sort genre results by"
                  title="Sort by"
                  className="input-field w-auto text-sm py-1.5"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreSelect(genre.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedGenre === genre.id
                    ? 'btn-primary scale-105'
                    : 'btn-secondary'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>

          {selectedGenre && (
            <>
              {genreError ? (
                <ErrorMessage message={genreError} onRetry={fetchGenreMovies} />
              ) : (
                <>
                  <MovieGrid movies={genreMovies} loading={genreLoading} />
                  {/* Infinite scroll sentinel */}
                  <div ref={genreSentinel} className="h-4" />
                  {genreLoadingMore && (
                    <div className="flex justify-center py-6">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      )}
    </main>
  )
}

export default HomePage