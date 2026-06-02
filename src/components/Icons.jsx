import React from 'react'

// Basic wrapper SVG attributes helper
const baseSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconSleep({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
    </svg>
  )
}

export function IconWake({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

export function IconCommute({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2 11.3 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="15" cy="17" r="2" />
      <path d="M13 17h-4M5 17h1" />
    </svg>
  )
}

export function IconWork({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

export function IconFamily({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function IconRemote({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
      <line x1="2" x2="22" y1="20" y2="20" />
      <line x1="12" x2="12" y1="16" y2="20" />
    </svg>
  )
}

export function IconRelax({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="3" ry="3" />
    </svg>
  )
}

export function IconWinddown({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

export function IconStreak({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

export function IconTarget({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function IconBarChart({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  )
}

export function IconSparkle({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}

export function IconUser({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function IconReload({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M16 3h5v5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 21H3v-5" />
    </svg>
  )
}

export function IconBackup({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  )
}

export function IconRestore({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}

export function IconLogout({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

export function IconWarning({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  )
}

export function IconCheck({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export function IconLightning({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function IconMail({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function IconLock({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function IconChevronLeft({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function IconChevronRight({ className }) {
  return (
    <svg {...baseSvgProps} className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export const ICON_MAP = {
  sleep: IconSleep,
  wake: IconWake,
  commute: IconCommute,
  work: IconWork,
  family: IconFamily,
  remote: IconRemote,
  relax: IconRelax,
  winddown: IconWinddown,
}

