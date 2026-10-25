import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { STAFF_REQUEST_PREFILL_URL } from '../../config/staffRequestForm'
import {
  buildStaffRequestFormUrl, formatStaffRequest, isValidStaffRequest, STAFF_REQUEST_MAX_LENGTH,
} from '../../services/staffRequests'
import type { StaffRequestScreen, StaffRequestType } from '../../services/staffRequests'
import { Button } from '../ui/Button'

interface Props { onDismiss: () => void }

export function StaffRequestDialog({ onDismiss }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const manualCopyRef = useRef<HTMLTextAreaElement>(null)
  const [category, setCategory] = useState<StaffRequestType>('정보 추가')
  const [screen, setScreen] = useState<StaffRequestScreen>('호텔 업무 영어 응대')
  const [details, setDetails] = useState('')
  const [copyFailed, setCopyFailed] = useState(false)
  const [status, setStatus] = useState('')
  const valid = isValidStaffRequest(details)
  const content = valid ? formatStaffRequest({ category, screen, details }) : ''
  const formUrl = buildStaffRequestFormUrl(STAFF_REQUEST_PREFILL_URL, content)

  useEffect(() => {
    const node = dialogRef.current
    if (!node) return
    node.showModal()
    return () => { if (node.open) node.close() }
  }, [])

  async function copyRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid) return
    try {
      await navigator.clipboard.writeText(content)
      setCopyFailed(false)
      setStatus('요청 내용을 복사했습니다. 복사만으로 접수되지는 않습니다.')
    } catch {
      setCopyFailed(true)
      setStatus('자동 복사가 제한됐습니다. 아래 텍스트를 선택해 복사해 주세요.')
      requestAnimationFrame(() => manualCopyRef.current?.select())
    }
  }

  return <dialog ref={dialogRef} className="staff-request-dialog" aria-labelledby="staff-request-title"
    aria-describedby="staff-request-description" onCancel={onDismiss}>
    <div className="staff-request-dialog-heading">
      <div><p className="staff-request-eyebrow">FRONT DESK FEEDBACK</p><h2 id="staff-request-title">직원 요청사항</h2></div>
      <Button variant="quiet" aria-label="요청사항 창 닫기" onClick={onDismiss}>닫기</Button>
    </div>
    <p id="staff-request-description" className="staff-request-description">
      시설 정보 추가, 안내 문구 수정, 오류 및 기능 개선을 요청할 수 있습니다.
    </p>
    <form className="staff-request-form" onSubmit={copyRequest}>
      <label htmlFor="staff-request-category">요청 유형</label>
      <select id="staff-request-category" value={category} onChange={e => setCategory(e.target.value as StaffRequestType)}>
        <option>정보 추가</option><option>정보 수정</option><option>오류 신고</option><option>기능 개선</option>
      </select>
      <label htmlFor="staff-request-screen">관련 화면</label>
      <select id="staff-request-screen" value={screen} onChange={e => setScreen(e.target.value as StaffRequestScreen)}>
        <option>호텔 업무 영어 응대</option><option>주변 시설 안내</option><option>기타</option>
      </select>
      <label htmlFor="staff-request-details">요청 내용</label>
      <textarea id="staff-request-details" rows={5} minLength={10} maxLength={STAFF_REQUEST_MAX_LENGTH}
        required value={details} onChange={e => { setDetails(e.target.value); setStatus(''); setCopyFailed(false) }}
        placeholder="예: 고객이 근처 세탁소를 자주 문의합니다. 주변 시설에 추가해 주세요." />
      <div className="staff-request-count">{details.trim().length} / {STAFF_REQUEST_MAX_LENGTH}자 · 10자 이상 작성</div>
      <p className="staff-request-privacy">고객 이름·객실번호·전화번호 등 개인정보를 적지 마세요. 요청만으로 호텔 안내 내용이 변경되지는 않습니다.</p>
      <div className="staff-request-actions">
        <Button variant="secondary" type="submit" disabled={!valid}>요청 내용 복사</Button>
        {formUrl
          ? <a className="button button--primary staff-request-submit" href={formUrl}
              target="_blank" rel="noopener noreferrer">Google Forms에서 접수하기</a>
          : !valid
            ? <span className="staff-request-unavailable" role="status">요청 내용을 10자 이상 작성해 주세요.</span>
            : <span className="staff-request-unavailable" role="status">온라인 접수 연결 전 · 복사만 가능</span>}
      </div>
      {formUrl && <p className="staff-request-instructions">Google Forms가 열리면 자동 입력된 내용을 확인하고 <strong>제출</strong>을 눌러야 접수가 완료됩니다.</p>}
      {status && <p className="staff-request-status" role="status">{status}</p>}
      {copyFailed && <textarea ref={manualCopyRef} className="staff-request-manual-copy" readOnly aria-label="수동 복사용 요청 내용" value={content} rows={5} onFocus={e => e.currentTarget.select()} />}
    </form>
  </dialog>
}
