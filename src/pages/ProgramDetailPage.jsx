import { Link, Navigate, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PageMeta from '../components/PageMeta.jsx'
import StructuredData from '../components/StructuredData.jsx'
import { getProgramBySlug } from '../data/programsData.js'

export default function ProgramDetailPage() {
  const { slug } = useParams()
  const program = getProgramBySlug(slug)

  if (!program) {
    return <Navigate to="/programs" replace />
  }

  // 실제 일정이 확정되면 Event 구조화 데이터를 추가해주세요 (확정 전에는 넣지 않습니다).
  const eventJsonLd =
    program.schedule && program.location
      ? {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: program.title,
          startDate: program.schedule,
          location: { '@type': 'Place', name: program.location },
          ...(program.applyLink ? { url: program.applyLink } : {}),
        }
      : null

  return (
    <div className="landing">
      <PageMeta title={program.title} description={program.summary || undefined} />
      <StructuredData id="ld-event" data={eventJsonLd} />
      <SiteHeader />

      <main className="landing-main">
        <section className="landing-section">
          <h1 className="landing-hero-title book-detail-title">{program.title}</h1>
          <p className="landing-body">{program.summary || '소개 문구는 준비 중입니다.'}</p>

          <div className="program-detail-meta">
            <p className="landing-body">일정: {program.schedule || '아직 정해지지 않았습니다.'}</p>
            <p className="landing-body">장소: {program.location || '아직 정해지지 않았습니다.'}</p>
          </div>

          {program.applyLink ? (
            <a href={program.applyLink} target="_blank" rel="noopener noreferrer" className="pause-cta">
              신청하기 →
            </a>
          ) : (
            <p className="landing-body book-purchase-pending">신청 링크는 준비되는 대로 안내합니다.</p>
          )}

          <Link to="/programs" className="pause-cta">
            함께하는 일 전체 보기 →
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
