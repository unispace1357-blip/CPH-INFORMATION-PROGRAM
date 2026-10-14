import type { SVGProps } from 'react'

const iconPaths = {
  search: 'm21 21-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  hotel: 'M3 21V5h18v16 M3 21h18 M7 9h2 M15 9h2 M7 13h2 M15 13h2 M10 21v-4h4v4',
  dining: 'M5 3v7 M9 3v7 M5 7h4 M7 10v11 M17 3c-3 3-3 8 0 8h2 M19 3v18',
  cafe: 'M4 6h12v8a6 6 0 0 1-12 0V6 M16 7h2a3 3 0 0 1 0 6h-2 M3 21h15 M7 2v1 M12 2v1',
  convenience: 'M3 10h18 M4 10v11h16V10 M3 10l2-7h14l2 7 M8 21v-7h5v7 M16 14h1',
  pharmacy: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3',
  shopping: 'M4 8h16l1 13H3L4 8 M8 8V6a4 4 0 0 1 8 0v2',
  attraction: 'm3 8 9-5 9 5 M3 10h18 M5 10v9 M10 10v9 M14 10v9 M19 10v9 M3 21h18',
  transportation: 'M6 17h12 M6 17l-2 4 M18 17l2 4 M5 4h14v13H5V4 M5 11h14 M9 14h.01 M15 14h.01 M9 2h6',
  sauna_spa: 'M4 17q2-2 4 0t4 0t4 0t4 0 M4 21q2-2 4 0t4 0t4 0t4 0 M7 3q-3 3 0 6t0 5 M12 3q-3 3 0 6t0 5 M17 3q-3 3 0 6t0 5',
  atm: 'M3 3h18v18H3V3 M6 7h12v4H6V7 M7 15h.01 M11 15h.01 M7 18h.01 M11 18h.01 M16 15h2',
  grid: 'M3 3h7v7H3V3 M14 3h7v7h-7V3 M3 14h7v7H3v-7 M14 14h7v7h-7v-7',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',
  arrow: 'M4 12h16 m-6-6 6 6-6 6',
  copy: 'M8 8h13v13H8V8 M16 8V3H3v13h5',
  info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 11v6 M12 7h.01',
  parking: 'M4 3h16v18H4V3 M9 17V7h4a3 3 0 0 1 0 6H9',
  bed: 'M3 20V6 M3 14h18v6 M3 17h18 M7 14V9h11l3 5 M7 11h4',
  breakfast: 'M7 17h10 M8 21h8 M12 3v2 M4 7l2 2 M20 7l-2 2 M3 14h18 M6 14a6 6 0 0 1 12 0',
  checkIn: 'M14 3h7v18h-7 M3 12h12 m-4-4 4 4-4 4',
  checkOut: 'M10 3H3v18h7 M10 12h11 m-4-4 4 4-4 4',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3q8 9 0 18 M12 3q-8 9 0 18',
  empty: 'M4 5h16v16H4V5 M9 5V3h6v2 M8 10h8 M8 14h5',
  loading: 'M21 12a9 9 0 1 1-9-9',
} as const

export type IconName = keyof typeof iconPaths

export function Icon({ name, size = 24, className = '', ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`icon ${className}`} aria-hidden="true" focusable="false" {...props}>
      <path d={iconPaths[name]} />
    </svg>
  )
}
