import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const NotFoundPage: React.FC = () => {
  const { t } = useLanguage()
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <svg className="w-24 h-24 mb-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">404</h1>
      <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-6">{t('pageNotFound')}</h2>
      <Link to="/" className="btn-primary">
        {t('backToHome')}
      </Link>
    </main>
  )
}

export default NotFoundPage
