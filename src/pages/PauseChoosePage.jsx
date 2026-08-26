import { useState } from 'react'

const PULL_CHECKLIST = [
  '해야 할 일을 해내고 있지만, 왜 이렇게 바쁜지 모르겠다.',
  '쉬고 있어도 마음은 계속 무언가를 해야 한다고 재촉한다.',
  '내가 원하는 것보다 다른 사람의 기대와 시선이 먼저 떠오른다.',
  '선택을 하고도 ‘이게 맞을까?’ 하며 자꾸 답을 밖에서 찾는다.',
  '무엇이 옳은지는 알겠는데, 무엇이 나다운지는 잘 모르겠다.',
  '몸은 힘들다고 말하는데도 ‘해야 한다’는 생각 때문에 계속 움직인다.',
  '열심히 살아왔는데 문득 ‘나는 어디로 가고 있지?’라는 생각이 든다.',
]

const FLOW_STEPS = [
  { hanja: '正', title: '잠시 멈추기', to: 'today' },
  { hanja: '見', title: '지금 상태 보기', to: 'emotion' },
  { hanja: '取', title: '내 마음 알아보기', to: 'emotion' },
  { hanja: '意', title: '필요한 것 고르기', to: 'emotion' },
  { hanja: '動', title: '오늘 하나 실행하기', to: 'tasks' },
  { hanja: '感', title: '해본 뒤 돌아보기', to: 'records' },
  { hanja: '億', title: '내가 향하는 방향 보기', to: 'records' },
]

const TODAY_CHOICES = [
  { label: '잠깐 쉬기', to: 'today' },
  { label: '마음 정리하기', to: 'emotion' },
  { label: '해야 할 일 줄이기', to: 'tasks' },
  { label: '결정을 조금 미루기', to: 'emotion' },
  { label: '오늘 하나 시작하기', to: 'tasks' },
]

export default function PauseChoosePage({ onNavigate }) {
  const [checked, setChecked] = useState(() => new Set())

  const toggle = (i) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="pause-page">
      <div className="card pause-section">
        <span className="title-serif">나를 끌고 가는 힘</span>
        <p className="pause-lead">
          지금 나를 움직이게 하는 것은 내 선택일 수도 있고, 오래된 습관이나 다른 사람의 기대일 수도
          있습니다. 마음에 가까운 항목을 가볍게 선택해보세요.
        </p>

        <div className="pause-checklist">
          {PULL_CHECKLIST.map((text, i) => (
            <div
              key={i}
              className={`pause-checklist-item${checked.has(i) ? ' selected' : ''}`}
              onClick={() => toggle(i)}
            >
              <span className={`checkbox${checked.has(i) ? ' checked' : ''}`}>
                {checked.has(i) && '✓'}
              </span>
              <span className="pause-checklist-text">{text}</span>
            </div>
          ))}
        </div>

        {checked.size > 0 && (
          <p className="pause-reflection">
            선택한 개수보다 중요한 것은 지금 나를 끌고 가는 힘을 알아차리는 것입니다.
          </p>
        )}

        <button className="pause-cta" type="button" onClick={() => onNavigate('emotion')}>
          마음 기록으로 이동
        </button>
      </div>

      <div className="card pause-section">
        <span className="title-serif">자기경영의 흐름</span>
        <p className="pause-lead">멈추고, 바라보고, 내 마음을 알아본 뒤 오늘 할 수 있는 것을 선택합니다.</p>

        <div className="pause-flow-grid">
          {FLOW_STEPS.map((step) => (
            <div key={step.hanja} className="pause-flow-card" onClick={() => onNavigate(step.to)}>
              <span className="pause-flow-hanja">{step.hanja}</span>
              <span className="pause-flow-title">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card pause-section">
        <span className="title-serif">지금 나에게 필요한 것</span>

        <div className="pause-choice-grid">
          {TODAY_CHOICES.map((choice) => (
            <div key={choice.label} className="pause-choice-item" onClick={() => onNavigate(choice.to)}>
              {choice.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
