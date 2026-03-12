import React, { createContext, useCallback, useContext, useState } from 'react'

export type Lang = 'en' | 'ru'

// ── Canonical English strings ────────────────────────────────────────────────
const en = {
  // Navbar
  searchPlaceholder: 'Search movies, genres…',
  searchMobile: 'Search movies…',
  searchLabel: 'Search movies',
  seeAllResults: 'See all results for "{q}" \u2192',
  navWatchlist: 'Watchlist',
  toggleTheme: 'Toggle theme',
  toggleLanguage: 'Toggle language',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',

  // HomePage
  heroTagline: 'Discover trending movies, explore by genre, and build your personal watchlist.',
  trending: 'Trending',
  today: 'Today',
  thisWeek: 'This Week',
  browseByGenre: 'Browse by Genre',
  sortBy: 'Sort by:',
  mostPopular: 'Most Popular',
  topRated: 'Top Rated',
  newest: 'Newest',
  highestRevenue: 'Highest Revenue',

  // SearchPage
  searchPrompt: 'Search for movies using the search bar above',
  searchResultsFor: 'Search results for "{q}"',
  resultsFound: '{n} results found',
  genreLabel: 'Genre:',
  allGenres: 'All Genres',
  sortDefault: 'Default',
  sortRating: 'Rating',
  sortPopularity: 'Popularity',
  clearFilters: 'Clear filters',

  // MovieDetailPage
  votes: 'votes',
  popularityStat: 'popularity',
  overview: 'Overview',
  statusLabel: 'Status',
  releaseYear: 'Release Year',
  runtime: 'Runtime',
  budget: 'Budget',
  revenue: 'Revenue',
  homepageLabel: 'Homepage',
  visitSite: 'Visit site',
  trailersAndVideos: 'Trailers & Videos',
  cast: 'Cast',
  recommendations: 'Recommendations',
  similarMovies: 'Similar Movies',
  noMoviesFound: 'No movies found.',
  directedBy: 'Directed by {name}',
  writtenBy: 'Written by {names}',
  removeFrom: 'Remove from {label}',
  addTo: '+ {label}',

  // List type labels (used in buttons / tabs)
  list_watchlist: 'Watchlist',
  list_watched: 'Watched',
  list_favourites: 'Favourites',

  // WatchlistPage
  myLists: 'My Lists',
  tab_watchlist: 'Want to Watch',
  tab_watched: 'Watched',
  tab_favourites: 'Favourites',
  listEmpty: '"{label}" is empty',
  listEmptyHint: 'Add movies from a detail page to fill this list.',
  browseMovies: 'Browse Movies',
  removeMovie: 'Remove',

  // NotFoundPage
  pageNotFound: 'Page not found',
  backToHome: 'Back to Home',

  // ErrorMessage
  somethingWentWrong: 'Something went wrong',
  tryAgain: 'Try again',

  // Footer
  footerPoweredBy: 'CineScope \u2014 powered by',
  footerTMDB: 'The Movie Database (TMDB)',
  footerDisclaimer:
    'This product uses the TMDB API but is not endorsed or certified by TMDB.',
}

export type TranslationKey = keyof typeof en

// ── Russian translations ─────────────────────────────────────────────────────
const ru: Record<TranslationKey, string> = {
  searchPlaceholder: 'Поиск фильмов, жанров…',
  searchMobile: 'Поиск фильмов…',
  searchLabel: 'Поиск фильмов',
  seeAllResults: 'Все результаты для «{q}» \u2192',
  navWatchlist: 'Списки',
  toggleTheme: 'Сменить тему',
  toggleLanguage: 'Сменить язык',
  openMenu: 'Открыть меню',
  closeMenu: 'Закрыть меню',

  heroTagline:
    'Открывайте трендовые фильмы, исследуйте по жанрам и создавайте личные списки.',
  trending: 'В тренде',
  today: 'Сегодня',
  thisWeek: 'На этой неделе',
  browseByGenre: 'По жанрам',
  sortBy: 'Сортировка:',
  mostPopular: 'Популярные',
  topRated: 'Высокий рейтинг',
  newest: 'Новинки',
  highestRevenue: 'Кассовые сборы',

  searchPrompt: 'Введите запрос в строку поиска выше',
  searchResultsFor: 'Результаты поиска: «{q}»',
  resultsFound: 'Найдено {n} результатов',
  genreLabel: 'Жанр:',
  allGenres: 'Все жанры',
  sortDefault: 'По умолчанию',
  sortRating: 'Рейтинг',
  sortPopularity: 'Популярность',
  clearFilters: 'Сбросить фильтры',

  votes: 'голосов',
  popularityStat: 'популярность',
  overview: 'Описание',
  statusLabel: 'Статус',
  releaseYear: 'Год выхода',
  runtime: 'Продолжительность',
  budget: 'Бюджет',
  revenue: 'Сборы',
  homepageLabel: 'Сайт',
  visitSite: 'Перейти',
  trailersAndVideos: 'Трейлеры и видео',
  cast: 'В ролях',
  recommendations: 'Рекомендации',
  similarMovies: 'Похожие фильмы',
  noMoviesFound: 'Фильмы не найдены.',
  directedBy: 'Режиссёр: {name}',
  writtenBy: 'Сценарий: {names}',
  removeFrom: 'Удалить из «{label}»',
  addTo: '+ {label}',

  list_watchlist: 'Смотреть позже',
  list_watched: 'Просмотрено',
  list_favourites: 'Избранное',

  myLists: 'Мои списки',
  tab_watchlist: 'Хочу посмотреть',
  tab_watched: 'Просмотрено',
  tab_favourites: 'Избранное',
  listEmpty: 'Список «{label}» пуст',
  listEmptyHint: 'Добавляйте фильмы со страниц фильмов.',
  browseMovies: 'К фильмам',
  removeMovie: 'Удалить',

  pageNotFound: 'Страница не найдена',
  backToHome: 'На главную',

  somethingWentWrong: 'Что-то пошло не так',
  tryAgain: 'Повторить',

  footerPoweredBy: 'CineScope \u2014 на основе',
  footerTMDB: 'The Movie Database (TMDB)',
  footerDisclaimer:
    'Этот продукт использует API TMDB и не одобрен организацией TMDB.',
}

const translations: Record<Lang, Record<TranslationKey, string>> = { en, ru }

// ── Context ──────────────────────────────────────────────────────────────────
interface LanguageContextValue {
  lang: Lang
  toggleLanguage: () => void
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang | null) ?? 'en'
  })

  const toggleLanguage = () => {
    setLang((prev) => {
      const next: Lang = prev === 'en' ? 'ru' : 'en'
      localStorage.setItem('lang', next)
      return next
    })
  }

  const t = useCallback(
    (key: TranslationKey, replacements?: Record<string, string | number>): string => {
      let str: string = translations[lang][key]
      if (replacements) {
        Object.entries(replacements).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, String(v))
        })
      }
      return str
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
