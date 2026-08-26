import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AuthMenu from './AuthMenu.jsx'
import { ROUTES } from '../routes.js'
import { getTodaySeoulLabel, getNowSeoulTimeLabel } from '../utils/date.js'

export default function Header({ onMenuToggle }) {
  const location = useLocation()
  const [todayLabel, setTodayLabel] = useState(() => getTodaySeoulLabel())
  const [timeLabel, setTimeLabel] = useState(() => getNowSeoulTimeLabel())

  useEffect(() => {
    const id = setInterval(() => {
      setTodayLabel(getTodaySeoulLabel())
      setTimeLabel(getNowSeoulTimeLabel())
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const currentRoute = ROUTES.find((r) => r.path === location.pathname)

  return (
    <header className="workspace-header">
      <div className="workspace-header-left">
        <button
          type="button"
          className="menu-toggle"
          aria-label="메뉴 열기"
          onClick={onMenuToggle}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="workspace-header-title">
          <span className="workspace-header-date">
            {todayLabel} · {timeLabel}
          </span>
          <h1 className="workspace-header-page">{currentRoute?.label}</h1>
        </div>
      </div>
      <div className="workspace-header-actions">
        <AuthMenu />
      </div>
    </header>
  )
}
