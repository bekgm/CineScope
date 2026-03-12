import React, { useId } from 'react'

interface CineScopeLogoProps {
  size?: number
  className?: string
}

const CineScopeLogo: React.FC<CineScopeLogoProps> = ({ size = 32, className = '' }) => {
  const raw = useId()
  const uid = raw.replace(/:/g, 'x')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`${uid}fc`}>
          <rect x="22" y="23" width="34" height="14" />
        </clipPath>
      </defs>

      {/* Background rounded square */}
      <rect width="100" height="100" rx="22" fill="#d63b2f" />

      {/* Magnifying glass handle */}
      <line x1="59" y1="57" x2="84" y2="82" stroke="#1c2b48" strokeWidth="13" strokeLinecap="round" />

      {/* Lens white fill */}
      <circle cx="39" cy="37" r="26" fill="white" />

      {/* Clapperboard top flap — white base with red diagonal stripes */}
      <rect x="22" y="23" width="34" height="14" rx="2" fill="white" />
      <g clipPath={`url(#${uid}fc)`}>
        <polygon points="-8,37 -1,37 13,23 6,23"   fill="#d63b2f" />
        <polygon points="5,37  12,37 26,23 19,23"  fill="#d63b2f" />
        <polygon points="18,37 25,37 39,23 32,23"  fill="#d63b2f" />
        <polygon points="31,37 38,37 52,23 45,23"  fill="#d63b2f" />
        <polygon points="44,37 51,37 65,23 58,23"  fill="#d63b2f" />
        <polygon points="57,37 64,37 78,23 71,23"  fill="#d63b2f" />
      </g>

      {/* Clapperboard body */}
      <rect x="22" y="35" width="34" height="22" rx="2" fill="#1c2b48" />
      {/* Screen area */}
      <rect x="24" y="37" width="30" height="18" rx="1.5" fill="#263358" />

      {/* Lens ring border — drawn last to cleanly frame everything */}
      <circle cx="39" cy="37" r="26" fill="none" stroke="#1c2b48" strokeWidth="7" />
    </svg>
  )
}

export default CineScopeLogo
