import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/logo-mark.png'
import AuthMenu from './AuthMenu.jsx'
import { SITE_NAV, MY_RECORD_NAV } from '../data/siteNav.js'

export default function SiteHeader() {
  const [navOpen, setNavOpen] = useState(false)
  const [recordsOpen, setRecordsOpen] = useState(false)
  const location = useLocation()

  const isRecordsActive = MY_RECORD_NAV.items.some((item) => location.pathname.startsWith(item.path))

  return (
    <header className="landing-header">
      <Link to="/" className="landing-brand">
        <img src={logo} alt="생글로리" className="landing-logo" />
        <div className="landing-brand-text">
          <span className="landing-brand-title">시선온도</span>
          <span className="landing-brand-sub">시선의 길을 열다</span>
        </div>
      </Link>

      <nav className="landing-nav">
        {SITE_NAV.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className={`landing-nav-link${location.pathname === item.path ? ' active' : ''}`}
          >
            {item.label}
          </Link>
        ))}

        <div className="landing-nav-dropdown">
          <button
            type="button"
            className={`landing-nav-link landing-nav-dropdown-btn${isRecordsActive ? ' active' : ''}`}
            aria-expanded={recordsOpen}
            onClick={() => setRecordsOpen((v) => !v)}
            onBlur={() => setTimeout(() => setRecordsOpen(false), 150)}
          >
            {MY_RECORD_NAV.label}
            <span className="landing-nav-dropdown-caret">▾</span>
          </button>
          {recordsOpen && (
            <div className="landing-nav-dropdown-menu">
              {MY_RECORD_NAV.items.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className="landing-nav-dropdown-link"
                  onClick={() => setRecordsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="landing-header-actions">
        <AuthMenu />
        <Link to="/today" className="landing-start-btn">
          <span className="landing-start-btn-full">기록 시작하기</span>
          <span className="landing-start-btn-short">기록 시작</span>
        </Link>
        <button
          type="button"
          className="landing-nav-toggle"
          aria-label="메뉴 열기"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {navOpen && (
        <>
          <div className="landing-nav-overlay" onClick={() => setNavOpen(false)} />
          <nav className="landing-nav-mobile">
            {SITE_NAV.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className="landing-nav-mobile-link"
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="landing-nav-mobile-group-label">{MY_RECORD_NAV.label}</div>
            {MY_RECORD_NAV.items.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className="landing-nav-mobile-link landing-nav-mobile-sub"
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </header>
  )
}
