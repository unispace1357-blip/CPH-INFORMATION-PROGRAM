import assert from 'node:assert/strict'
import test from 'node:test'
import rawFacilities from '../src/data/facilities.json' with { type: 'json' }
import rawHotel from '../src/data/hotel.json' with { type: 'json' }
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { parseHotelDataset } from '../src/data/validateHotelDataset.ts'
import { validateProductionData } from '../src/data/validateProductionData.ts'

const today = '2026-10-14'

/** Synthetic production-shaped inputs only; never written to the hotel JSON files. */
function completeInputs() {
  const facilities = parseFacilityDataset(rawFacilities)
  const hotel = parseHotelDataset(rawHotel)
  facilities.dataStatus = 'production'
  hotel.dataStatus = 'production'
  for (const facility of facilities.facilities) {
    facility.lastVerifiedAt = today
    for (const language of GUIDE_LANGUAGES) {
      facility.translations[language].address = 'Fictional test address'
      facility.translations[language].openingHours = 'Fictional test hours'
      facility.translations[language].directions = 'Fictional test directions'
      facility.closedDays[language] = 'Fictional test closure rule'
    }
  }
  hotel.lastVerifiedAt = today
  hotel.checkInTime = '15:00'
  hotel.checkOutTime = '11:00'
  for (const language of GUIDE_LANGUAGES) {
    for (const field of Object.keys(hotel.translations[language]) as (keyof typeof hotel.translations.ko)[]) {
      hotel.translations[language][field] = `Fictional test ${field}; not operational data`
    }
  }
  return { facilities, hotel }
}

test('complete synthetic production-shaped inputs pass without altering source data', () => {
  const { facilities, hotel } = completeInputs()
  const before = structuredClone({ facilities, hotel })
  assert.doesNotThrow(() => validateProductionData(facilities, hotel, today))
  assert.deepEqual({ facilities, hotel }, before)
  assert.equal(rawFacilities.dataStatus, 'demo')
  assert.equal(rawHotel.dataStatus, 'demo')
})

test('both demo datasets are rejected by production validation', () => {
  assert.throws(() => validateProductionData(rawFacilities, rawHotel, today), /dataStatus must be production/)
})

test('a demo facility dataset is blocked even with a complete production hotel', () => {
  const { hotel } = completeInputs()
  assert.throws(() => validateProductionData(rawFacilities, hotel, today), /Facilities dataStatus must be production/)
})

test('a demo hotel dataset is blocked even with complete production facilities', () => {
  const { facilities } = completeInputs()
  assert.throws(() => validateProductionData(facilities, rawHotel, today), /Hotel dataStatus must be production/)
})

test('changing demo flags alone does not satisfy production readiness', () => {
  const facilities = parseFacilityDataset(rawFacilities)
  const hotel = parseHotelDataset(rawHotel)
  facilities.dataStatus = 'production'
  hotel.dataStatus = 'production'
  assert.throws(() => validateProductionData(facilities, hotel, today), /lastVerifiedAt is required/)
})

for (const field of ['name', 'description', 'address', 'openingHours', 'directions'] as const) {
  test(`production public facilities require ${field} in every language`, () => {
    for (const language of GUIDE_LANGUAGES) {
      const { facilities, hotel } = completeInputs()
      facilities.facilities[0]!.translations[language][field] = '  '
      assert.throws(() => validateProductionData(facilities, hotel, today))
    }
  })
}

test('production public facilities require translated closure information', () => {
  for (const language of GUIDE_LANGUAGES) {
    const { facilities, hotel } = completeInputs()
    facilities.facilities[0]!.closedDays[language] = '  '
    assert.throws(() => validateProductionData(facilities, hotel, today), /closedDays/)
  }
})

test('public facilities require a confirmed date no later than today', () => {
  const { facilities, hotel } = completeInputs()
  const facility = facilities.facilities[0]!
  facility.lastVerifiedAt = null
  assert.throws(() => validateProductionData(facilities, hotel, today), /lastVerifiedAt is required/)
  facility.lastVerifiedAt = '2026-10-15'
  assert.throws(() => validateProductionData(facilities, hotel, today), /cannot be in the future/)
  facility.lastVerifiedAt = '2024-02-29'
  assert.doesNotThrow(() => validateProductionData(facilities, hotel, today))
})

test('unpublished facilities still validate structurally but may have unconfirmed details', () => {
  const { facilities, hotel } = completeInputs()
  const facility = facilities.facilities[0]!
  facility.isPublished = false
  facility.lastVerifiedAt = null
  facility.translations.en.address = ''
  facility.closedDays.ja = ''
  assert.doesNotThrow(() => validateProductionData(facilities, hotel, today))
  facility.category = 'invalid' as typeof facility.category
  assert.throws(() => validateProductionData(facilities, hotel, today), /Invalid facility dataset/)
})

test('unknown walking minutes remain allowed in production without inventing an estimate', () => {
  const { facilities, hotel } = completeInputs()
  facilities.facilities[0]!.walkingMinutes = null
  assert.doesNotThrow(() => validateProductionData(facilities, hotel, today))
})

test('legacy production public facilities cannot bypass new mandatory closure information', () => {
  const { facilities, hotel } = completeInputs()
  const legacy = JSON.parse(JSON.stringify(facilities)) as Record<string, any>
  delete legacy.facilities[0].closedDays
  assert.throws(() => validateProductionData(legacy, hotel, today), /closedDays/)
})

test('the production hotel requires its confirmation date and both shared check-in/out times', () => {
  const { facilities, hotel } = completeInputs()
  hotel.lastVerifiedAt = null
  assert.throws(() => validateProductionData(facilities, hotel, today), /hotel.lastVerifiedAt is required/)
  hotel.lastVerifiedAt = '2026-10-15'
  assert.throws(() => validateProductionData(facilities, hotel, today), /cannot be in the future/)
  hotel.lastVerifiedAt = today
  hotel.checkInTime = null
  assert.throws(() => validateProductionData(facilities, hotel, today), /hotel.checkInTime/)
  hotel.checkInTime = '15:00'
  hotel.checkOutTime = null
  assert.throws(() => validateProductionData(facilities, hotel, today), /hotel.checkOutTime/)
})

for (const field of ['name', 'description', 'address', 'checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage'] as const) {
  test(`the production hotel requires ${field} in every language`, () => {
    for (const language of GUIDE_LANGUAGES) {
      const { facilities, hotel } = completeInputs()
      hotel.translations[language][field] = '  '
      assert.throws(() => validateProductionData(facilities, hotel, today), new RegExp(`hotel.translations.${language}.${field}`))
    }
  })
}
