import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import PageMeta from '../components/PageMeta.jsx'
import StructuredData from '../components/StructuredData.jsx'
import { books } from '../data/booksData.js'

const firstBook = books[0]
const PROFILE_PHOTO = '/profile-shindami.jpg'

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://siseonondo.kr/#person',
  name: '신다미',
  url: 'https://siseonondo.kr/about',
  image: `https://siseonondo.kr${PROFILE_PHOTO}`,
  jobTitle: ['철학자', '작가'],
  knowsAbout: ['도덕경', '자기경영', '질문과 선택', '생성형 AI 리터러시'],
  description: '도덕경을 바탕으로 AI 시대의 질문과 선택을 탐구하는 철학자이자 작가',
}

export default function AboutPage() {
  return (
    <div className="landing">
      <PageMeta
        title="신다미 — 도덕경을 바탕으로 삶을 바라보는 철학자이자 작가"
        description="신다미는 도덕경을 바탕으로 AI 시대의 질문과 선택을 탐구하는 철학자이자 작가입니다. 시선온도를 만든 이유와 책, 자기경영 프로그램, 아트살롱, AI 리터러시 강의로 이어지는 활동을 소개합니다."
        image={personJsonLd.image}
      />
      <StructuredData id="ld-person" data={personJsonLd} />
      <SiteHeader />

      <main className="landing-main">
        <section className="landing-hero about-hero">
          <img src={PROFILE_PHOTO} alt="신다미 프로필 사진" className="about-photo" />
          <h1 className="landing-hero-title">신다미</h1>
          <p className="landing-hero-tagline">도덕경을 바탕으로 AI 시대의 질문과 선택을 탐구하는 철학자이자 작가</p>
        </section>

        <section className="landing-section">
          <h2>작가 소개</h2>
          <p className="landing-body">
            신다미는 도덕경을 바탕으로 삶을 바라보고, 글을 쓰고, 사람들과 질문을 나누는 철학자이자
            작가입니다.
          </p>
          <p className="landing-body">
            빠르게 답을 얻는 시대일수록 잠시 멈추어 자신이 무엇을 보고 있는지, 무엇을 선택하려
            하는지 살펴보아야 한다고 생각합니다.
          </p>
        </section>

        {firstBook && (
          <section className="landing-section">
            <h2>『{firstBook.title}』 저자</h2>
            <p className="landing-body">{firstBook.summary}</p>
            <Link to={`/books/${firstBook.slug}`} className="pause-cta">
              책 이야기 보기 →
            </Link>
          </section>
        )}

        <section className="landing-section">
          <h2>도덕경 공부와 글쓰기</h2>
          <p className="landing-body">
            도덕경을 꾸준히 읽고 공부하며, 그 안에서 발견한 생각을 글로 정리하고 사람들과 나눕니다.
          </p>
        </section>

        <section className="landing-section">
          <h2>시선온도를 만든 이유</h2>
          <p className="landing-body">
            다른 사람의 말과 시선에 바로 반응하기보다, 지금 내 마음에서 무엇이 일어나고 있는지 먼저
            바라볼 수 있는 공간이 필요하다고 생각해 시선온도를 만들었습니다.
          </p>
          <Link to="/" className="pause-cta">
            시선온도 살펴보기 →
          </Link>
        </section>

        <section className="landing-section">
          <h2>책, 강의, 프로그램으로 이어지는 활동</h2>
          <p className="landing-body">자기경영 프로그램, 아트살롱, 생성형 AI 리터러시 강의를 통해 생각을 삶에서 나눕니다.</p>
          <Link to="/programs" className="pause-cta">
            함께하는 일 보기 →
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
