import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { programs } from '../data/programsData.js'

export default function ProgramsPage() {
  return (
    <div className="landing">
      <PageMeta
        title="함께하는 일"
        description="도덕경 인문학, 아트살롱, 자기경영 프로그램, 생성형 AI 리터러시 강의, 강연과 대화 — 신다미가 생각을 삶에서 나누는 활동을 소개합니다."
      />
      <SiteHeader />

      <main className="landing-main">
        <section className="landing-hero">
          <h1 className="landing-hero-title">함께하는 일</h1>
          <p className="landing-hero-tagline">생각을 삶에서 나누는 일</p>
        </section>

        <section className="landing-section program-list-section">
          {programs.map((program) => (
            <Link key={program.slug} to={`/programs/${program.slug}`} className="cta-card program-card">
              <div className="landing-feature-text">
                <div className="cta-title">{program.title}</div>
                <div className="cta-sub">{program.summary || '소개 준비 중입니다.'}</div>
              </div>
              <span className="cta-arrow">→</span>
            </Link>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
