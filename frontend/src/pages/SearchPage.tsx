import React, { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchMovies, getGenres } from '../api/movieApi'
import type { MovieSummary, Genre } from '../types'
import MovieGrid from '../components/movies/MovieGrid'
import ErrorMessage from '../components/ui/ErrorMessage'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { useLanguage } from '../context/LanguageContext'

const SearchPage: React.FC = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<MovieSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'rating' | 'popularity' | undefined>(undefined)

  useEffect(() => {
    getGenres().then(setGenres).catch(() => {})
  }, [])

  // Reset when query or filters change
  useEffect(() => {
    setPage(1)
    setResults([])
  }, [query, selectedGenre, sortBy])

  const doSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await searchMovies(query, 1, selectedGenre, sortBy)
      setResults(data.results)
      setPage(1)
      setTotalPages(Math.min(data.total_pages, 500))
      setTotalResults(data.total_results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [query, selectedGenre, sortBy])

  useEffect(() => {
    doSearch()
  }, [doSearch])

  const loadMore = useCallback(async () => {
    if (!query.trim() || loadingMore || page >= totalPages) return
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const data = await searchMovies(query, nextPage, selectedGenre, sortBy)
      setResults((prev) => [...prev, ...data.results])
      setPage(nextPage)
    } catch {
      // fail silently
    } finally {
      setLoadingMore(false)
    }
  }, [query, loadingMore, page, totalPages, selectedGenre, sortBy])

  const sentinelRef = useInfiniteScroll(loadMore, !loading && page < totalPages)

  const handleFilter = (genreId: number | undefined) => {
    setSelectedGenre(genreId)
  }

  const handleSort = (value: 'rating' | 'popularity' | undefined) => {
    setSortBy(value)
  }

  if (!query) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <svg className="w-14 h-14 mb-4 mx-auto opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('searchPrompt')}
        </p>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('searchResultsFor', { q: query })}
        </h1>
        {!loading && totalResults > 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t('resultsFound', { n: totalResults.toLocaleString() })}
          </p>
        )}
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('genreLabel')}
          </label>
          <select
            value={selectedGenre ?? ''}
            onChange={(e) => handleFilter(e.target.value ? Number(e.target.value) : undefined)}
            aria-label={t('genreLabel')}
            title={t('genreLabel')}
            className="input-field w-auto text-sm py-1.5"
          >
            <option value="">{t('allGenres')}</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('sortBy')}
          </label>
          <select
            value={sortBy ?? ''}
            onChange={(e) => handleSort(e.target.value as 'rating' | 'popularity' | undefined || undefined)}
            aria-label={t('sortBy')}
            title={t('sortBy')}
            className="input-field w-auto text-sm py-1.5"
          >
            <option value="">{t('sortDefault')}</option>
            <option value="rating">{t('sortRating')}</option>
            <option value="popularity">{t('sortPopularity')}</option>
          </select>
        </div>

        {(selectedGenre || sortBy) && (
          <button
            onClick={() => { handleFilter(undefined); handleSort(undefined) }}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={doSearch} />
      ) : (
        <>
          <MovieGrid
            movies={results}
            loading={loading}
            emptyMessage={`No movies found for "${query}"`}
          />
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default SearchPage
