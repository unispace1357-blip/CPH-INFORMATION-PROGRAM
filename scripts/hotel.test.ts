import assert from 'node:assert/strict'
import test from 'node:test'
import rawHotel from '../src/data/hotel.json' with { type: 'json' }
import schema from '../src/data/hotel.schema.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { parseHotelDataset } from '../src/data/validateHotelDataset.ts'
import { emptyGuestHotel } from './guest-test-fixtures.ts'

test('empty demo hotel information validates in all four languages', () => {
  const hotel = parseHotelDataset(emptyGuestHotel())
  assert.equal(hotel.dataStatus, 'demo')
  assert.equal(hotel.lastVerifiedAt, null)
  assert.equal(hotel.checkInTime, null)
  assert.equal(hotel.checkOutTime, null)
  assert.deepEqual(Object.keys(hotel.translations), GUIDE_LANGUAGES)
  for (const language of GUIDE_LANGUAGES) {
    assert.ok(Object.values(hotel.translations[language]).every(text => text === ''))
  }
  assert.deepEqual(schema.properties.translations.required, GUIDE_LANGUAGES)
})

test('hotel times share one value per field and accept valid HH:mm times', () => {
  const hotel = parseHotelDataset(rawHotel)
  for (const time of ['00:00', '15:00', '23:59']) {
    hotel.checkInTime = time
    hotel.checkOutTime = time
    assert.doesNotThrow(() => parseHotelDataset(hotel))
  }
})

test('hotel rejects invalid times and calendar dates', () => {
  const hotel = parseHotelDataset(rawHotel)
  for (const time of ['24:00', '12:60', '3:00', 'invalid']) {
    hotel.checkInTime = time
    assert.throws(() => parseHotelDataset(hotel), /Invalid hotel dataset/)
    hotel.checkInTime = null
    hotel.checkOutTime = time
    assert.throws(() => parseHotelDataset(hotel), /Invalid hotel dataset/)
    hotel.checkOutTime = null
  }
  for (const date of ['2026-02-29', '2026-13-01', '14/10/2026']) {
    hotel.lastVerifiedAt = date
    assert.throws(() => parseHotelDataset(hotel), /Invalid hotel dataset/)
  }
  hotel.lastVerifiedAt = '2024-02-29'
  assert.doesNotThrow(() => parseHotelDataset(hotel))
})

const invalidCases: [string, (data: Record<string, any>) => void][] = [
  ['missing Japanese translation', data => { delete data.translations.ja }],
  ['missing breakfast field', data => { delete data.translations.en.breakfast }],
  ['nonnumeric version', data => { data.schemaVersion = '1' }],
  ['unknown field', data => { data.unexpected = true }],
  ['unknown translated field', data => { data.translations.ko.unexpected = true }],
  ['missing confirmation date', data => { delete data.lastVerifiedAt }],
  ['non-string room instructions', data => { data.translations['zh-CN'].roomUsage = 123 }],
  ['unknown data status', data => { data.dataStatus = 'unknown' }],
]
for (const [name, mutate] of invalidCases) {
  test(`hotel rejects ${name}`, () => {
    const data = structuredClone(rawHotel)
    mutate(data)
    assert.throws(() => parseHotelDataset(data), /Invalid hotel dataset/)
  })
}
