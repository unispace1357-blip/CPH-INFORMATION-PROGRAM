const allowedHosts = new Set(['map.naver.com', 'm.map.naver.com'])
const routeModes = new Set(['walk', 'car', 'transit', 'bike', 'bicycle'])

/** Syntax and destination policy only. Staff must verify the actual hotel-to-facility route. */
export function naverMapUrlError(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string' || !value || value !== value.trim() || /[\s\\]/u.test(value)) return '공백 없는 HTTPS 네이버 지도 길찾기 URL을 입력하세요.'
  let url: URL
  try { url = new URL(value) } catch { return '올바른 URL 형식이 아닙니다.' }
  if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname) || url.port) return 'https://map.naver.com 또는 https://m.map.naver.com의 공식 최종 주소만 허용합니다. 단축 주소는 사용할 수 없습니다.'
  if (url.username || url.password || url.hash) return '사용자 정보·인증 정보·해시가 포함된 URL은 등록할 수 없습니다.'
  for (const key of url.searchParams.keys()) {
    const name = key.toLowerCase().replace(/[_-]/g, '')
    if (name.includes('token') || /password|passwd|secret|credential|authorization|apikey|session/.test(name) || ['auth', 'key', 'redirect', 'redirecturl', 'callback', 'email', 'phone'].includes(name)) return '개인정보·인증 토큰·리다이렉트 값이 포함된 URL은 등록할 수 없습니다.'
  }
  if (url.hostname === 'map.naver.com') {
    let parts: string[]
    try { parts = url.pathname.split('/').filter(Boolean).map(part => decodeURIComponent(part)) } catch { return 'URL의 경로 인코딩이 올바르지 않습니다.' }
    const point = (part: string | undefined) => !!part && /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?(?:,.*)?$/.test(part) && part.split(',').slice(0, 2).every(coordinate => Number.isFinite(Number(coordinate)))
    if (parts.length === 6 && ['p', 'v5'].includes(parts[0]!) && parts[1] === 'directions' && point(parts[2]) && point(parts[3]) && routeModes.has(parts[5]!)) return null
  } else if (url.pathname === '/route.nhn') {
    const params = new Map([...url.searchParams].map(([key, val]) => [key.toLowerCase(), val]))
    if (['sx', 'sy', 'ex', 'ey'].every(key => { const coordinate = params.get(key); return !!coordinate && /^-?\d+(?:\.\d+)?$/.test(coordinate) && Number.isFinite(Number(coordinate)) })) return null
  }
  return '출발지·도착지가 설정된 길찾기 주소만 등록하세요. 일반 지도·장소 페이지는 사용할 수 없습니다.'
}

/** Defense at the rendering boundary: an invalid or missing value never becomes a link. */
export function validatedNaverMapUrl(value: unknown): string | null {
  return typeof value === 'string' && naverMapUrlError(value) === null ? value : null
}
