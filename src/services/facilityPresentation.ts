export function confirmedText(value: string, fallback: string): string {
  return value.trim() || fallback
}

export function formatWalkingMinutes(value: unknown, distanceMeters?: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return '도보시간 미확인'
  const distance = typeof distanceMeters === 'number' && Number.isFinite(distanceMeters) && distanceMeters >= 0
    ? ` (${distanceMeters.toLocaleString('en-US')}m)` : ''
  return `약 도보 ${value}분${distance}`
}

export function formatVerificationDate(value: string | null): string {
  return value === null ? '정보 확인 전' : `최종 확인: ${value}`
}
