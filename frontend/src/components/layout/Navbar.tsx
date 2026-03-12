import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useWatchlist } from '../../context/WatchlistContext'
import { useLanguage } from '../../context/LanguageContext'
import { searchMovies } from '../../api/movieApi'
import { getPosterUrl, formatYear, formatRating } from '../../utils/imageUtils'
import type { MovieSummary } from '../../types'
import CineScopeLogo from '../ui/CineScopeLogo'

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLanguage, t } = useLanguage()
  const { items } = useWatchlist()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<MovieSummary[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([])
      setSuggestionsOpen(false)
      return
    }
    setSuggestionsLoading(true)
    try {
      const data = await searchMovies(q, 1)
      setSuggestions(data.results.slice(0, 6))
      setSuggestionsOpen(true)
      setHighlightedIndex(-1)
    } catch {
      setSuggestions([])
    } finally {
      setSuggestionsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 280)
  }

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSuggestionsOpen(false)
      setSearchQuery('')
    }
  }

  const handleSuggestionClick = (movie: MovieSummary) => {
    navigate(`/movie/${movie.id}`)
    setSuggestionsOpen(false)
    setSearchQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionsOpen || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="CineScope home">
            <CineScopeLogo size={30} className="transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden sm:block font-bold text-lg text-gradient">CineScope</span>
          </Link>

          {/* Desktop Search + Autocomplete */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6 relative" ref={dropdownRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
                  placeholder={t('searchPlaceholder')}
                  className="input-field pl-10 pr-10"
                  autoComplete="off"
                  aria-label={t('searchLabel')}
                />
                {suggestionsLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            {suggestionsOpen && suggestions.length > 0 && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 glass-strong rounded-2xl overflow-hidden shadow-2xl animate-slide-down z-50">
                {suggestions.map((movie, idx) => {
                  const rating = movie.vote_average ?? 0
                  const ratingClass = rating >= 7 ? 'rating-high' : rating >= 5 ? 'rating-mid' : 'rating-low'
                  return (
                    <button
                      key={movie.id}
                      onMouseDown={() => handleSuggestionClick(movie)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 ${
                        idx === highlightedIndex ? 'bg-white/10' : 'hover:bg-white/6'
                      }`}
                    >
                      <img
                        src={getPosterUrl(movie.poster_path, 'w185')}
                        alt={movie.title}
                        className="w-8 h-11 object-cover rounded-lg shrink-0"
                        onError={(e) => { ;(e.target as HTMLImageElement).src = '/placeholder-poster.svg' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{movie.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{formatYear(movie.release_date)}</p>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${ratingClass}`}>
                        {formatRating(movie.vote_average)}
                      </span>
                    </button>
                  )
                })}
                <button
                  onMouseDown={handleSearch}
                  className="w-full px-4 py-2.5 text-sm text-primary-400 hover:text-primary-300 hover:bg-white/5 transition-colors border-t border-white/5 text-left font-medium"
                >
                  {t('seeAllResults', { q: searchQuery })}
                </button>
              </div>
            )}
          </div>

          {/* Right Nav */}
          <div className="flex items-center gap-2">
            <Link
              to="/watchlist"
              className="relative flex items-center gap-1.5 btn-secondary text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="hidden sm:inline">{t('navWatchlist')}</span>
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1 shadow-lg shadow-primary-500/40">
                  {items.length > 99 ? '99+' : items.length}
                </span>
              )}
            </Link>

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl glass text-xs font-bold tracking-widest text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 min-w-[40px]"
              aria-label={t('toggleLanguage')}
              title={t('toggleLanguage')}
            >
              {lang === 'en' ? 'RU' : 'EN'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl glass text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label={t('toggleTheme')}
              title={t('toggleTheme')}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              title={menuOpen ? t('closeMenu') : t('openMenu')}
              className="md:hidden p-2 rounded-xl glass text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {menuOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder={t('searchMobile')}
                  className="input-field pl-10"
                  aria-label={t('searchLabel')}
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
