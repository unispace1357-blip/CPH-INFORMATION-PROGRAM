import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../ui/Icon'

type AdminAuthStatus = {
  ready:boolean
  configured:boolean
  lockedSeconds?:number
  error?:string
}
type AuthResult = {ok:boolean;message?:string;lockedSeconds?:number}
declare global {
  interface Window {
    cphAdmin?: {
      status:()=>Promise<AdminAuthStatus>
      setup:(password:string,confirmation:string)=>Promise<AuthResult>
      open:(password:string)=>Promise<AuthResult>
    }
  }
}

/** Only packaged staff Electron has the safe main-process bridge.
 * Public GitHub Pages deliberately has neither credentials nor an admin bundle. */
export function StaffAdminAccess(){
  const [visible,setVisible]=useState(false)
  const [status,setStatus]=useState<AdminAuthStatus|null>(null)
  const [password,setPassword]=useState('')
  const [confirmation,setConfirmation]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const trigger=useRef<HTMLButtonElement>(null)
  const inputRef=useRef<HTMLInputElement>(null)

  function dismiss(){
    if(busy)return
    setVisible(false);setPassword('');setConfirmation('');setMessage('')
    requestAnimationFrame(()=>trigger.current?.focus())
  }
  async function openDialog(){
    setVisible(true);setMessage('');setPassword('');setConfirmation('');setStatus(null)
    if(!window.cphAdmin){
      setMessage('웹 공개 테스트에는 관리자 화면을 포함하지 않습니다. 관리자 인증은 Windows 실행 프로그램에서만 가능합니다.')
      return
    }
    setBusy(true)
    try {
      const next=await window.cphAdmin.status()
      setStatus(next)
      if(!next.ready)setMessage(next.error??'관리자 인증 상태를 확인할 수 없습니다.')
      else if(next.lockedSeconds)setMessage('잠시 후 다시 시도하세요. 관리자 인증이 일시 제한되었습니다.')
    }catch{setMessage('관리자 인증 모듈과 연결되지 않았습니다.')}
    finally{setBusy(false)}
  }
  useEffect(()=>{
    if(!visible)return
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!busy){event.preventDefault();dismiss()}}
    document.addEventListener('keydown',onKey)
    return()=>document.removeEventListener('keydown',onKey)
  },[visible,busy])
  useEffect(()=>{if(visible&&status?.ready&&!busy)inputRef.current?.focus()},[visible,status,busy])

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault()
    if(busy||!status?.ready||!window.cphAdmin)return
    setBusy(true);setMessage('')
    try {
      if(!status.configured){
        const result=await window.cphAdmin.setup(password,confirmation)
        if(result.ok){
          setStatus(await window.cphAdmin.status())
          setMessage('비밀번호 설정 완료. 비밀번호를 다시 입력해 관리자 화면을 열어 주세요.')
          setPassword('');setConfirmation('')
        }else setMessage(result.message??'비밀번호 설정에 실패했습니다.')
      }else{
        const result=await window.cphAdmin.open(password)
        setPassword('')
        if(result.ok){setVisible(false);setMessage('');requestAnimationFrame(()=>trigger.current?.focus())}
        else setMessage(result.message??'인증에 실패했습니다.')
      }
    }catch{setMessage('관리자 인증 처리를 완료하지 못했습니다.')}
    finally{setBusy(false)}
  }

  return <>
    <button ref={trigger} type="button" className="header-link staff-admin-trigger" onClick={()=>{void openDialog()}} aria-haspopup="dialog">
      <Icon name="lock" size={16}/> 관리자 화면
    </button>
    {visible&&<div className="staff-admin-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)dismiss()}}>
      <section className="staff-admin-dialog" role="dialog" aria-modal="true" aria-labelledby="staff-admin-title" aria-describedby="staff-admin-description">
        <div className="staff-admin-dialog-title">
          <Icon name="shield-check" size={26}/>
          <div>
            <span>CPH ADMIN · PRIVATE WORKSPACE</span>
            <h2 id="staff-admin-title">{status?.ready&&!status.configured?'관리자 최초 비밀번호 설정':'관리자 인증'}</h2>
          </div>
        </div>
        <p id="staff-admin-description">
          {status?.ready&&!status.configured
            ? '최초 사용 전에 본인이 비밀번호를 설정하세요. 이 Windows 사용자 프로필에만 설정되며 서버나 GitHub에 전송되지 않습니다.'
            : '관리자 비밀번호를 입력하면 별도의 보호된 편집창이 열립니다. 작업 내용은 JSON으로 내려받아 직접 반영해야 합니다.'}
        </p>
        {status?.ready&&<form onSubmit={event=>{void submit(event)}} className="staff-admin-form">
          <label htmlFor="staff-admin-password">{status.configured?'비밀번호':'새 비밀번호 (12자 이상, 문자·숫자 포함)'}</label>
          <input id="staff-admin-password" ref={inputRef} type="password" value={password}
            onChange={event=>setPassword(event.target.value)} autoComplete={status.configured?'current-password':'new-password'}
            minLength={status.configured?1:12} maxLength={128} required disabled={busy||!!status.lockedSeconds}/>
          {!status.configured&&<>
            <label htmlFor="staff-admin-confirmation">새 비밀번호 확인</label>
            <input id="staff-admin-confirmation" type="password" value={confirmation}
              onChange={event=>setConfirmation(event.target.value)} autoComplete="new-password"
              minLength={12} maxLength={128} required disabled={busy}/>
          </>}
          <button type="submit" className="staff-admin-submit"
            disabled={busy||!!status.lockedSeconds}>{busy?'확인 중…':status.configured?'관리자 화면 열기':'비밀번호 설정'}</button>
        </form>}
        {message&&<p role="status" className="staff-admin-message">{message}</p>}
        <p className="staff-admin-security-note">보안을 위해 공개 웹에는 비밀번호·인증키·관리자 파일을 올리지 않습니다. 공용 Windows 계정의 관리자 설정은 다른 PC에 적용되지 않습니다.</p>
        <button type="button" onClick={dismiss} disabled={busy} className="staff-admin-cancel">직원 화면으로 돌아가기</button>
      </section>
    </div>}
  </>
}
