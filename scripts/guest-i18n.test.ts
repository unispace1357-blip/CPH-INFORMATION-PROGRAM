import assert from 'node:assert/strict'
import test from 'node:test'
import { GUIDE_LANGUAGES } from '../src/types/guide.ts'
import { FACILITY_CATEGORIES } from '../src/types/facility.ts'
import { MESSAGES } from '../src/i18n/messages.ts'
import { DEFAULT_GUEST_LANGUAGE, UI_MESSAGE_KEYS } from '../src/i18n/types.ts'
import { guestVerificationDate, guestWalkingTime, localizedValue, message } from '../src/i18n/formatters.ts'

test('guest default language is English', () => assert.equal(DEFAULT_GUEST_LANGUAGE, 'en'))
for (const language of GUIDE_LANGUAGES) {
  test(`complete nonempty UI/category/hotel translations: ${language}`, () => {
    assert.deepEqual(Object.keys(MESSAGES[language].ui), [...UI_MESSAGE_KEYS])
    assert.deepEqual(Object.keys(MESSAGES[language].categories), [...FACILITY_CATEGORIES])
    assert.deepEqual(Object.keys(MESSAGES[language].hotelCategories), ['checkIn', 'checkOut', 'breakfast', 'parking', 'roomUsage'])
    for (const group of Object.values(MESSAGES[language])) assert.ok(Object.values(group).every(value => value.trim()))
    for (const key of UI_MESSAGE_KEYS) assert.deepEqual(MESSAGES[language].ui[key].match(/\{\w+\}/g), MESSAGES.en.ui[key].match(/\{\w+\}/g))
  })
  test(`localized null/blank values do not fall back to another language: ${language}`, () => {
    for (const value of [null, undefined, '', '  ', 0]) assert.equal(localizedValue(value, language), MESSAGES[language].ui.informationUnavailable)
    assert.equal(localizedValue('  Registered QA text  ', language), 'Registered QA text')
  })
  test(`localized shared walking and verification values: ${language}`, () => {
    for (const value of [null, undefined, '5', -1, NaN, Infinity]) assert.equal(guestWalkingTime(value, language), MESSAGES[language].ui.walkingUnavailable)
    assert.equal(guestWalkingTime(5, language), message(language, 'aboutWalk', { minutes: 5 }))
    assert.equal(guestWalkingTime(0, language), message(language, 'aboutWalk', { minutes: 0 }))
    assert.equal(guestVerificationDate(null, language), MESSAGES[language].ui.verificationUnavailable)
    assert.equal(guestVerificationDate('2026-10-15', language), message(language, 'verifiedOn', { date: '2026-10-15' }))
    assert.ok(!message(language, 'resultCount', { count: 2 }).includes('{count}'))
  })
}
