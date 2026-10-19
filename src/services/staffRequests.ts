export type StaffRequestType = '정보 추가' | '정보 수정' | '오류 신고' | '기능 개선'
export type StaffRequestScreen = '호텔 업무 영어 응대' | '주변 시설 안내' | '기타'

export interface StaffRequest {
  category: StaffRequestType
  screen: StaffRequestScreen
  details: string
}

export const STAFF_REQUEST_MARKER = 'CPH_REQUEST_CONTENT_MARKER'
export const STAFF_REQUEST_MAX_LENGTH = 1000

export function isValidStaffRequest(details: string): boolean {
  const length = details.trim().length
  return length >= 10 && length <= STAFF_REQUEST_MAX_LENGTH
}

export function formatStaffRequest(request: StaffRequest): string {
  return [
    '요청 유형: ' + request.category,
    '관련 화면: ' + request.screen,
    '',
    '요청 내용:',
    request.details.trim().replace(/\r\n?/g, '\n'),
  ].join('\n')
}

/** Prefill a Google Form's paragraph response. The user must still submit on Google Forms. */
export function buildStaffRequestFormUrl(template: string, content: string): string | null {
  if (!template.trim() || !content.trim()) return null
  try {
    const url = new URL(template)
    if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com') return null
    if (!/^\/forms\/d\/(?:e\/)?[\w-]+\/viewform\/?$/.test(url.pathname)) return null
    let match: string | null = null
    let count = 0
    url.searchParams.forEach((value, key) => {
      if (/^entry\.\d+$/.test(key) && value === STAFF_REQUEST_MARKER) {
        match = key
        count += 1
      }
    })
    if (count !== 1 || match === null) return null
    url.searchParams.set(match, content)
    return url.toString()
  } catch {
    return null
  }
}
