import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import reference from '../docs/reference/step07a-approved-copy.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import type { GuideLanguage } from '../src/types/guide.ts'
import { parseHotelDataset } from '../src/data/validateHotelDataset.ts'

/** Final user instruction takes precedence over the workbook's older notes-field order. */
export const APPROVED_MAPPING = {
  name: ['H01'], address: ['H02'], checkIn: ['H04', 'H05'], checkOut: ['H06', 'H30', 'H31', 'H32'],
  breakfast: ['H07', 'H08', 'H09', 'H10', 'H11', 'H12'], parking: ['H13'],
  roomUsage: ['H14', 'H15', 'H16', 'H17', 'H18', 'H19', 'H20', 'H21', 'H22', 'H24', 'H25'],
  notes: ['H03', 'H23', 'H26', 'H27', 'H28', 'H29', 'H34', 'H35'],
} as const

export interface CopyMismatch { id: string; language?: GuideLanguage; field: string; expected: unknown; actual: unknown; reason: string }

/** Read-only comparison with the separately extracted workbook cells. No translation or repair. */
export function verifyApprovedHotel(input: unknown): CopyMismatch[] {
  const hotel = parseHotelDataset(input)
  const errors: CopyMismatch[] = []
  function compare(id: string, field: string, expected: unknown, actual: unknown, reason: string, language?: GuideLanguage) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push({ id, field, expected, actual, reason, ...(language ? { language } : {}) })
  }
  const ids = Array.from({ length: 35 }, (_, i) => `H${String(i + 1).padStart(2, '0')}`)
  compare('reference', 'recognizedIds', ids, reference.recognizedIds, 'H01–H35 recognition mismatch')
  compare('reference', 'recordIds', ids, reference.records.map(record => record.id), 'Missing or duplicate workbook record')
  compare('reference', 'mapping', APPROVED_MAPPING, reference.mapping, 'Mapping differs from the final instruction')
  compare('reference', 'excludedIds', ['H33'], reference.excludedIds, 'Public hold must stay H33')
  for (const record of reference.records) {
    for (const language of GUIDE_LANGUAGES) {
      const value = record.translations[language]
      if (!value) errors.push({ id: record.id, language, field: 'reference', expected: 'original nonempty cell', actual: value, reason: 'Missing approved language copy' })
      else compare(record.id, 'reference.sha256', record.sha256[language], createHash('sha256').update(value).digest('hex'), 'Extracted cell changed', language)
    }
  }
  for (const [field, expected] of Object.entries({ schemaVersion: 1, dataStatus: 'demo', lastVerifiedAt: '2026-10-15', checkInTime: '15:00', checkOutTime: '12:00' })) {
    compare('common', field, expected, hotel[field as keyof typeof hotel], 'Confirmed common value changed')
  }
  for (const language of GUIDE_LANGUAGES) {
    compare('description', 'description', '', hotel.translations[language].description, 'No approved description exists', language)
    for (const [field, fieldIds] of Object.entries(APPROVED_MAPPING)) {
      const actual = hotel.translations[language][field as keyof typeof APPROVED_MAPPING]
      const paragraphs = actual.split('\n\n')
      fieldIds.forEach((id, index) => compare(id, field, reference.records.find(record => record.id === id)?.translations[language], paragraphs[index], 'Approved cell missing, altered, duplicated or placed in the wrong field', language))
      compare(fieldIds.join(','), `${field}.paragraphCount`, fieldIds.length, paragraphs.length, 'Unexpected or duplicate paragraph', language)
    }
    const held = reference.records.find(record => record.id === 'H33')!.translations[language]
    compare('H33', 'translations', false, Object.values(hotel.translations[language]).some(value => value.includes(held)), 'Held copy entered customer JSON', language)
  }
  return errors
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const errors = verifyApprovedHotel(JSON.parse(readFileSync(new URL('../src/data/hotel.json', import.meta.url), 'utf8')))
    if (errors.length) { console.error(JSON.stringify(errors, null, 2)); process.exitCode = 1 }
    else console.log('PASS: H01–H35 recognized; 34 approved entries × 4 languages exactly match; H33 withheld; confirmed times/date and demo status preserved. Translator checks not performed.')
  } catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 }
}
