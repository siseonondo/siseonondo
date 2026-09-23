// 로그인 없이 사용하는 기록을 이 브라우저의 localStorage에만 저장합니다.
// 서버로 전송하지 않으며, 다른 기기·브라우저와 동기화되지 않습니다.
const STORAGE_KEY = 'siseonondo_guest_v1'
const STORAGE_VERSION = 1

function emptyState() {
  return {
    version: STORAGE_VERSION,
    condition: null, // 아직 아무 컨디션도 선택하지 않은 상태
    tasks: [],
    emotions: [],
    savedQuotes: {},
  }
}

let cachedAvailability = null

export function isGuestStorageAvailable() {
  if (cachedAvailability !== null) return cachedAvailability
  try {
    const testKey = '__siseonondo_storage_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    cachedAvailability = true
  } catch {
    cachedAvailability = false
  }
  return cachedAvailability
}

export function loadGuestState() {
  if (!isGuestStorageAvailable()) return emptyState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== STORAGE_VERSION) return emptyState()
    return { ...emptyState(), ...parsed }
  } catch {
    return emptyState()
  }
}

// 항상 최신 상태를 다시 읽은 뒤 patch를 얹어 저장합니다 — 같은 화면에서 여러 기능(컨디션/할 일/감정 등)이
// 번갈아 저장해도 서로 덮어쓰지 않도록 하기 위해서입니다.
export function saveGuestState(patch) {
  if (!isGuestStorageAvailable()) return false
  try {
    const current = loadGuestState()
    const next = { ...current, ...patch, version: STORAGE_VERSION }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}
