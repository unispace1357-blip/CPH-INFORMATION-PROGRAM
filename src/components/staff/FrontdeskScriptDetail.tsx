import { useEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import type { FrontdeskScript } from '../../types/frontdeskScript'
import { copyText } from '../../services/clipboard'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { EnglishReadingText } from './EnglishReadingText'

export function FrontdeskScriptDetail({ script, headingRef, favorite = false, canFavorite = true, onToggleFavorite }: { script: FrontdeskScript; headingRef: Ref<HTMLHeadingElement>; favorite?: boolean; canFavorite?: boolean; onToggleFavorite?: () => void }) {
  const [copyState, setCopyState] = useState<{ target: 'quick' | 'details'; status: 'pending' | 'success' | 'failed' } | null>(null)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const pending = copyState?.status === 'pending'

  async function copy(target: 'quick' | 'details') {
    if (pending) return
    const text = target === 'quick' ? script.quickAnswer.en : script.details?.en
    if (!text) return
    setCopyState({ target, status: 'pending' })
    const result = await copyText(text)
    if (mounted.current) setCopyState({ target, status: result === 'success' ? 'success' : 'failed' })
  }

  return <article className="frontdesk-script-detail">
    <div className="section-heading">
      <h3 id="frontdesk-detail-title" className="detail-title" ref={headingRef} tabIndex={-1}>{script.title}</h3>
      <Button variant="secondary" disabled={!onToggleFavorite || (!favorite && !canFavorite)}
        onClick={onToggleFavorite}>{favorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기 추가'}</Button>
      
    </div>
    <div className="frontdesk-question">
      <h4>고객 질문</h4>
      <p lang="en"><EnglishReadingText text={script.question.en} /></p>
      <p lang="ko">{script.question.ko}</p>
    </div>
    <section className="frontdesk-quick-answer" aria-labelledby="frontdesk-quick-title">
      <p className="staff-section-kicker">QUICK REPLY</p>
      <h4 id="frontdesk-quick-title">즉시 응대</h4>
      <p className="frontdesk-answer-en" lang="en"><EnglishReadingText text={script.quickAnswer.en} /></p>
      <p className="frontdesk-answer-ko" lang="ko">{script.quickAnswer.ko}</p>
      <Button disabled={pending} onClick={() => void copy('quick')} icon={<Icon name="copy" size={18} />} aria-label="즉시 응대 영어 복사">{copyState?.target === 'quick' && copyState.status === 'success' ? '복사 완료' : '영어 복사'}</Button>
    </section>
    {script.details && <details className="frontdesk-disclosure frontdesk-details">
      <summary>상세 설명</summary>
      <div className="frontdesk-disclosure-content">
        <p className="frontdesk-answer-en" lang="en"><EnglishReadingText text={script.details.en} /></p>
        <p className="frontdesk-answer-ko" lang="ko">{script.details.ko}</p>
        <Button variant="secondary" disabled={pending} onClick={() => void copy('details')} icon={<Icon name="copy" size={17} />} aria-label="상세 설명 영어 복사">{copyState?.target === 'details' && copyState.status === 'success' ? '복사 완료' : '상세 영어 복사'}</Button>
      </div>
    </details>}
    {script.staffChecks.length > 0 && <details className="frontdesk-disclosure frontdesk-staff-checks">
      <summary>직원 확인사항</summary>
      <div className="frontdesk-disclosure-content"><p className="field-hint">직원 확인용입니다. 고객에게 복사하는 문구에 포함되지 않습니다.</p><ul>{script.staffChecks.map(check => <li key={check}>{check}</li>)}</ul></div>
    </details>}
    <p className="field-hint">한글 발음 표기는 직원 참고용이며 복사되지 않습니다. 복사 버튼은 선택한 영어 원문만 복사합니다.</p>
    <p className={`copy-status ${copyState?.status === 'failed' ? 'copy-status--failed' : ''}`} role="status" aria-live="polite" aria-atomic="true">{pending ? '복사 중…' : copyState?.status === 'success' ? '복사 완료' : copyState?.status === 'failed' ? '복사에 실패했습니다. 영어 문구를 직접 선택해 복사해 주세요.' : ''}</p>
  </article>
}
