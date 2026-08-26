import { useState } from 'react'
import { quotes, quoteCategories } from '../data/quotesData'

const TODAY_INDEX = 25
const todaysQuotes = [quotes[TODAY_INDEX % quotes.length], quotes[(TODAY_INDEX + 1) % quotes.length]]

function QuoteCard({ quote, isSaved, onToggleSave, note, onNoteChange }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="quote-card">
      <div className="quote-card-body" onClick={() => setExpanded((v) => !v)}>
        <div className="quote-card-text">"{quote.text}"</div>
        <div className="quote-card-meta">
          <span className="meta-mono">{quote.author} · {quote.source}</span>
          <span className={`chip ${quote.category === '불안' ? 'blue' : 'green'}`}>{quote.category}</span>
        </div>
        {expanded && quote.original && <div className="quote-card-original">원문 · {quote.original}</div>}
      </div>
      <span
        className={`quote-save-btn${isSaved ? ' saved' : ''}`}
        onClick={() => onToggleSave(quote.id)}
      >
        {isSaved ? '★ 저장됨' : '☆ 저장'}
      </span>
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

  const filtered = category === '전체' ? quotes : quotes.filter((q) => q.category === category)
  const savedQuotes = quotes.filter((q) => saved[q.id])

  return (
    <div className="quotes-page">
      <div className="section">
        <div className="section-header">
          <span className="section-title">오늘의 두 문장</span>
        </div>
        <div className="quote-list">
          {todaysQuotes.map((q) => (
            <QuoteCard
              key={q.id}
              quote={q}
              isSaved={!!saved[q.id]}
              onToggleSave={onToggleSave}
              note={saved[q.id]?.note}
              onNoteChange={onUpdateNote}
            />
          ))}
        </div>
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
        <div className="need-chip-row">
          {['전체', ...quoteCategories].map((c) => (
            <span
              key={c}
              className={`need-chip${category === c ? ' selected' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="quote-list">
          {filtered.map((q) => (
            <QuoteCard
              key={q.id}
              quote={q}
              isSaved={!!saved[q.id]}
              onToggleSave={onToggleSave}
              note={saved[q.id]?.note}
              onNoteChange={onUpdateNote}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
