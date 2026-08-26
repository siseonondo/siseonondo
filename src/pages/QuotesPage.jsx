import { useState } from 'react'
import { quotes, quoteCategories, verifiedQuotes, formatSourceLine } from '../data/quotesData'

const TODAY_INDEX = 25
const todaysQuotes = [
  verifiedQuotes[TODAY_INDEX % verifiedQuotes.length],
  verifiedQuotes[(TODAY_INDEX + 1) % verifiedQuotes.length],
]

const QUOTE_TYPE_LABEL = {
  translation: '원문 번역',
  interpretation: '뜻을 풀어쓴 문장',
}

function QuoteCard({ quote, isSaved, onToggleSave, note, onNoteChange }) {
  const [sourceOpen, setSourceOpen] = useState(false)
  const isTranslation = quote.quoteType === 'translation'

  return (
    <div className="quote-card">
      <div className="quote-card-body">
        <div className="quote-card-text">{isTranslation ? `"${quote.text}"` : quote.text}</div>
        <div className="quote-card-meta">
          <span className="meta-mono">{formatSourceLine(quote)}</span>
          <div className="quote-card-categories">
            {quote.categories.map((cat) => (
              <span key={cat} className={`chip ${cat === '불안' ? 'blue' : 'green'}`}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="quote-source-toggle"
          aria-expanded={sourceOpen}
          onClick={() => setSourceOpen((v) => !v)}
        >
          {sourceOpen ? '출처 접기' : '출처 보기'}
        </button>

        {sourceOpen && (
          <div className="quote-source-detail">
            {quote.author && (
              <div>
                <span className="label">저자</span> {quote.author}
              </div>
            )}
            {quote.sourceTitle && (
              <div>
                <span className="label">책 이름</span> {quote.sourceTitle}
              </div>
            )}
            {quote.chapterOrSection && (
              <div>
                <span className="label">장·절</span> {quote.chapterOrSection}
              </div>
            )}
            {quote.originalText && (
              <div>
                <span className="label">원문</span> {quote.originalText}
              </div>
            )}
            <div>
              <span className="label">문장 유형</span> {QUOTE_TYPE_LABEL[quote.quoteType]}
            </div>
            {isTranslation && quote.translationInfo && (
              <div>
                <span className="label">번역 정보</span> {quote.translationInfo}
              </div>
            )}
            {!isTranslation && (
              <div>
                <span className="label">풀이 안내</span> 이 문장은 원전을 그대로 옮긴 번역이 아니라, 그
                뜻을 현대적인 언어로 풀어쓴 것입니다.
              </div>
            )}
            {quote.verificationNote && (
              <div>
                <span className="label">확인 필요</span> {quote.verificationNote}
              </div>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className={`quote-save-btn${isSaved ? ' saved' : ''}`}
        onClick={() => onToggleSave(quote.id)}
        aria-pressed={isSaved}
      >
        {isSaved ? '★ 저장됨' : '☆ 저장'}
      </button>
      {isSaved && (
        <input
          className="task-note-input"
          placeholder="짧은 메모"
          defaultValue={note || ''}
          onBlur={(e) => onNoteChange(quote.id, e.target.value)}
        />
      )}
    </div>
  )
}

export default function QuotesPage({ saved, onToggleSave, onUpdateNote }) {
  const [category, setCategory] = useState('전체')
  const [search, setSearch] = useState('')

  const byCategory =
    category === '전체' ? quotes : quotes.filter((q) => q.categories.includes(category))

  const normalizedSearch = search.trim().toLowerCase()
  const filtered = normalizedSearch
    ? byCategory.filter((q) => {
        const haystack = [q.text, q.author, q.sourceTitle, ...q.categories].join(' ').toLowerCase()
        return haystack.includes(normalizedSearch)
      })
    : byCategory

  const savedQuotes = quotes.filter((q) => saved[q.id])

  const renderCard = (q) => (
    <QuoteCard
      key={q.id}
      quote={q}
      isSaved={!!saved[q.id]}
      onToggleSave={onToggleSave}
      note={saved[q.id]?.note}
      onNoteChange={onUpdateNote}
    />
  )

  return (
    <div className="quotes-page">
      <div className="section">
        <div className="section-header">
          <span className="section-title">오늘의 두 문장</span>
        </div>
        <div className="quote-list">{todaysQuotes.map(renderCard)}</div>
      </div>

      {savedQuotes.length > 0 && (
        <div className="section">
          <div className="section-header">
            <span className="section-title">저장한 문장</span>
            <span className="section-meta">{savedQuotes.length}개</span>
          </div>
          <div className="quote-list">
            {savedQuotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                isSaved
                onToggleSave={onToggleSave}
                note={saved[q.id]?.note}
                onNoteChange={onUpdateNote}
              />
            ))}
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <span className="section-title">고민별 문장</span>
        </div>

        <input
          className="quote-search-input"
          type="text"
          placeholder="문장이나 주제를 찾아보세요"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="need-chip-row scrollable">
          {['전체', ...quoteCategories].map((c) => (
            <button
              key={c}
              type="button"
              className={`need-chip${category === c ? ' selected' : ''}`}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="quote-list">
          {filtered.length > 0 ? (
            filtered.map(renderCard)
          ) : (
            <div className="quote-empty">아직 담긴 문장이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  )
}
