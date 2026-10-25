import assert from 'node:assert/strict'
import test from 'node:test'
import raw from '../src/data/facilities.json' with {type:'json'}
import { parseFacilityDataset } from '../src/data/validateFacilityDataset.ts'
import { makeRouteQr } from '../src/services/routeQr.ts'
import { validatedNaverMapUrl } from '../src/services/naverMapUrl.ts'

test('valid saved Naver routes create an offline printable matrix without external image URLs',()=>{
  const facilities=parseFacilityDataset(raw).facilities
  const links=facilities.map(x=>x.naverMapUrl).filter((url):url is string=>!!validatedNaverMapUrl(url))
  assert.ok(links.length>5)
  for(const url of links){
    const qr=makeRouteQr(url)
    assert.ok(qr,'QR not generated for '+url.slice(0,100))
    assert.equal(qr.url,url)
    assert.ok(qr.count>=21 && qr.count<=177)
    assert.match(qr.path,/^M\d+ \d+h1v1h-1z/)
    assert.equal(qr.viewBox,'0 0 '+(qr.count+8)+' '+(qr.count+8))
  }
})

test('unapproved or absent routes never generate a QR',()=>{
  for(const value of [null,undefined,'','http://map.naver.com','https://example.com','javascript:alert(1)','https://map.naver.com/p/invalid']){
    assert.equal(makeRouteQr(value),null)
  }
})
