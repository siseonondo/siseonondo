import { Link, Navigate, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PageMeta from '../components/PageMeta.jsx'
import StructuredData from '../components/StructuredData.jsx'
import { getBookBySlug, formatBookDate } from '../data/booksData.js'

export default function BookDetailPage() {
  const { slug } = useParams()
  const book = getBookBySlug(slug)

  if (!book) {
    return <Navigate to="/books" replace />
  }

  const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.author, url: 'https://siseonondo.kr/about' },
    publisher: { '@type': 'Organization', name: book.publisher },
    datePublished: book.publishedDate,
    ...(book.isbn ? { isbn: book.isbn } : {}),
    ...(book.description || book.summary ? { description: book.description || book.summary } : {}),
    ...(book.purchaseLinks.length > 0
      ? {
          offers: book.purchaseLinks.map((link) => ({
            '@type': 'Offer',
            url: link.url,
            seller: { '@type': 'Organization', name: link.label },
          })),
        }
      : {}),
  }

  return (
    <div className="landing">
      <PageMeta
        title={book.title}
        description={book.description || book.summary}
        image={book.coverImage ? `https://siseonondo.kr${book.coverImage}` : undefined}
      />
      <StructuredData id="ld-book" data={bookJsonLd} />
      <SiteHeader />

      <main className="landing-main">
        <section className="landing-section book-detail-section">
          <div className="book-cover book-cover-large" aria-hidden="true">
            {book.coverImage ? (
              <img src={book.coverImage} alt={`${book.title} 표지`} />
            ) : (
              <span className="book-cover-placeholder">표지 준비 중</span>
            )}
          </div>
          <h1 className="landing-hero-title book-detail-title">{book.title}</h1>
          {book.subtitle && <p className="landing-hero-tagline book-detail-subtitle">{book.subtitle}</p>}
          <p className="book-detail-meta">
            {book.author} · {book.publisher} · {formatBookDate(book.publishedDate)}
          </p>
          <p className="landing-body">{book.summary}</p>
          {book.description && <p className="landing-body">{book.description}</p>}

          {book.purchaseLinks.length > 0 ? (
            <div className="book-purchase-links">
              {book.purchaseLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="pause-cta">
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="landing-body book-purchase-pending">구매 링크는 준비되는 대로 안내합니다.</p>
          )}

          <Link to="/about" className="pause-cta">
            신다미 소개 보기 →
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
