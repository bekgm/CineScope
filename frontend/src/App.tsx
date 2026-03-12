import React, { Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import SplashScreen from './components/ui/SplashScreen'

const HomePage = React.lazy(() => import('./pages/HomePage'))
const SearchPage = React.lazy(() => import('./pages/SearchPage'))
const MovieDetailPage = React.lazy(() => import('./pages/MovieDetailPage'))
const WatchlistPage = React.lazy(() => import('./pages/WatchlistPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

const PageLoader: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <LoadingSpinner size="lg" />
  </div>
)

const App: React.FC = () => {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('cs_seen') === '1'
  )

  const handleSplashDone = () => {
    sessionStorage.setItem('cs_seen', '1')
    setSplashDone(true)
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <WatchlistProvider>
          {!splashDone && <SplashScreen onDone={handleSplashDone} />}
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/movie/:id" element={<MovieDetailPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </WatchlistProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App