import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import reference from '../docs/reference/step07a-approved-copy.json' with { type: 'json' }
import amendments from '../docs/reference/step2-operational-amendments.json' with { type: 'json' }
import updates from '../docs/reference/step1-info-accuracy-20261025.json' with { type: 'json' }
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
  // Preserve historical workbook hashes; separately record later operational updates.
  compare('amendments', 'schemaVersion', 1, amendments.schemaVersion, 'Unexpected amendment schema')
  compare('amendments', 'effectiveDate', '2026-10-19', amendments.effectiveDate, 'Unexpected amendment date')
  compare('amendments', 'replacementIds', ['H19', 'H20'], Object.keys(amendments.replacements).sort(), 'Only delivery paragraphs may be replaced')
  compare('updates', 'schemaVersion', 1, updates.schemaVersion, 'Unexpected accuracy amendment schema')
  compare('updates', 'effectiveDate', '2026-10-25', updates.effectiveDate, 'Unexpected accuracy amendment date')
  compare('updates', 'removedIds', ['H05'], updates.removedIds, 'Only obsolete check-in H05 may be removed')
  compare('updates', 'replacementIds', ['H10', 'H15'], Object.keys(updates.replacements).sort(), 'Only confirmed information fields may change')
  for (const id of ['H10', 'H15'] as const) {
    compare(id, 'replacementLanguages', [...GUIDE_LANGUAGES], Object.keys(updates.replacements[id]), 'All four languages must be supplied')
    for (const language of GUIDE_LANGUAGES) {
      if (!updates.replacements[id][language]?.trim()) errors.push({ id, language, field: 'replacement', expected: 'nonblank', actual: updates.replacements[id][language], reason: 'Blank operational update' })
    }
  }
  for (const language of GUIDE_LANGUAGES) {
    if (!updates.additions.roomUsage[language]?.trim()) errors.push({ id: 'bedside-light-switch', language, field: 'addition', expected: 'nonblank', actual: updates.additions.roomUsage[language], reason: 'Blank bedside lights instructions' })
  }
  for (const id of ['H19', 'H20'] as const) {
    compare(id, 'replacementLanguages', [...GUIDE_LANGUAGES], Object.keys(amendments.replacements[id]), 'All four languages must be provided')
    for (const language of GUIDE_LANGUAGES) {
      if (!amendments.replacements[id][language]?.trim()) errors.push({ id, field: 'amendment', language, expected: 'nonblank', actual: amendments.replacements[id][language], reason: 'Blank operational update' })
    }
  }
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
      const expected = fieldIds.filter(id => !updates.removedIds.includes(id as 'H05')).map(id => {
        const updated = (updates.replacements as Record<string, Record<GuideLanguage, string>>)[id]
        const delivery = (amendments.replacements as Record<string, Record<GuideLanguage, string>>)[id]
        return { id: id as string, text: updated?.[language] ?? delivery?.[language] ?? reference.records.find(record => record.id === id)?.translations[language] }
      })
      if (field === 'roomUsage') expected.push({ id: 'bedside-light-switch', text: updates.additions.roomUsage[language] })
      expected.forEach((item, index) => compare(item.id, field, item.text, paragraphs[index], 'Approved or documented updated paragraph missing, altered, duplicated or misplaced', language))
      compare(fieldIds.join(','), `${field}.paragraphCount`, expected.length, paragraphs.length, 'Unexpected or duplicate paragraph', language)
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
    else console.log('PASS: historical H01–H35 hashes intact; dated delivery and accuracy overrides checked in four languages; H33 withheld.')
  } catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 }
}
