import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PageMeta from '../components/PageMeta.jsx'
import { books } from '../data/booksData.js'

export default function BooksPage() {
  return (
    <div className="landing">
      <PageMeta
        title="책"
        description="신다미의 책을 소개합니다. 『마흔을 위한 이기적인 용기』를 비롯해 도덕경과 자기경영을 바탕으로 쓴 책을 만나보세요."
      />
      <SiteHeader />

      <main className="landing-main">
        <section className="landing-hero">
          <h1 className="landing-hero-title">책</h1>
          <p className="landing-hero-tagline">책에서 시작된 질문</p>
        </section>

        <section className="landing-section book-list-section">
          {books.map((book) => (
            <Link key={book.slug} to={`/books/${book.slug}`} className="book-card">
              <div className="book-cover" aria-hidden="true">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={`${book.title} 표지`} />
                ) : (
                  <span className="book-cover-placeholder">표지 준비 중</span>
                )}
              </div>
              <div className="book-card-body">
                <h2 className="book-card-title">{book.title}</h2>
                <p className="book-card-meta">
                  {book.author} · {book.publisher}
                </p>
                <p className="book-card-summary">{book.summary}</p>
                <span className="cta-arrow">→</span>
              </div>
            </Link>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
