// 책 정보를 이 배열에 추가하면 책 목록/상세 페이지에 자동으로 반영됩니다.
// 확인되지 않은 정보(ISBN, 구매 링크, 추천사 등)는 비워두거나 null로 둡니다 — 임의로 채우지 마세요.
export const books = [
  {
    slug: 'forty-selfish-courage',
    title: '마흔을 위한 이기적인 용기',
    subtitle: '결핍을 성장으로 바꾸는 나만의 자기경영',
    author: '신다미',
    publisher: '미다스북스',
    publishedDate: '2026-02-04',
    coverImage: '/book-forty-selfish-courage.webp',
    summary:
      '삶의 중간에서 타인의 기준이 아니라 자신의 마음을 바라보고, 자신을 위한 선택을 시작하는 이야기를 담았습니다.',
    // 상세 소개, 목차, 추천사 등은 확인되는 대로 추가해주세요.
    description: null,
    isbn: null,
    purchaseLinks: [{ label: 'YES24', url: 'https://www.yes24.com/product/goods/175318707' }],
    status: 'published',
  },
  // 두 번째 책은 아직 출간 전이라 공개 정보가 확정되기 전까지 이 목록에 추가하지 않습니다.
]

export function getBookBySlug(slug) {
  return books.find((b) => b.slug === slug) || null
}

// 화면 표시용 포맷만 바꿀 뿐, book.publishedDate 원본(ISO 형식)은 그대로 둡니다.
export function formatBookDate(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`
}
