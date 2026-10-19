import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { EnglishReadingText } from './EnglishReadingText'
import { copyText, joinEnglishPhrases } from '../../services/clipboard'

interface CopyState { target: number | 'all'; status: 'pending' | 'success' | 'failed' }

export function EnglishGuidePanel({ phrases, meanings = [] }: { phrases: readonly string[]; meanings?: readonly string[] }) {
  const [copyState, setCopyState] = useState<CopyState | null>(null)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const pending = copyState?.status === 'pending'

  async function copy(target: number | 'all') {
    const text = target === 'all' ? joinEnglishPhrases(phrases) : phrases[target]
    if (!text || pending) return
    setCopyState({ target, status: 'pending' })
    const result = await copyText(text)
    if (mounted.current) setCopyState({ target, status: result === 'success' ? 'success' : 'failed' })
  }

  const announcement = copyState?.status === 'success' ? '복사 완료' : copyState?.status === 'failed'
    ? '복사에 실패했습니다. 문구를 직접 선택해 복사해 주세요.' : pending ? '복사 중…' : ''
  return (
    <section className="english-guide" aria-labelledby="english-guide-title">
      <div className="section-heading"><h3 id="english-guide-title" lang="en">English Guide</h3>
        {phrases.length !== 1 && <Button variant="secondary" disabled={!phrases.length || pending} onClick={() => void copy('all')} icon={<Icon name="copy" size={16} />}>{phrases.length ? '전체 문구 복사' : '복사'}</Button>}
      </div>
      <p className="field-hint">어려운 영어 단어 옆의 한글 발음은 직원 참고용입니다. 복사하면 원래 영어 문장만 복사됩니다.</p>
      {!phrases.length ? <p className="phrase-placeholder">영어 안내 문구가 아직 등록되지 않았습니다.</p> : <ol className="english-phrases">{phrases.map((phrase, index) => <li key={index}>
        <h4 className="english-phrase-label">{index === 0 ? '기본 안내' : index === 1 ? '상세 안내' : `추가 안내 ${index - 1}`}</h4>
        <p className="english-phrase-text" lang="en"><EnglishReadingText text={phrase} /></p>
        <p className="english-phrase-meaning" lang="ko">{meanings[index]?.trim() ? meanings[index] : '한국어 뜻 미등록'}</p>
        <Button variant="secondary" disabled={pending} onClick={() => void copy(index)} aria-label={`영어 문구 ${index + 1} 복사`} icon={<Icon name="copy" size={16} />}>{copyState?.target === index && copyState.status === 'success' ? '복사 완료' : '복사'}</Button>
      </li>)}</ol>}
      <p className={`copy-status ${copyState?.status === 'failed' ? 'copy-status--failed' : ''}`} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </section>
  )
}
