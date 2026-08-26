// relationType: 'same' | 'different' | 'practice'
// relationLabel: '같은 결' | '다른 시선' | '오늘의 실천'

export const quoteCollections = [
  {
    id: 'c1',
    title: '다른 사람의 시선 때문에 흔들릴 때',
    centerQuoteId: 'q2',
    connections: [
      {
        quoteId: 'q6',
        relationType: 'different',
        relationLabel: '다른 시선',
        relationNote:
          '다른 사람의 생각과 반응보다 내가 선택할 수 있는 판단과 태도로 시선을 돌립니다.',
      },
      {
        quoteId: 'q9',
        relationType: 'same',
        relationLabel: '같은 결',
        relationNote: '밖의 평가에 머물던 시선을 자신의 마음으로 되돌린다는 점에서 이어집니다.',
      },
    ],
  },
]

export function findCollectionByCenterQuoteId(quoteId) {
  return quoteCollections.find((c) => c.centerQuoteId === quoteId) || null
}
