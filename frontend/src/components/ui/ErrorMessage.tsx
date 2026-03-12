import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col items-center py-16 text-center px-4">
      <svg className="w-14 h-14 mb-4 text-yellow-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {t('somethingWentWrong')}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          {t('tryAgain')}
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
