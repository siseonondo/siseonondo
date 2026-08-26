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
  {
    hanja: '正',
    title: '잠시 멈추기',
    desc: '하던 일을 잠시 멈추고 지금의 상태를 확인합니다. 바로 답을 내리거나 행동하기 전에, 무엇이 나를 움직이고 있는지 볼 수 있는 자리를 만듭니다.',
  },
  {
    hanja: '見',
    title: '지금 상태 보기',
    desc: '좋고 나쁨을 판단하기 전에 현재의 감정과 생각, 상황을 그대로 살펴봅니다. 지금 무엇이 힘들고 무엇이 마음에 남아 있는지 알아차리는 단계입니다.',
  },
  {
    hanja: '取',
    title: '내 마음 알아보기',
    desc: '겉으로 드러난 감정 아래에 어떤 마음이 있는지 살펴봅니다. 다른 사람의 기대와 내 마음을 구분하고, 지금 내가 무엇을 바라고 있는지 알아봅니다.',
  },
  {
    hanja: '意',
    title: '필요한 것 고르기',
    desc: '여러 생각과 마음 가운데 지금 나에게 중요한 것을 선택합니다. 무엇을 더 해야 하는지가 아니라, 지금 무엇이 필요한지를 정하는 단계입니다.',
  },
  {
    hanja: '動',
    title: '오늘 하나 실행하기',
    desc: '선택한 것을 오늘 할 수 있는 작은 행동으로 옮깁니다. 완벽한 계획보다 지금 가능한 한 가지를 시작합니다.',
  },
  {
    hanja: '感',
    title: '나의 감각 살피기',
    desc: '호흡, 긴장, 피로, 편안함처럼 지금 느껴지는 몸의 감각을 가만히 살펴봅니다. 그 감각을 통해 나의 속도와 지금 상태를 알아차리는 단계입니다.',
  },
  {
    hanja: '億',
    title: '내가 향하는 방향 보기',
    desc: '오늘까지의 작은 선택들을 돌아봅니다. 내가 자주 중요하게 여겨온 것과, 앞으로 지키고 싶은 방향을 확인하는 단계입니다.',
  },
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
  const [activeStep, setActiveStep] = useState(0)

  const toggle = (i) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const currentStep = FLOW_STEPS[activeStep]
  const stepTotal = String(FLOW_STEPS.length).padStart(2, '0')
  const isFirstStep = activeStep === 0
  const isLastStep = activeStep === FLOW_STEPS.length - 1

  const goPrevStep = () => setActiveStep((i) => Math.max(0, i - 1))
  const goNextStep = () => setActiveStep((i) => Math.min(FLOW_STEPS.length - 1, i + 1))

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
            <button
              key={i}
              type="button"
              className={`pause-checklist-item${checked.has(i) ? ' selected' : ''}`}
              onClick={() => toggle(i)}
              aria-pressed={checked.has(i)}
            >
              <span className={`checkbox${checked.has(i) ? ' checked' : ''}`}>
                {checked.has(i) && '✓'}
              </span>
              <span className="pause-checklist-text">{text}</span>
            </button>
          ))}
        </div>

        {checked.size > 0 && (
          <p className="pause-reflection">
            선택한 개수보다 중요한 것은 지금 나를 끌고 가는 힘을 알아차린 것입니다. 마음에 남는 한 가지를
            조금 더 살펴보세요.
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
          {FLOW_STEPS.map((step, i) => (
            <button
              key={step.hanja}
              type="button"
              className={`pause-flow-card${i === activeStep ? ' selected' : ''}`}
              onClick={() => setActiveStep(i)}
              aria-pressed={i === activeStep}
            >
              <span className="pause-flow-hanja">{step.hanja}</span>
              <span className="pause-flow-title">{step.title}</span>
            </button>
          ))}
        </div>

        <div className="pause-flow-detail">
          <div className="pause-flow-detail-head">
            <span className="pause-flow-detail-title">
              <span className="pause-flow-detail-hanja">{currentStep.hanja}</span> · {currentStep.title}
            </span>
            <span className="pause-flow-detail-index">
              {String(activeStep + 1).padStart(2, '0')} / {stepTotal}
            </span>
          </div>

          <p className="pause-flow-detail-desc">{currentStep.desc}</p>

          <div className="pause-flow-detail-nav">
            <button
              type="button"
              className="pause-flow-nav-btn"
              onClick={goPrevStep}
              disabled={isFirstStep}
            >
              이전 단계
            </button>
            <button
              type="button"
              className="pause-flow-nav-btn"
              onClick={goNextStep}
              disabled={isLastStep}
            >
              다음 단계
            </button>
          </div>
        </div>
      </div>

      <div className="card pause-section">
        <span className="title-serif">지금 나에게 필요한 것</span>

        <div className="pause-choice-grid">
          {TODAY_CHOICES.map((choice) => (
            <button
              key={choice.label}
              type="button"
              className="pause-choice-item"
              onClick={() => onNavigate(choice.to)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
