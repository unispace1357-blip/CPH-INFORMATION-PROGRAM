import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
const { createAdminAuth, validPassword } = createRequire(import.meta.url)('../desktop/admin-auth.cjs')

test('Windows admin credentials require a long mixed passphrase and store only salted scrypt hash',()=>{
  const dir=mkdtempSync(join(tmpdir(),'cph-admin-test-'))
  try{
    const file=join(dir,'credentials.json')
    const auth=createAdminAuth(file)
    assert.deepEqual(auth.status(),{ready:true,configured:false,lockedSeconds:0})
    assert.equal(validPassword('short123'),false)
    assert.equal(validPassword('a'.repeat(25)),false)
    assert.equal(validPassword('long-passphrase123'),true)
    assert.equal(auth.setup('short123','short123').ok,false)
    assert.equal(auth.setup('long-passphrase123','different').ok,false)
    assert.equal(auth.setup('long-passphrase123','long-passphrase123').ok,true)
    const serialized=readFileSync(file,'utf8')
    assert.ok(!serialized.includes('long-passphrase123'))
    assert.match(serialized,/"hash":"[0-9a-f]{128}"/)
    assert.match(serialized,/"salt":"[0-9a-f]{32}"/)
    assert.equal(auth.status().configured,true)
    assert.equal(auth.setup('another-passphrase123','another-passphrase123').ok,false)
    assert.equal(auth.verify('incorrect-passphrase123').ok,false)
    assert.equal(auth.verify('long-passphrase123').ok,true)
  }finally{rmSync(dir,{recursive:true,force:true})}
})

test('5 failed admin attempts lock entry for 15 min, password unlocks afterward',()=>{
  const dir=mkdtempSync(join(tmpdir(),'cph-admin-lock-'))
  try{
    let clock=10000
    const auth=createAdminAuth(join(dir,'auth.json'),{now:()=>clock})
    assert.equal(auth.setup('different-password123','different-password123').ok,true)
    for(let i=0;i<4;i++)assert.equal(auth.verify('wrong123').ok,false)
    const fifth=auth.verify('wrong123')
    assert.equal(fifth.ok,false)
    assert.equal(fifth.lockedSeconds,900)
    assert.equal(auth.status().lockedSeconds,900)
    assert.equal(auth.verify('different-password123').ok,false)
    const restarted=createAdminAuth(join(dir,'auth.json'),{now:()=>clock})
    assert.equal(restarted.status().lockedSeconds,900)
    assert.equal(restarted.verify('different-password123').ok,false)
    clock+=15*60*1000
    assert.equal(restarted.verify('different-password123').ok,true)
    assert.equal(restarted.status().lockedSeconds,0)
  }finally{rmSync(dir,{recursive:true,force:true})}
})

test('malformed credential file fails closed; it cannot be reset from the UI',()=>{
  const dir=mkdtempSync(join(tmpdir(),'cph-admin-corrupt-'))
  try{
    const path=join(dir,'auth.json')
    writeFileSync(path,'{"version":1,"hash":"oops","salt":"oops"}')
    const auth=createAdminAuth(path)
    assert.equal(auth.status().ready,false)
    assert.equal(auth.status().configured,true)
    assert.equal(auth.setup('different-password123','different-password123').ok,false)
    assert.equal(auth.verify('different-password123').ok,false)
  }finally{rmSync(dir,{recursive:true,force:true})}
})

test('desktop package includes separate admin files, public build excludes admin code',()=>{
  const fs=createRequire(import.meta.url)('node:fs')
  const root=new URL('../',import.meta.url)
  const script=fs.readFileSync(new URL('scripts/package-desktop.mjs',root),'utf8')
  const main=fs.readFileSync(new URL('desktop/main.cjs',root),'utf8')
  const config=fs.readFileSync(new URL('vite.config.ts',root),'utf8')
  assert.ok(script.includes("join(appRoot, 'admin')"))
  assert.ok(script.includes("join(appRoot, 'admin-auth.cjs')"))
  assert.ok(script.includes("join(appRoot, 'staff-preload.cjs')"))
  assert.ok(main.includes('trustedStaffFrame(event)'))
  assert.ok(main.includes("protocol.handle('cph-admin'"))
  assert.ok(main.includes("nodeIntegration: false, contextIsolation: true, sandbox: true, devTools: false"))
  assert.ok(config.includes("includes('/tools/admin/')"))
  assert.ok(!fs.readFileSync(new URL('src/App.tsx',root),'utf8').includes('tools/admin/'))
})
