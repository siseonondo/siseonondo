import { useState } from 'react'
import { emotionOptions, areaOptions, needOptions } from '../data/mockData'
import PageMeta from '../components/PageMeta.jsx'

export default function EmotionPage({ emotions, onSave, canSave }) {
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [intensity, setIntensity] = useState(null)
  const [selectedArea, setSelectedArea] = useState(null)
  const [selectedNeed, setSelectedNeed] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const isComplete =
    selectedEmotion != null && intensity != null && selectedArea != null && selectedNeed != null
  const canSubmit = canSave && isComplete && !saving

  const handleSave = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSave(selectedEmotion, note, selectedNeed, intensity, selectedArea)
      setSelectedEmotion(null)
      setIntensity(null)
      setSelectedArea(null)
      setSelectedNeed(null)
      setNote('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="emotion-grid">
      <PageMeta
        title="마음 기록"
        description="감정과 그 뒤에 필요했던 것을 기록하는 시선온도의 마음 기록 공간입니다."
        noindex
      />
      <div className="today-left">
        <div className="card-row-title">
          <span className="title-serif">오늘 어떤 마음이 지나갔나요</span>
          <span className="section-meta">{emotions.length}개 기록</span>
        </div>
        {emotions.map((e) => (
          <div className="emotion-record-card" key={e.id}>
            <div className="emotion-record-head">
              <span className={`chip ${e.color}`}>{e.tag}</span>
              {e.intensity != null && <span className="meta-mono">정도 {e.intensity}</span>}
              {e.area && <span className="meta-mono">{e.area}</span>}
              <span className="meta-mono">{e.time}</span>
            </div>
            {e.situation && <div className="emotion-record-body">{e.situation}</div>}
            <div className="emotion-record-need">
              <span className="label">필요한 것</span>
              <span className="value">· {e.need}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="form-card">
        <div className="title-serif">새 감정 기록</div>

        <div className="form-step">
          <div className="form-step-head">
            <span className="form-step-num">01</span>
            <span className="form-step-label">감정 선택</span>
          </div>
          <div className="emotion-option-grid">
            {emotionOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`emotion-option${selectedEmotion === opt ? ' selected' : ''}`}
                onClick={() => setSelectedEmotion(opt)}
                aria-pressed={selectedEmotion === opt}
              >
                {opt}
              </button>
            ))}
            <button type="button" className="emotion-option add">
              ＋
            </button>
          </div>
        </div>

        <div className="form-step">
          <div className="form-step-head">
            <span className="form-step-num">02</span>
            <span className="form-step-label">감정의 정도</span>
          </div>
          <div className="condition-options">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`condition-option${n === intensity ? ' selected' : ''}`}
                onClick={() => setIntensity(n)}
                aria-pressed={n === intensity}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="form-step">
          <div className="form-step-head">
            <span className="form-step-num">03</span>
            <span className="form-step-label">영향을 준 영역</span>
          </div>
          <div className="need-chip-row">
            {areaOptions.map((area) => (
              <button
                key={area}
                type="button"
                className={`need-chip${selectedArea === area ? ' selected' : ''}`}
                onClick={() => setSelectedArea(area)}
                aria-pressed={selectedArea === area}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div className="form-step">
          <div className="form-step-head">
            <span className="form-step-num">04</span>
            <span className="form-step-label">지금 필요한 것</span>
          </div>
          <div className="need-chip-row">
            {needOptions.map((need) => (
              <button
                key={need}
                type="button"
                className={`need-chip${selectedNeed === need ? ' selected' : ''}`}
                onClick={() => setSelectedNeed(need)}
                aria-pressed={selectedNeed === need}
              >
                {need}
              </button>
            ))}
          </div>
        </div>

        <div className="form-step">
          <div className="form-step-head">
            <span className="form-step-num">05</span>
            <span className="form-step-label">한 줄 메모</span>
            <span className="form-step-hint">선택</span>
          </div>
          <textarea
            className="situation-input"
            placeholder="무슨 일이 있었나요"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="form-submit"
          onClick={handleSave}
          disabled={!canSubmit}
          style={!canSubmit ? { opacity: 0.5, cursor: 'default' } : undefined}
        >
          {saving ? '저장 중…' : '저장하기'}
        </button>
        {!isComplete && <p className="form-submit-hint">위 항목을 차례로 선택해주세요.</p>}
      </div>
    </div>
  )
}
