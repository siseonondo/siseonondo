import AuthMenu from './AuthMenu.jsx'

const TITLES = {
  today: '오늘',
  emotion: '마음 기록',
  calendar: '캘린더',
  tasks: '할 일',
  records: '나의 흐름',
  quotes: '문장 보관함',
  pausechoose: '멈춤과 선택',
}

const TODAY_LABEL = '2026년 8월 25일 화요일'

export default function Header({ activeTab }) {
  return (
    <header className="workspace-header">
      <div className="workspace-header-title">
        <span className="workspace-header-date">{TODAY_LABEL}</span>
        <span className="workspace-header-page">{TITLES[activeTab]}</span>
      </div>
      <div className="workspace-header-actions">
        <AuthMenu />
      </div>
    </header>
  )
}
