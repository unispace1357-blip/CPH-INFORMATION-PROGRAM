import { useState } from 'react'
import type { FormEvent } from 'react'
import { AdminApp } from './AdminApp'
import { DEMO_ADMIN_PASSWORD, grantDemoAdminSession, hasDemoAdminSession, isDemoAdminPassword, revokeDemoAdminSession } from '../../src/services/demoAdminGate'
import './styles/public-demo-gate.css'

/**
 * Public static demo. All HTML and JS are downloadable before password entry.
 * Never interpret this as access control, an authorization check or storage security.
 */
export function PublicDemoAdminEntry(){
  const [unlocked,setUnlocked]=useState(hasDemoAdminSession)
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    if(isDemoAdminPassword(password)){
      setPassword('');setError('');grantDemoAdminSession();setUnlocked(true)
    }else{
      setPassword('')
      setError('비밀번호가 일치하지 않습니다.')
    }
  }
  if(unlocked)return <div data-public-demo-admin="true">
    <div className="public-admin-topbar"><strong>CPH · 공개 테스트 관리자</strong><button type="button" onClick={()=>{revokeDemoAdminSession();setUnlocked(false)}}>잠그기</button><a href="../#/staff">직원 화면 복귀</a></div>
    <p className="public-admin-disclaimer">공개 DEMO 화면입니다. 이 비밀번호는 보안 수단이 아닙니다. 편집 내역은 현재 브라우저 메모리에만 반영되며 GitHub나 고객 화면에는 자동 게시되지 않습니다.</p>
    <AdminApp/>
  </div>
  return <main className="public-admin-login">
    <form className="public-admin-login-card" onSubmit={submit} aria-labelledby="public-admin-login-title">
      <p className="public-admin-kicker">THE CENTRAL PARK HOTEL · SONGDO</p>
      <h1 id="public-admin-login-title">관리자 화면</h1>
      <p>직원용 안내 프로그램의 관리자 도구입니다. 비밀번호를 입력하세요.</p>
      <label htmlFor="public-admin-password">관리자 비밀번호</label>
      <input id="public-admin-password" type="password" autoComplete="off" value={password} onChange={event=>setPassword(event.target.value)} required/>
      {error&&<p role="alert" className="public-admin-error">{error}</p>}
      <button type="submit">관리자 화면 입장</button>
      <a href="../#/staff">직원 화면으로 돌아가기</a>
      <p className="public-admin-footnote">이것은 비밀번호가 공개될 수 있는 정적 웹 DEMO입니다. 관리자 데이터와 코드도 공개되어 있으며, 기밀 정보·개인정보를 입력하면 안 됩니다. 기본 비밀번호는 소스에 포함되어 있습니다.</p>
      <span className="visually-hidden">샘플 비밀번호: {DEMO_ADMIN_PASSWORD.length}자</span>
    </form>
  </main>
}
