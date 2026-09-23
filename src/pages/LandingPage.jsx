import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { books } from '../data/booksData.js'
import { programs } from '../data/programsData.js'
import { writings } from '../data/writingsData.js'

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.35-9.5-8.5C.8 8.2 2.2 4.5 6 4c2-.27 3.6.8 4.5 2.2C11.4 4.8 13 3.73 15 4c3.8.5 5.2 4.2 3.5 7.5C20 15.65 12 20 12 20z" />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20c9 0 14-5 14-14V4h-2C8 4 3 9 3 18v2z" />
      <path d="M5 20c3-6 6-9 12-12" />
    </svg>
  )
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6 6-2z" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4 2-4 4-4" />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8c-2 0-3 1.5-3 3.5S5 15 7 15c-.5 2-2 3-4 3.5" />
      <path d="M16 8c-2 0-3 1.5-3 3.5s1 3.5 3 3.5c-.5 2-2 3-4 3.5" />
    </svg>
  )
}

const MINI_FLOW = [
  { icon: HeartIcon, label: '감정 알아차리기', tone: 'purple' },
  { icon: LeafIcon, label: '필요한 것 살펴보기', tone: 'green' },
  { icon: CompassIcon, label: '오늘의 선택 정하기', tone: 'purple' },
]

const FEATURE_CARDS = [
  { title: '지금의 상태', desc: '몸과 마음의 컨디션을 가볍게 확인합니다.', to: '/today', icon: HeartIcon, tone: 'purple' },
  { title: '마음 기록', desc: '감정과 그 뒤에 필요했던 것을 기록합니다.', to: '/emotion', icon: DocumentIcon, tone: 'green' },
  {
    title: '멈춤과 선택',
    desc: '나를 끌고 가는 힘을 살펴보고 오늘 할 수 있는 것을 선택합니다.',
    to: '/pause-and-choose',
    icon: PauseIcon,
    tone: 'purple',
  },
  { title: '나의 흐름', desc: '반복되는 감정과 필요, 선택의 흐름을 돌아봅니다.', to: '/flow', icon: WaveIcon, tone: 'green' },
  {
    title: '문장 보관함',
    desc: '노자 도덕경을 비롯한 문장을 주제별로 찾아보고 저장합니다.',
    to: '/quotes',
    icon: QuoteIcon,
    tone: 'purple',
  },
]

const FLOW_STAGES = [
  { hanja: '正', title: '잠시 멈추기' },
  { hanja: '見', title: '지금 상태 보기' },
  { hanja: '取', title: '내 마음 알아보기' },
  { hanja: '意', title: '필요한 것 고르기' },
  { hanja: '動', title: '오늘 하나 실행하기' },
  { hanja: '感', title: '나의 감각 살피기' },
  { hanja: '億', title: '내가 향하는 방향 보기' },
]

const firstBook = books[0]
const previewWritings = writings.slice(0, 3)

export default function LandingPage() {
  return (
    <div className="landing">
      <PageMeta
        title="신다미의 글과 자기경영"
        description="철학자이자 작가 신다미가 도덕경을 바탕으로 삶의 질문과 선택을 나누는 공간입니다. 책, 자기경영, 아트살롱, AI 리터러시 활동과 기록 도구를 만날 수 있습니다."
      />
      <SiteHeader />

      <main className="landing-main">
        <section className="landing-hero">
          <h1 className="landing-hero-title">시선온도</h1>
          <p className="landing-hero-tagline">
            자신을 바라보는 시선을 켜고,
            <br />
            나의 길을 엽니다.
          </p>
          <p className="landing-hero-desc">
            감정에 바로 반응하기 전에 잠시 멈춰봅니다.
            <br />
            그 감정이 알려주는 마음과 지금 필요한 것을 바라봅니다.
          </p>
          <Link to="/today" className="pause-cta landing-hero-cta">
            오늘의 나 살펴보기
          </Link>
        </section>

        <section className="landing-section">
          <h2>시선의 길을 열다</h2>
          <p className="landing-body">
            시선온도는 신다미가 만든, 자신을 바라보는 시선을 여는 공간입니다.
            <br />
            '시선을 켜다'라는 ON과 '자신의 길'을 뜻하는 道를 담았습니다.
          </p>
          <p className="landing-body">
            다른 사람의 말과 시선에 바로 반응하기보다, 지금 내 마음에서 무엇이 일어나고 있는지 먼저
            바라봅니다.
          </p>
        </section>

        <section className="landing-section">
          <h2>감정 뒤에는 욕구가 있습니다</h2>
          <p className="landing-body">
            누군가 갑자기 화를 내면 우리는 그 말과 표정에 먼저 반응하기 쉽습니다. 하지만 그 사람이
            무엇을 원했는지 알게 되면 상황을 다르게 바라볼 수 있습니다.
          </p>
          <p className="landing-body">
            자신의 감정도 마찬가지입니다. 감정을 없애려 하기보다 그 감정이 무엇을 알려주는지
            살펴보면 지금 나에게 필요한 것을 이해할 수 있습니다.
          </p>
          <div className="landing-mini-flow">
            {MINI_FLOW.map((step, i) => (
              <span className="landing-mini-flow-step" key={step.label}>
                {i > 0 && <span className="landing-mini-flow-arrow">→</span>}
                <span className={`landing-mini-flow-icon tone-${step.tone}`}>
                  <step.icon />
                </span>
                <span className="landing-mini-flow-label">{step.label}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <h2>오늘의 나를 가볍게 살펴봅니다</h2>
          <div className="landing-feature-grid">
            {FEATURE_CARDS.map((feature) => (
              <Link key={feature.title} to={feature.to} className="cta-card landing-feature-card">
                <span className={`landing-feature-icon tone-${feature.tone}`}>
                  <feature.icon />
                </span>
                <div className="landing-feature-text">
                  <div className="cta-title">{feature.title}</div>
                  <div className="cta-sub">{feature.desc}</div>
                </div>
                <span className="cta-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <h2>멈추고, 바라보고, 선택합니다</h2>
          <div className="pause-flow-grid landing-flow-grid">
            {FLOW_STAGES.map((stage) => (
              <div key={stage.hanja} className="pause-flow-card landing-flow-card">
                <span className="pause-flow-hanja">{stage.hanja}</span>
                <span className="pause-flow-title">{stage.title}</span>
              </div>
            ))}
          </div>
          <Link to="/pause-and-choose" className="pause-cta">
            자기경영의 흐름 살펴보기
          </Link>
        </section>

        <section className="landing-section about-preview-section">
          <img src="/profile-shindami.jpg" alt="신다미 프로필 사진" className="about-photo about-photo-small" />
          <h2>질문을 통해 삶을 바라보는 사람</h2>
          <p className="landing-body">
            신다미는 도덕경을 바탕으로 삶을 바라보고, 글을 쓰고, 사람들과 질문을 나누는 철학자이자
            작가입니다.
          </p>
          <p className="landing-body">
            빠르게 답을 얻는 시대일수록 잠시 멈추어 자신이 무엇을 보고 있는지, 무엇을 선택하려
            하는지 살펴보아야 한다고 생각합니다.
          </p>
          <p className="landing-body">
            시선온도는 자신을 바라보는 시선을 켜고, 자신의 길을 찾아가기 위해 만든 공간입니다.
          </p>
          <Link to="/about" className="pause-cta">
            신다미 소개 보기 →
          </Link>
        </section>

        {firstBook && (
          <section className="landing-section">
            <h2>책에서 시작된 질문</h2>
            <Link to={`/books/${firstBook.slug}`} className="book-card book-card-preview">
              <div className="book-cover" aria-hidden="true">
                {firstBook.coverImage ? (
                  <img src={firstBook.coverImage} alt={`${firstBook.title} 표지`} />
                ) : (
                  <span className="book-cover-placeholder">표지 준비 중</span>
                )}
              </div>
              <div className="book-card-body">
                <h3 className="book-card-title">{firstBook.title}</h3>
                <p className="book-card-meta">
                  {firstBook.author} · {firstBook.publisher} · {firstBook.publishedDate}
                </p>
                <p className="book-card-summary">{firstBook.summary}</p>
              </div>
            </Link>
            <Link to={`/books/${firstBook.slug}`} className="pause-cta">
              책 이야기 보기 →
            </Link>
          </section>
        )}

        <section className="landing-section">
          <h2>시선을 나누는 글</h2>
          {previewWritings.length === 0 ? (
            <p className="landing-body writing-empty-note">
              아직 게시된 글이 없습니다. 글이 준비되는 대로 이곳에서 만나보실 수 있습니다.
            </p>
          ) : (
            <div className="writing-list">
              {previewWritings.map((w) => (
                <Link key={w.slug} to={`/writings/${w.slug}`} className="cta-card writing-card">
                  <div className="landing-feature-text">
                    <div className="cta-title">{w.title}</div>
                    <div className="cta-sub">{w.excerpt}</div>
                  </div>
                  <span className="cta-arrow">→</span>
                </Link>
              ))}
            </div>
          )}
          <Link to="/writings" className="pause-cta">
            글 목록 보기 →
          </Link>
        </section>

        <section className="landing-section">
          <h2>생각을 삶에서 나누는 일</h2>
          <div className="program-list-section program-list-preview">
            {programs.map((program) => (
              <Link key={program.slug} to={`/programs/${program.slug}`} className="cta-card program-card">
                <div className="landing-feature-text">
                  <div className="cta-title">{program.title}</div>
                </div>
                <span className="cta-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <p className="landing-body">생각을 읽는 데서 멈추지 않고, 오늘의 나를 직접 살펴봅니다.</p>
          <Link to="/today" className="pause-cta">
            오늘의 나 살펴보기 →
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
