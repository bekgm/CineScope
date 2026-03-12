import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

const Footer: React.FC = () => {
  const { t } = useLanguage()
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          {t('footerPoweredBy')}{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('footerTMDB')}
          </a>
        </p>
        <p className="mt-1 text-xs">
          {t('footerDisclaimer')}
        </p>
      </div>
    </footer>
  )
}

export default Footer
