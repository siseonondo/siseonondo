const SEOUL_LABEL_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

const SEOUL_PARTS_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const SEOUL_TIME_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

// 타임존을 지정하지 않아 사용자의 현재 브라우저(로컬) 시간대를 기준으로 표시합니다.
const LOCAL_TIME_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function getTodaySeoulLabel() {
  return SEOUL_LABEL_FORMATTER.format(new Date())
}

export function getNowSeoulTimeLabel() {
  return SEOUL_TIME_FORMATTER.format(new Date())
}

export function formatLocalTimeLabel(date) {
  return LOCAL_TIME_FORMATTER.format(date)
}

export function getTodaySeoulDate() {
  const parts = SEOUL_PARTS_FORMATTER.formatToParts(new Date())
  const get = (type) => Number(parts.find((p) => p.type === type).value)
  return new Date(get('year'), get('month') - 1, get('day'))
}
