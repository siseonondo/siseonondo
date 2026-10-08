import { Link } from 'react-router-dom'
import './SelfManagementProgram.css'

const CONTEXT_ID = 'self-management-context'

const PULL_SENTENCES = ['해야 한다는 마음', '다른 사람의 기대', '익숙한 습관', '아직 잘 모르겠어요']

const FLOW_STEPS = [
  { hanja: '正', word: '멈춤' },
  { hanja: '見', word: '바라봄' },
  { hanja: '取', word: '알아차림' },
  { hanja: '意', word: '뜻 세움' },
  { hanja: '動', word: '움직임' },
  { hanja: '感', word: '느낌' },
  { hanja: '億', word: '방향을 봄' },
]

function RootLines() {
  return (
    <svg
      className="sm-roots"
      viewBox="0 0 800 220"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M400 0 C400 40 396 70 392 100" />
      <path d="M392 100 C360 120 320 130 270 160 C240 178 210 190 170 220" />
      <path d="M320 132 C300 150 280 175 265 220" />
      <path d="M392 100 C396 140 398 170 404 220" />
      <path d="M392 100 C430 125 470 135 520 165 C550 183 585 195 630 220" />
      <path d="M470 136 C490 160 500 190 505 220" />
      <path d="M270 160 C250 172 235 195 228 220" />
      <path d="M520 165 C545 180 560 200 566 220" />
      <path d="M210 190 C190 200 170 205 130 210" />
      <path d="M585 195 C610 200 640 205 690 208" />
    </svg>
  )
}

function scrollToContext(e) {
  const target = document.getElementById(CONTEXT_ID)
  if (!target) return
  e.preventDefault()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

export default function SelfManagementProgram({ program }) {
  return (
    <>
      <section className="sm-hero">
        <RootLines />
        <p className="sm-eyebrow">자기경영 프로그램</p>
        <h1 className="sm-title">
          삶의 가지를 고치기 전에,
          <br />
          뿌리를 봅니다.
        </h1>
        <p className="sm-lead">
          더 잘하기 위한 관리가 아니라,
          <br />
          지금의 나를 보고 내 뜻으로 선택하기 위한 시간입니다.
        </p>
        <a href={`#${CONTEXT_ID}`} className="pause-cta sm-hero-cta" onClick={scrollToContext}>
          자기경영 살펴보기 ↓
        </a>
      </section>

      <section className="landing-section sm-section" id={CONTEXT_ID}>
        <p className="landing-body">
          시선온도는 다른 사람의 말과 시선에 바로 반응하기보다, 지금 내 마음에서 무엇이 일어나고 있는지
          먼저 바라보는 공간입니다.
        </p>
        <p className="landing-body">
          감정을 없애려 하기보다 그 감정이 알려주는 마음과 필요한 것을 살펴보고, 오늘의 선택을 정합니다.
        </p>
      </section>

      <section className="landing-section sm-section">
        <h2>나는 지금, 무엇에 끌려가고 있을까?</h2>
        <p className="landing-body">
          답하지 않아도 괜찮습니다.
          <br />
          지금 마음에 머무는 문장만 바라보세요.
        </p>
        <ul className="sm-pull-list">
          {PULL_SENTENCES.map((text) => (
            <li key={text} className="sm-pull-item">
              {text}
            </li>
          ))}
        </ul>
        <p className="sm-note">선택하지 않고 계속 읽을 수 있어요.</p>
      </section>

      <section className="landing-section sm-section">
        <h2>
          나를 경영하는 일은,
          <br />
          이 흐름을 다시 보는 데서 시작합니다.
        </h2>
        <p className="sm-flow-line" aria-hidden="true">
          {FLOW_STEPS.map((s) => s.hanja).join(' → ')}
        </p>
        <ol className="sm-steps">
          {FLOW_STEPS.map((step) => (
            <li key={step.hanja} className="sm-step">
              <span className="sm-step-word">{step.word}</span>
              <span className="sm-step-hanja">{step.hanja}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-section sm-section">
        <p className="landing-body">충분히 살펴보셨다면, 준비된 만큼만 천천히 시작해보세요.</p>
        <Link to="/pause-and-choose" className="pause-cta sm-cta">
          나의 흐름 천천히 살펴보기
        </Link>
      </section>

      <section className="sm-meta">
        <p className="landing-body">일정: {program.schedule || '아직 정해지지 않았습니다.'}</p>
        <p className="landing-body">장소: {program.location || '아직 정해지지 않았습니다.'}</p>
        {program.applyLink ? (
          <a href={program.applyLink} target="_blank" rel="noopener noreferrer" className="pause-cta">
            신청하기 →
          </a>
        ) : (
          <p className="landing-body book-purchase-pending">신청 링크는 준비되는 대로 안내합니다.</p>
        )}
        <Link to="/programs" className="sm-back-link">
          함께하는 일 전체 보기 →
        </Link>
      </section>
    </>
  )
}
