import assert from 'node:assert/strict'
import test from 'node:test'
import { MAX_FAVORITES, MAX_RECENT, STAFF_SHORTCUTS_KEY, parseStaffShortcuts, readStaffShortcuts, writeStaffShortcuts, recordRecent, toggleFavorite, isFavorite } from '../src/services/staffShortcuts.ts'
import type { Shortcut, StaffShortcutsData } from '../src/services/staffShortcuts.ts'

const place=(n:number):Shortcut=>({kind:'facility',id:'place-'+n})
const blank:StaffShortcutsData={favorites:[],recent:[]}

test('exactly six favorites, no duplicates, reversible toggles',()=>{
  let value=blank
  for(let i=0;i<MAX_FAVORITES;i++) value=toggleFavorite(value,place(i))
  assert.equal(value.favorites.length,6)
  value=toggleFavorite(value,place(9))
  assert.equal(value.favorites.length,6)
  assert.equal(isFavorite(value,place(9)),false)
  value=toggleFavorite(value,place(2))
  assert.equal(isFavorite(value,place(2)),false)
  value=toggleFavorite(value,place(9))
  assert.equal(value.favorites.length,6)
  assert.equal(isFavorite(value,place(9)),true)
  assert.deepEqual(blank,{favorites:[],recent:[]})
})

test('five recently opened records in newest-first order; no raw text',()=>{
  let value=blank
  for(let i=0;i<10;i++) value=recordRecent(value,place(i))
  assert.deepEqual(value.recent.map(x=>x.id),['place-9','place-8','place-7','place-6','place-5'])
  value=recordRecent(value,place(7))
  assert.deepEqual(value.recent.map(x=>x.id),['place-7','place-9','place-8','place-6','place-5'])
  assert.equal(value.recent.length,MAX_RECENT)
  value=recordRecent(value,{kind:'script',id:'check-in-time'})
  assert.equal(value.recent[0]?.kind,'script')
})

test('local storage roundtrip sanitizes malformed entries, failures never crash',()=>{
  const storage=new Map<string,string>()
  const mock={
    getItem:(name:string)=>storage.get(name)??null,
    setItem:(name:string,value:string)=>{storage.set(name,value)},
  }
  const value:StaffShortcutsData={favorites:[{kind:'tenant',id:'hanmaeum'}],recent:[{kind:'script',id:'check-in-time'}]}
  assert.equal(writeStaffShortcuts(value,mock),true)
  assert.deepEqual(readStaffShortcuts(mock),value)
  assert.ok(storage.has(STAFF_SHORTCUTS_KEY))
  storage.set(STAFF_SHORTCUTS_KEY,JSON.stringify({favorites:[{kind:'facility',id:'abc'},{kind:'facility',id:'abc'},{kind:'script',id:'bad!'},null],recent:['raw search',{kind:'tenant',id:'hanmaeum'}]}))
  assert.deepEqual(readStaffShortcuts(mock),{favorites:[{kind:'facility',id:'abc'}],recent:[{kind:'tenant',id:'hanmaeum'}]})
  storage.set(STAFF_SHORTCUTS_KEY,'invalid JSON')
  assert.deepEqual(readStaffShortcuts(mock),blank)
  assert.equal(writeStaffShortcuts(value,{setItem:()=>{throw new Error('blocked')}}),false)
  assert.deepEqual(readStaffShortcuts({getItem:()=>{throw new Error('blocked')}}),blank)
})
