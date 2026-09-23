import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { writings, writingTopics } from '../data/writingsData.js'

export default function WritingsPage() {
  return (
    <div className="landing">
      <PageMeta
        title="생각"
        description="도덕경, 자기경영, 멈춤과 선택, 질문과 분별, AI 시대의 생각, 삶과 관계를 주제로 신다미가 쓰는 글이 쌓이는 공간입니다."
      />
      <SiteHeader />

      <main className="landing-main">
        <section className="landing-hero">
          <h1 className="landing-hero-title">생각</h1>
          <p className="landing-hero-tagline">시선을 나누는 글</p>
        </section>

        <section className="landing-section">
          <div className="writing-topics">
            {writingTopics.map((topic) => (
              <span key={topic} className="chip writing-topic-chip">
                {topic}
              </span>
            ))}
          </div>

          {writings.length === 0 ? (
            <p className="landing-body writing-empty-note">
              아직 게시된 글이 없습니다. 글이 준비되는 대로 이곳에서 만나보실 수 있습니다.
            </p>
          ) : (
            <div className="writing-list">
              {writings.map((w) => (
                <Link key={w.slug} to={`/writings/${w.slug}`} className="cta-card writing-card">
                  <div className="landing-feature-text">
                    <div className="cta-title">{w.title}</div>
                    <div className="cta-sub">{w.excerpt}</div>
                    <div className="writing-card-meta">
                      {w.topic} · {w.publishedDate}
                    </div>
                  </div>
                  <span className="cta-arrow">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
