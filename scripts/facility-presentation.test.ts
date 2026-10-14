import assert from 'node:assert/strict'
import test from 'node:test'
import { confirmedText, formatWalkingMinutes, formatVerificationDate } from '../src/services/facilityPresentation.ts'

test('missing/blank operating information stays unconfirmed rather than invented', () => {
  assert.equal(confirmedText('', '영업시간 미확인'), '영업시간 미확인')
  assert.equal(confirmedText(' \n', '주소 미확인'), '주소 미확인')
  assert.equal(confirmedText('  Fictional registered text  ', '미확인'), 'Fictional registered text')
})

test('registered numeric walking times are displayed directly, including zero and fractions', () => {
  assert.equal(formatWalkingMinutes(5), '약 도보 5분')
  assert.equal(formatWalkingMinutes(10), '약 도보 10분')
  assert.equal(formatWalkingMinutes(0), '약 도보 0분')
  assert.equal(formatWalkingMinutes(7.5), '약 도보 7.5분')
})

test('null, nonnumeric and invalid walking times are never calculated or coerced', () => {
  for (const value of [null, undefined, '5', -1, NaN, Infinity]) assert.equal(formatWalkingMinutes(value), '도보시간 미확인')
})

test('verification dates display confirmation only, without an operating-status claim', () => {
  assert.equal(formatVerificationDate(null), '정보 확인 전')
  assert.equal(formatVerificationDate('2026-10-15'), '최종 확인: 2026-10-15')
})
