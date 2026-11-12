import { ROUTES } from '../routes.js'

export const SITE_NAV = [
  { key: 'home', label: '시선온도', path: '/' },
  { key: 'about', label: '신다미', path: '/about' },
  { key: 'books', label: '책', path: '/books' },
  { key: 'writings', label: '생각', path: '/writings' },
  { key: 'programs', label: '함께하는 일', path: '/programs' },
  // 앱 안의 화면이 아니라 /compass/ 에 따로 올린 정적 웹앱이라 일반 링크로 연다
  { key: 'compass', label: '나침반', path: '/compass/', external: true },
]

export const MY_RECORD_NAV = { key: 'records', label: '나의 기록', items: ROUTES }
