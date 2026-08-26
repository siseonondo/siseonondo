export const APP_TODAY = new Date(2026, 7, 25)

function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const diff = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - diff)
  return d
}

function parseISODate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  return d
}

export function bucketForDate(dateStr) {
  if (!dateStr) return 'later'
  const d = parseISODate(dateStr)
  const today = new Date(APP_TODAY)
  today.setHours(0, 0, 0, 0)
  if (d.getTime() === today.getTime()) return 'today'
  const weekStart = startOfWeek(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  if (d >= weekStart && d <= weekEnd) return 'week'
  return 'later'
}

export function formatDateLabel(dateStr) {
  if (!dateStr) return null
  const d = parseISODate(dateStr)
  const today = new Date(APP_TODAY)
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  let prefix = ''
  if (d.getTime() === today.getTime()) prefix = '오늘 · '
  else if (d.getTime() === tomorrow.getTime()) prefix = '내일 · '
  return `${prefix}${d.getMonth() + 1}월 ${d.getDate()}일`
}

export const initialTasks = [
  { id: 't1', title: '기획서 3장 마무리', date: '2026-08-25', note: '', done: false },
  { id: 't2', title: '병원 예약 전화', date: '2026-08-25', note: '', done: false },
  { id: 't3', title: '계약서 검토 회신', date: '2026-08-26', note: '', done: false },
  { id: 't4', title: '이사 견적 알아보기', date: null, note: '', done: false },
  { id: 't5', title: '장보기 목록 정리', date: '2026-08-25', note: '', done: true },
].map((t) => ({ ...t, bucket: bucketForDate(t.date), dateLabel: formatDateLabel(t.date) }))

export const TASK_BUCKETS = [
  { key: 'today', label: '오늘 할 일' },
  { key: 'week', label: '이번 주 할 일' },
  { key: 'later', label: '나중 할 일' },
]

export const todaySchedule = [
  { id: 's1', time: '10:00', title: '팀 위클리 싱크', place: '회의실 A', done: true },
  { id: 's2', time: '14:30', title: '디자인 리뷰', place: null, soon: true },
  { id: 's3', time: '19:00', title: '요가 클래스', place: '스튜디오' },
]

export const weekSchedule = {
  days: [
    { label: '월', date: 24 },
    { label: '화', date: 25, active: true },
    { label: '수', date: 26 },
    { label: '목', date: 27 },
    { label: '금', date: 28 },
    { label: '토', date: 29, weekend: true },
    { label: '일', date: 30, weekend: true },
  ],
  rows: [
    { time: '09:00', cells: [null, null, { title: '주간 리포트' }, null, null, null, null] },
    { time: '10:00', cells: [{ title: '1:1' }, { title: '팀 위클리 싱크' }, null, null, { title: '회고' }, null, null] },
    { time: '12:00', cells: [null, null, null, { title: '점심 약속' }, null, null, null] },
    { time: '14:00', cells: [null, { title: '디자인 리뷰', accent: true }, null, null, null, null, null] },
    { time: '16:00', cells: [null, null, null, { title: '치과' }, null, null, null] },
    { time: '19:00', cells: [null, { title: '요가 클래스' }, null, null, { title: '저녁 모임' }, null, null] },
  ],
}

export const todayEmotions = [
  { id: 'e1', tag: '불안', color: 'blue', time: '09:20', situation: '리뷰 준비가 덜 끝난 게 신경 쓰였다', need: '기다림', intensity: 3, area: '일' },
  { id: 'e2', tag: '안도', color: 'green', time: '14:05', situation: '걱정한 만큼은 아니었다', need: '혼자 있는 시간', intensity: 2, area: '나 자신' },
]

export const emotionOptions = ['기쁨', '불안', '짜증', '무기력', '평온']
export const areaOptions = ['일', '관계', '가족', '건강', '돈', '미래', '나 자신']
export const needOptions = ['휴식', '대화', '혼자 있는 시간', '도움', '용기', '기다림']

export const conditionLabels = { 1: '많이 지침', 2: '지침', 3: '보통', 4: '괜찮음', 5: '가벼움' }

export const conditionHistory = [
  { day: 19, level: 2 },
  { day: 20, level: 3 },
  { day: 21, level: 1.5 },
  { day: 22, level: 4 },
  { day: 23, level: 2.7 },
  { day: 24, level: 2.2 },
  { day: 25, level: 3, active: true },
]

export const dayRecord = {
  dateLabel: '8월 25일 화요일',
  conditions: [
    { time: '09:10', label: conditionLabels[2] },
    { time: '14:20', label: conditionLabels[3] },
  ],
  selfcare: { label: '산책 · 완료' },
  emotions: todayEmotions,
  tasks: initialTasks.filter((t) => t.dateLabel === '오늘 · 8월 25일'),
  schedule: todaySchedule,
}

export const recordedDays = new Set([1, 3, 4, 5, 7, 8, 11, 12, 13, 15, 16, 18, 19, 20, 21, 23, 24, 25])

export const monthEventDays = new Set([1, 3, 4, 8, 10, 13, 17, 20, 24, 25, 26, 27, 28])
export const taskDoneDays = new Set([1, 4, 8, 13, 19, 20, 25])
export const moodDays = new Set([1, 3, 8, 13, 20, 24, 25])
