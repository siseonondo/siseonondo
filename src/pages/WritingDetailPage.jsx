import { Link, Navigate, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PageMeta from '../components/PageMeta.jsx'
import StructuredData from '../components/StructuredData.jsx'
import { getWritingBySlug } from '../data/writingsData.js'

export default function WritingDetailPage() {
  const { slug } = useParams()
  const writing = getWritingBySlug(slug)

  if (!writing) {
    return <Navigate to="/writings" replace />
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: writing.title,
    description: writing.excerpt,
    datePublished: writing.publishedDate,
    author: { '@type': 'Person', name: writing.author || '신다미', url: 'https://siseonondo.kr/about' },
    ...(writing.coverImage ? { image: `https://siseonondo.kr${writing.coverImage}` } : {}),
  }

  return (
    <div className="landing">
      <PageMeta title={writing.title} description={writing.excerpt} />
      <StructuredData id="ld-article" data={articleJsonLd} />
      <SiteHeader />

      <main className="landing-main">
        <section className="landing-section writing-detail-section">
          <span className="chip writing-topic-chip">{writing.topic}</span>
          <h1 className="landing-hero-title writing-detail-title">{writing.title}</h1>
          <p className="writing-detail-meta">
            {writing.author || '신다미'} · {writing.publishedDate}
          </p>
          <div className="landing-body writing-detail-body">{writing.body}</div>
          <Link to="/about" className="pause-cta">
            신다미 소개 보기 →
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
