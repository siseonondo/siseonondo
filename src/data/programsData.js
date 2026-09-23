// 활동 소개, 일정, 장소, 신청 링크가 정해지면 해당 항목에 채워주세요.
// summary가 비어 있으면 화면에는 "소개 준비 중입니다"로 표시됩니다 — 확인되지 않은 문구를 임의로 채우지 마세요.
export const programs = [
  { slug: 'doduckyung-humanities', title: '도덕경 인문학', summary: null, schedule: null, location: null, applyLink: null },
  { slug: 'art-salon', title: '아트살롱', summary: null, schedule: null, location: null, applyLink: null },
  { slug: 'self-management-program', title: '자기경영 프로그램', summary: null, schedule: null, location: null, applyLink: null },
  { slug: 'genai-literacy', title: '생성형 AI 리터러시 강의', summary: null, schedule: null, location: null, applyLink: null },
  { slug: 'talks', title: '강연과 대화', summary: null, schedule: null, location: null, applyLink: null },
]

export function getProgramBySlug(slug) {
  return programs.find((p) => p.slug === slug) || null
}
