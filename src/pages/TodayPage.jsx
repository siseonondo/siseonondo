import { todaySchedule, conditionHistory } from '../data/mockData'
import { verifiedQuotes, formatSourceLine } from '../data/quotesData'

const CONDITION_UPDATED_AT = '14:20 갱신'
const TODAY_INDEX = 25
const todayQuote = verifiedQuotes[TODAY_INDEX % verifiedQuotes.length]

const CONDITION_OPTION_LABELS = {
  1: '많이 지침',
  2: '조금 지침',
  3: '보통',
  4: '가벼움',
  5: '매우 가벼움',
}

export default function TodayPage({
  condition,
  onSelectCondition,
  tasks,
  onToggleTask,
  emotions,
  onGoEmotion,
  onGoQuotes,
  onGoPauseChoose,
}) {
  const todayTasks = tasks.filter((t) => t.bucket === 'today')
  const doneCount = todayTasks.filter((t) => t.done).length
  const topTasks = todayTasks.slice(0, 3)

  return (
    <div className="today-page">
      <div className="today-grid">
        <div className="today-left">
          <div className="card">
            <div className="card-row-title">
              <span className="title-serif">지금 컨디션은 어떤가요</span>
              <span className="meta-mono">{CONDITION_UPDATED_AT}</span>
            </div>
            <div className="condition-options">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`condition-option${n === condition ? ' selected' : ''}`}
                  onClick={() => onSelectCondition(n)}
                  aria-pressed={n === condition}
                >
                  <span className="condition-option-num">{n}</span>
                  <span className="condition-option-label">{CONDITION_OPTION_LABELS[n]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <span className="section-title">오늘 일정 · {todaySchedule.length}</span>
              <span className="section-meta">전체보기</span>
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

          <div className="section">
            <div className="section-header">
              <span className="section-title">오늘 꼭 할 일</span>
              <span className="section-meta">{doneCount} / {todayTasks.length} 완료</span>
            </div>
            <div className="task-list">
              {topTasks.map((t) => (
                <button
                  type="button"
                  className={`task-row${t.done ? ' done' : ''}`}
                  key={t.id}
                  onClick={() => onToggleTask(t.id)}
                >
                  <span className={`checkbox${t.done ? ' checked' : ''}`}>{t.done && '✓'}</span>
                  <span className={`task-title${t.done ? ' done' : ''}`}>{t.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="today-right">
          <div className="card card-selfcare">
            <span className="meta-mono-green">나를 위한 일</span>
            <span className="title-serif-green">해 지기 전에 20분 산책하기</span>
            <span className="sub-green">오늘 하나면 충분해요</span>
          </div>

          <button type="button" className="cta-card" onClick={onGoEmotion}>
            <div>
              <div className="cta-title">지금 기분 기록하기</div>
              <div className="cta-sub">오늘 {emotions.length}번 기록했어요</div>
            </div>
            <span className="cta-arrow">→</span>
          </button>

          <div className="card pause-intro-card">
            <span className="section-title">지금 나를 끌고 가는 힘</span>
            <p className="pause-intro-desc">
              오래된 습관이나 다른 사람의 기대에 끌려가고 있지는 않은지 가볍게 살펴보세요.
            </p>
            <button className="pause-intro-btn" type="button" onClick={onGoPauseChoose}>
              확인해보기
            </button>
          </div>

          <button type="button" className="card card-reset-btn" onClick={onGoQuotes}>
            <span className="section-title">오늘의 문장</span>
            <div className="today-quote-text">
              {todayQuote.quoteType === 'translation' ? `"${todayQuote.text}"` : todayQuote.text}
            </div>
            <span className="meta-mono">{formatSourceLine(todayQuote)}</span>
          </button>

          <div className="card">
            <div className="card-row-title">
              <span className="section-title">최근 기록</span>
              <span className="section-meta">{emotions.length}개</span>
            </div>
            <div className="emotion-mini-list">
              {emotions.map((e) => (
                <div className="emotion-mini-row" key={e.id}>
                  <span className={`chip ${e.color}`}>{e.tag}</span>
                  <span className="emotion-mini-text">{e.situation}</span>
                  <span className="emotion-mini-time">{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="today-full">
        <div className="card">
          <span className="section-title">최근 7일 컨디션</span>
          <div className="bar-chart">
            {conditionHistory.map((d) => (
              <div
                key={d.day}
                className={`bar${d.active ? ' active' : ''}`}
                style={{ height: `${(d.level / 5) * 100}%` }}
              />
            ))}
          </div>
          <div className="bar-chart-labels">
            {conditionHistory.map((d) => (
              <span key={d.day}>{d.day}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
