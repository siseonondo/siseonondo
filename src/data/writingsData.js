// 글이 쌓이면 이 배열에 항목을 추가해주세요. 지금은 아직 게시된 글이 없어 비워둡니다.
export const writingTopics = ['도덕경', '자기경영', '멈춤과 선택', '질문과 분별', 'AI 시대의 생각', '삶과 관계']

// 예시 항목 형태 (실제 글이 준비되면 이 형태로 추가):
// {
//   slug: 'example-slug',
//   title: '글 제목',
//   excerpt: '짧은 소개',
//   topic: '도덕경',
//   publishedDate: '2026-01-01',
//   coverImage: null,
//   author: '신다미',
//   body: '본문 내용',
// }
export const writings = []

export function getWritingBySlug(slug) {
  return writings.find((w) => w.slug === slug) || null
}
