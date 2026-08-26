export const ROUTES = [
  { key: 'today', path: '/today', label: '오늘' },
  { key: 'emotion', path: '/emotion', label: '마음 기록' },
  { key: 'calendar', path: '/calendar', label: '캘린더' },
  { key: 'tasks', path: '/tasks', label: '할 일' },
  { key: 'records', path: '/flow', label: '나의 흐름' },
  { key: 'quotes', path: '/quotes', label: '문장 보관함' },
  { key: 'pausechoose', path: '/pause-and-choose', label: '멈춤과 선택' },
]

export const PATH_BY_KEY = Object.fromEntries(ROUTES.map((r) => [r.key, r.path]))
