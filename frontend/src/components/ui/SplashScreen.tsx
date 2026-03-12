import React, { useEffect, useState, useCallback } from 'react'
import CineScopeLogo from './CineScopeLogo'

interface SplashScreenProps {
  onDone: () => void
}

const STRIP_CELLS = 20

const FilmStrip: React.FC<{ direction?: 'forward' | 'reverse' }> = ({ direction = 'forward' }) => (
  <div className={`splash-strip ${direction === 'reverse' ? 'splash-strip-reverse' : ''}`}>
    <div className="splash-strip-inner">
      {Array.from({ length: STRIP_CELLS * 2 }).map((_, i) => (
        <div key={i} className="splash-strip-cell">
          <div className="splash-sprocket" />
          <div className="splash-frame" />
          <div className="splash-sprocket" />
        </div>
      ))}
    </div>
  </div>
)

const TITLE = 'CineScope'

const SplashScreen: React.FC<SplashScreenProps> = ({ onDone }) => {
  const [exiting, setExiting] = useState(false)

  const start = useCallback(() => {
    const t1 = setTimeout(() => setExiting(true), 2600)
    const t2 = setTimeout(() => onDone(), 3100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  useEffect(() => start(), [start])

  return (
    <div
      className={`splash-root${exiting ? ' splash-exiting' : ''}`}
      role="status"
      aria-label="Loading CineScope"
    >
      {/* Film grain overlay */}
      <div className="splash-grain" aria-hidden="true" />

      {/* Projector beam from top */}
      <div className="splash-beam" aria-hidden="true" />

      {/* Top film strip */}
      <FilmStrip direction="forward" />

      {/* Center stage */}
      <div className="splash-stage">

        {/* Logo icon with glow ring */}
        <div className="splash-logo-wrap" aria-hidden="true">
          <div className="splash-logo-glow" />
          <CineScopeLogo size={96} />
        </div>

        {/* Title — letters drop in sequentially */}
        <h1 className="splash-title" aria-label="CineScope">
          {TITLE.split('').map((ch, i) => (
            <span
              key={i}
              className={`splash-letter splash-letter-${i}`}
            >
              {ch}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p className="splash-tagline">Your Cinema Universe</p>

        {/* Film-strip progress bar */}
        <div className="splash-progress-wrap" aria-hidden="true">
          <div className="splash-progress-track">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="splash-progress-cell" />
            ))}
            <div className="splash-progress-fill" />
          </div>
          <div className="splash-progress-dots">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`splash-dot splash-dot-${i}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom film strip */}
      <FilmStrip direction="reverse" />
    </div>
  )
}

export default SplashScreen
