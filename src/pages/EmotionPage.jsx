import { useState } from 'react'
import { emotionOptions, areaOptions, needOptions } from '../data/mockData'

export default function EmotionPage({ emotions, onSave, canSave }) {
  const [selectedEmotion, setSelectedEmotion] = useState(emotionOptions[0])
  const [intensity, setIntensity] = useState(3)
  const [selectedArea, setSelectedArea] = useState(areaOptions[0])
  const [selectedNeed, setSelectedNeed] = useState(needOptions[0])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await onSave(selectedEmotion, note, selectedNeed, intensity, selectedArea)
      setNote('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="emotion-grid">
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
          disabled={!canSave}
          style={!canSave ? { opacity: 0.5, cursor: 'default' } : undefined}
        >
          {canSave ? (saving ? '저장 중…' : '저장하기') : '로그인하면 저장돼요'}
        </button>
      </div>
    </div>
  )
}
