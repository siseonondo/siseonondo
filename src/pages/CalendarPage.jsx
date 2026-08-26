import { useState } from 'react'
import {
  weekSchedule,
  todaySchedule,
  monthEventDays,
  taskDoneDays,
  moodDays,
  dayRecord,
} from '../data/mockData'
import { getTodaySeoulDate } from '../utils/date.js'

const VIEWS = [
  { key: 'day', label: '일' },
  { key: 'week', label: '주' },
  { key: 'month', label: '월' },
]

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
const TODAY = getTodaySeoulDate()

function sameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

function getWeekStart(date) {
  const diff = (date.getDay() + 6) % 7
  return addDays(date, -diff)
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = startOffset - 1; i >= 0; i -= 1) {
    cells.push({ day: daysInPrevMonth - i, outside: true })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      outside: false,
      hasEvent: monthEventDays.has(day),
      taskDone: taskDoneDays.has(day),
      hasMood: moodDays.has(day),
      today: sameDate(new Date(year, month, day), TODAY),
    })
  }
  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, outside: true })
    nextDay += 1
  }
  return cells
}

function DayView() {
  return (
    <div className="section">
      <div className="section-header">
        <span className="section-title">일정 · {todaySchedule.length}</span>
      </div>
      <div className="schedule-list">
        {todaySchedule.map((s) => (
          <div className="schedule-row" key={s.id}>
            <span className={`schedule-time${s.done ? ' muted' : ''}`}>{s.time}</span>
            <span className={`schedule-title${s.done ? ' done' : ''}`}>{s.title}</span>
            {s.soon && <span className="badge-soon">곧 시작</span>}
            {s.place && <span className="schedule-place">{s.place}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function WeekView({ cursor }) {
  const weekStart = getWeekStart(cursor)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i)
    return {
      label: WEEKDAYS[i],
      date: d.getDate(),
      active: sameDate(d, TODAY),
      weekend: d.getDay() === 0 || d.getDay() === 6,
    }
  })

  return (
    <div className="week-table">
      <div className="week-header-row">
        <div />
        {days.map((d, i) => (
          <div className={`week-header-cell${d.active ? ' today' : ''}`} key={i}>
            <span className={`week-header-day${d.active ? ' today' : ''}`}>{d.label}</span>
            <span
              className={`week-header-date${d.active ? ' today' : ''}${d.weekend ? ' weekend' : ''}`}
            >
              {d.date}
            </span>
          </div>
        ))}
      </div>

      {weekSchedule.rows.map((row) => (
        <div className="week-row" key={row.time}>
          <div className="week-time-label">{row.time}</div>
          {row.cells.map((cell, i) => (
            <div className={`week-cell${days[i].active ? ' today-col' : ''}`} key={i}>
              {cell && <div className={`event-chip${cell.accent ? ' accent' : ''}`}>{cell.title}</div>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function MonthView({ cursor, onSelectDay }) {
  const monthGrid = buildMonthGrid(cursor.getFullYear(), cursor.getMonth())

  return (
    <div className="week-table">
      <div className="month-header-row">
        {WEEKDAYS.map((w) => (
          <span className="month-header-cell" key={w}>
            {w}
          </span>
        ))}
      </div>
      <div className="month-body-grid">
        {monthGrid.map((cell, i) =>
          cell.outside ? (
            <div key={i} className="month-cell outside">
              <span className="month-cell-day">{cell.day}</span>
            </div>
          ) : (
            <button
              key={i}
              type="button"
              className={`month-cell${cell.today ? ' today' : ''}`}
              onClick={() => onSelectDay(cell.day)}
            >
              <span className="month-cell-day">{cell.day}</span>
              <div className="month-cell-dots">
                {cell.hasEvent && <span className="mini-cal-dot" />}
                {cell.hasMood && <span className="mini-cal-dot mood" />}
                {cell.taskDone && <span className="mini-cal-dot done" />}
              </div>
            </button>
          )
        )}
      </div>
    </div>
  )
}

function DayDetailModal({ day, onClose }) {
  return (
    <div className="day-detail-overlay" onClick={onClose}>
      <div className="day-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="day-detail-head">
          <span className="title-serif">8월 {day}일</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="day-stat-row">
          {dayRecord.conditions.map((c) => (
            <div className="day-stat-card" key={c.time}>
              <span className="meta-mono">{c.time}</span>
              <span className="title-serif" style={{ fontSize: 15 }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>

        <div className="section">
          <span className="section-title">감정 기록</span>
          {dayRecord.emotions.map((e) => (
            <div className="emotion-record-card" key={e.id}>
              <span className={`chip ${e.color}`} style={{ alignSelf: 'flex-start' }}>
                {e.tag}
              </span>
              <div className="emotion-record-body">{e.situation}</div>
            </div>
          ))}
        </div>

        <div className="day-detail-two-col">
          <div className="day-detail-list">
            <span className="section-title">할 일</span>
            {dayRecord.tasks.map((t) => (
              <div className={`day-detail-row${t.done ? ' done' : ''}`} key={t.id}>
                <span>{t.done ? '✓' : '○'}</span>
                <span style={{ flex: 1 }}>{t.title}</span>
              </div>
            ))}
          </div>
          <div className="day-detail-list">
            <span className="section-title">일정</span>
            {dayRecord.schedule.map((s) => (
              <div className="day-detail-row" key={s.id}>
                <span className="time">{s.time}</span>
                <span style={{ flex: 1 }}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTitle(view, cursor) {
  if (view === 'month') {
    return `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`
  }
  if (view === 'day') {
    return `${cursor.getMonth() + 1}월 ${cursor.getDate()}일 ${WEEKDAY_NAMES[cursor.getDay()]}요일`
  }
  const start = getWeekStart(cursor)
  const end = addDays(start, 6)
  if (start.getMonth() === end.getMonth()) {
    return `${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getDate()}일`
  }
  return `${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`
}

const STEP = { day: 1, week: 7, month: 'month' }

export default function CalendarPage() {
  const [view, setView] = useState('week')
  const [cursor, setCursor] = useState(TODAY)
  const [selectedDay, setSelectedDay] = useState(null)

  const step = (dir) => {
    setCursor((prev) => (view === 'month' ? addMonths(prev, dir) : addDays(prev, dir * STEP[view])))
  }

  return (
    <div className="section">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          <span className="title-serif">{formatTitle(view, cursor)}</span>
          <div className="icon-btn-row">
            <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label="이전">
              ‹
            </button>
            <button type="button" className="icon-btn" onClick={() => step(1)} aria-label="다음">
              ›
            </button>
          </div>
        </div>
        <div className="view-toggle">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              className={`view-toggle-item${view === v.key ? ' active' : ''}`}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-legend">
        <span className="calendar-legend-note">색은 좋고 나쁨이 아니라 감정의 종류를 구분해요</span>
        <span className="calendar-legend-item">
          <span className="mini-cal-dot mood" /> 마음 기록
        </span>
        <span className="calendar-legend-item">
          <span className="mini-cal-dot done" /> 할 일 완료
        </span>
        <span className="calendar-legend-item">
          <span className="mini-cal-dot" /> 일정
        </span>
      </div>

      {view === 'day' && <DayView />}
      {view === 'week' && <WeekView cursor={cursor} />}
      {view === 'month' && <MonthView cursor={cursor} onSelectDay={setSelectedDay} />}

      {selectedDay != null && <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />}
    </div>
  )
}
