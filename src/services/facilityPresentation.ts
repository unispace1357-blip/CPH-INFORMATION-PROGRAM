export function confirmedText(value: string, fallback: string): string {
  return value.trim() || fallback
}

export function formatWalkingMinutes(value: unknown): string {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? `약 도보 ${value}분`
    : '도보시간 미확인'
}

export function formatVerificationDate(value: string | null): string {
  return value === null ? '정보 확인 전' : `최종 확인: ${value}`
}
