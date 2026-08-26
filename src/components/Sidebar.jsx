import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo-mark.png'
import { conditionLabels } from '../data/mockData'
import { ROUTES } from '../routes.js'

export default function Sidebar({ condition, open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <Link to="/today" className="sidebar-brand" onClick={onClose}>
          <img src={logo} alt="생글로리" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <span className="sidebar-title">시선온도</span>
            <span className="sidebar-subtitle">시선의 길을 열다</span>
          </div>
        </Link>

        <nav className="sidebar-nav">
          {ROUTES.map((route) => (
            <NavLink
              key={route.key}
              to={route.path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-dot" />
              {route.label}
            </NavLink>
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
    </>
  )
}
