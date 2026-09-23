import { ROUTES } from '../routes.js'

export const SITE_NAV = [
  { key: 'home', label: '시선온도', path: '/' },
  { key: 'about', label: '신다미', path: '/about' },
  { key: 'books', label: '책', path: '/books' },
  { key: 'writings', label: '생각', path: '/writings' },
  { key: 'programs', label: '함께하는 일', path: '/programs' },
]

export const MY_RECORD_NAV = { key: 'records', label: '나의 기록', items: ROUTES }
