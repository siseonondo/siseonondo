import { useEffect } from 'react'

const SITE_URL = 'https://siseonondo.kr'
const DEFAULT_DESCRIPTION =
  '시선온도는 신다미가 만든 자기경영 공간입니다. 도덕경 문장으로 하루를 돌아보고 감정 뒤의 욕구를 살피며 오늘의 선택을 기록하세요.'

function setMetaTag(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function PageMeta({ title, description }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · 시선온도` : '시선온도 | 신다미의 자기경영 공간'
    const desc = description || DEFAULT_DESCRIPTION
    const url = SITE_URL + window.location.pathname

    document.title = fullTitle
    setMetaTag('name', 'description', desc)
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:description', desc)
    setMetaTag('property', 'og:url', url)
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('name', 'twitter:description', desc)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', url)
  }, [title, description])

  return null
}
