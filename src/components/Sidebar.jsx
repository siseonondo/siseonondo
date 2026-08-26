import logo from '../assets/logo.png'
import { conditionLabels } from '../data/mockData'

const NAV_ITEMS = [
  { key: 'today', label: '오늘' },
  { key: 'emotion', label: '마음 기록' },
  { key: 'calendar', label: '캘린더' },
  { key: 'tasks', label: '할 일' },
  { key: 'records', label: '나의 흐름' },
  { key: 'quotes', label: '문장 보관함' },
  { key: 'pausechoose', label: '멈춤과 선택' },
]

export default function Sidebar({ activeTab, onSelectTab, condition }) {
  return (
    <aside className="sidebar">
      <div
        className="sidebar-brand"
        onClick={() => onSelectTab('today')}
        style={{ cursor: 'pointer' }}
      >
        <img src={logo} alt="생글로리" className="sidebar-logo" />
        <div className="sidebar-brand-text">
          <span className="sidebar-title">시선온도</span>
          <span className="sidebar-subtitle">시선의 길을 열다</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`nav-item${activeTab === item.key ? ' active' : ''}`}
            onClick={() => onSelectTab(item.key)}
          >
            <span className="nav-dot" />
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-status">
        <span className="sidebar-status-label">오늘의 상태</span>
        <span className="sidebar-status-value">
          {conditionLabels[condition]} · {condition}
        </span>
        <div className="sidebar-status-bar">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n === condition ? 'active' : ''} />
          ))}
        </div>
      </div>

      <div className="sidebar-spacer" />

      <div className="nav-item nav-item-settings">
        <span className="nav-dot outline" />
        설정
      </div>
    </aside>
  )
}
