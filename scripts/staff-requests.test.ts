import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildStaffRequestFormUrl, formatStaffRequest, isValidStaffRequest, STAFF_REQUEST_MARKER,
} from '../src/services/staffRequests.ts'
import { STAFF_REQUEST_PREFILL_URL } from '../src/config/staffRequestForm.ts'

const template = 'https://docs.google.com/forms/d/e/1FAIpQLTest/viewform?usp=pp_url&entry.123456=' + STAFF_REQUEST_MARKER

test('staff requests are validated, formatted, and do not invent an identity field', () => {
  assert.equal(isValidStaffRequest('  short  '), false)
  assert.equal(isValidStaffRequest('1234567890'), true)
  assert.equal(isValidStaffRequest('a'.repeat(1001)), false)
  const content = formatStaffRequest({ category: '정보 수정', screen: '주변 시설 안내', details: '  세탁소 위치를 수정해 주세요.\r\n정확한 장소명 확인 필요  ' })
  assert.match(content, /요청 유형: 정보 수정/)
  assert.match(content, /관련 화면: 주변 시설 안내/)
  assert.match(content, /세탁소 위치를 수정해 주세요.\n정확한 장소명 확인 필요/)
  assert.doesNotMatch(content, /직원 이름|고객 이름|객실번호|전화번호/)
})

test('only a Google responder prefill link with one exact marker enables form handoff', () => {
  const body = '요청 유형: 정보 추가\n요청 내용: 사진이 잘립니다.'
  const result = buildStaffRequestFormUrl(template, body)
  assert.ok(result)
  const url = new URL(result)
  assert.equal(url.searchParams.get('entry.123456'), body)
  assert.equal(url.searchParams.get('usp'), 'pp_url')
  assert.equal(buildStaffRequestFormUrl('', body), null)
  assert.equal(buildStaffRequestFormUrl(template, ''), null)
  assert.equal(buildStaffRequestFormUrl('http://docs.google.com/forms/d/e/abc/viewform?entry.1=' + STAFF_REQUEST_MARKER, body), null)
  assert.equal(buildStaffRequestFormUrl('https://docs.google.com.evil.example/forms/d/e/abc/viewform?entry.1=' + STAFF_REQUEST_MARKER, body), null)
  assert.equal(buildStaffRequestFormUrl('https://docs.google.com/forms/d/e/abc/edit?entry.1=' + STAFF_REQUEST_MARKER, body), null)
  assert.equal(buildStaffRequestFormUrl('https://forms.gle/anything', body), null)
  assert.equal(buildStaffRequestFormUrl('https://docs.google.com/forms/d/e/abc/viewform', body), null)
  assert.equal(buildStaffRequestFormUrl('https://docs.google.com/forms/d/e/abc/viewform?entry.1=wrong', body), null)
  assert.equal(buildStaffRequestFormUrl('https://docs.google.com/forms/d/e/abc/viewform?entry.1=' + STAFF_REQUEST_MARKER + '&entry.2=' + STAFF_REQUEST_MARKER, body), null)
})


test('connected CPH responder link pre-fills only the request content field safely', () => {
  const request = formatStaffRequest({
    category: '정보 추가',
    screen: '주변 시설 안내',
    details: '세탁소 정보를 추가해 주세요.',
  })
  const result = buildStaffRequestFormUrl(STAFF_REQUEST_PREFILL_URL, request)
  assert.ok(result, 'Google Forms responder link must be valid')
  const url = new URL(result)
  assert.equal(url.origin, 'https://docs.google.com')
  assert.equal(url.searchParams.get('usp'), 'pp_url')
  assert.equal(url.searchParams.get('entry.1268471161'), request)
  assert.equal(url.searchParams.get('entry.1268471161')?.includes(STAFF_REQUEST_MARKER), false)
  assert.equal([...url.searchParams.keys()].filter(k => /^entry\.\d+$/.test(k)).length, 1)
})
