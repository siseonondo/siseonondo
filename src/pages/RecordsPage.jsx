import { dayRecord, recordedDays } from '../data/mockData'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const PREV_MONTH_TAIL = [27, 28, 29, 30, 31]
const SELECTED_DAY = 25

function buildGrid() {
  const cells = PREV_MONTH_TAIL.map((day) => ({ day, outside: true }))
  for (let day = 1; day <= 31; day += 1) {
    cells.push({ day, outside: false, recorded: recordedDays.has(day), selected: day === SELECTED_DAY })
  }
  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, outside: true })
    nextDay += 1
  }
  return cells
}

const gridCells = buildGrid()

function topByFrequency(list, key) {
  if (list.length === 0) return null
  const counts = {}
  list.forEach((item) => {
    const value = item[key]
    if (!value) return
    counts[value] = (counts[value] || 0) + 1
  })
  const entries = Object.entries(counts)
  if (entries.length === 0) return null
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}

export default function RecordsPage({ emotions = [], tasks = [] }) {
  const topEmotion = topByFrequency(emotions, 'tag')
  const topNeed = topByFrequency(emotions, 'need')
  const doneCount = tasks.filter((t) => t.done).length

  return (
    <div className="records-grid">
      <div className="flow-summary-row">
        <div className="card flow-summary-card">
          <span className="section-title">자주 선택한 감정</span>
          <span className="title-serif" style={{ fontSize: 17 }}>
            {topEmotion ? `'${topEmotion}'을 자주 선택했어요` : '아직 기록이 없어요'}
          </span>
        </div>
        <div className="card flow-summary-card">
          <span className="section-title">자주 필요했던 것</span>
          <span className="title-serif" style={{ fontSize: 17 }}>
            {topNeed ? `'${topNeed}'이 가장 많이 필요했어요` : '아직 기록이 없어요'}
          </span>
        </div>
        <div className="card flow-summary-card">
          <span className="section-title">완료한 할 일</span>
          <span className="title-serif" style={{ fontSize: 17 }}>{doneCount}개 완료했어요</span>
        </div>
      </div>

      <div className="mini-cal">
        <div className="mini-cal-head">
          <span className="title-serif">2026년 8월</span>
          <div className="icon-btn-row">
            <span className="icon-btn">‹</span>
            <span className="icon-btn">›</span>
          </div>
        </div>
        <div className="mini-cal-weekdays">
          {WEEKDAYS.map((w) => (
            <span className="mini-cal-weekday" key={w}>
              {w}
            </span>
          ))}
        </div>
        <div className="mini-cal-days">
          {gridCells.map((cell, i) => (
            <div
              key={i}
              className={`mini-cal-day${cell.outside ? ' outside' : cell.recorded ? '' : ' muted'}${
                cell.selected ? ' selected' : ''
              }`}
            >
              {cell.day}
              {!cell.outside && cell.recorded && <span className="mini-cal-dot" />}
            </div>
          ))}
        </div>
        <div className="mini-cal-footnote">
          <span className="mini-cal-dot" />
          <span>기록이 있는 날 · 이번 달 {recordedDays.size}일</span>
        </div>
      </div>

      <div className="day-detail">
        <div className="day-detail-head">
          <span className="title-serif">{dayRecord.dateLabel}</span>
          <span className="day-detail-nav">‹ 24일 · 26일 ›</span>
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
          <div className="day-stat-card selfcare">
            <span className="meta-mono">셀프케어</span>
            <span className="title-serif" style={{ fontSize: 15 }}>
              {dayRecord.selfcare.label}
            </span>
          </div>
        </div>

        <div className="section">
          <span className="section-title">감정 기록</span>
          {dayRecord.emotions.map((e) => (
            <div className="emotion-record-card" key={e.id}>
              <span className={`chip ${e.color}`} style={{ alignSelf: 'flex-start' }}>
                {e.tag}
              </span>
              <div className="emotion-record-body">{e.situation}</div>
              <div className="emotion-record-need">
                <span className="label">욕구</span>
                <span className="value">· {e.need}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="day-detail-two-col">
          <div className="day-detail-list">
            <span className="section-title">태스크</span>
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
