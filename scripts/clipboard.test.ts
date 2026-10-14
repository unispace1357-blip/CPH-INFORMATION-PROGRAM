import assert from 'node:assert/strict'
import test from 'node:test'
import { copyText, joinEnglishPhrases } from '../src/services/clipboard.ts'
import type { ClipboardWriter } from '../src/services/clipboard.ts'

test('individual phrase copy writes the exact registered text and reports success', async () => {
  const clipboard = { writes: [] as string[], async writeText(text: string) { this.writes.push(text) } }
  assert.equal(await copyText('Fictional QA phrase.', clipboard), 'success')
  assert.deepEqual(clipboard.writes, ['Fictional QA phrase.'])
})

test('zero, one and multiple phrases preserve order without generated additions', () => {
  assert.equal(joinEnglishPhrases([]), '')
  assert.equal(joinEnglishPhrases(['First QA phrase.']), 'First QA phrase.')
  assert.equal(joinEnglishPhrases(['First QA phrase.', 'Second QA phrase.']), 'First QA phrase.\nSecond QA phrase.')
})

test('whole phrase copy writes all sentences separated by newlines', async () => {
  let written = ''
  assert.equal(await copyText(joinEnglishPhrases(['First.', 'Second.']), { async writeText(text) { written = text } }), 'success')
  assert.equal(written, 'First.\nSecond.')
})

test('empty phrases never write to the clipboard', async () => {
  let writes = 0
  for (const value of ['', ' \n']) assert.equal(await copyText(value, { async writeText() { writes++ } }), 'empty')
  assert.equal(writes, 0)
})

test('unavailable clipboard is reported without throwing', async () => {
  assert.equal(await copyText('QA phrase', null), 'unavailable')
})

test('denied clipboard permission is reported without throwing', async () => {
  assert.equal(await copyText('QA phrase', { async writeText() { throw new DOMException('Denied', 'NotAllowedError') } }), 'failed')
})

test('other clipboard failures also return a safe failure result', async () => {
  assert.equal(await copyText('QA phrase', { async writeText() { throw new Error('Unavailable writer') } }), 'failed')
  const broken = Object.defineProperty({}, 'writeText', { get() { throw new Error('Access denied') } }) as ClipboardWriter
  assert.equal(await copyText('QA phrase', broken), 'failed')
})
