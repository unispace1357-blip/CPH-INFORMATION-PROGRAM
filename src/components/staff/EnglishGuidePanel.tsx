import { useEffect, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
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

  // Small on-screen reading aid; never changes the English text copied to guests.
  const readingHints: [RegExp, string][] = [
    [/coastal/i, 'coastal (코스털)'],
    [/observatory/i, 'observatory (업저버토리)'],
    [/convensia/i, 'Convensia (컨벤시아)'],
    [/brewery/i, 'brewery (브루어리)'],
    [/premium outlet/i, 'premium outlet (프리미엄 아울렛)'],
  ]
  const hints = readingHints.filter(([pattern]) => phrases.some(phrase => pattern.test(phrase))).map(([, label]) => label)

  const announcement = copyState?.status === 'success' ? '복사 완료' : copyState?.status === 'failed'
    ? '복사에 실패했습니다. 문구를 직접 선택해 복사해 주세요.' : pending ? '복사 중…' : ''
  return (
    <section className="english-guide" aria-labelledby="english-guide-title">
      <div className="section-heading"><h3 id="english-guide-title" lang="en">English Guide</h3>
        {phrases.length !== 1 && <Button variant="secondary" disabled={!phrases.length || pending} onClick={() => void copy('all')} icon={<Icon name="copy" size={16} />}>{phrases.length ? '전체 문구 복사' : '복사'}</Button>}
      </div>
      <p className="field-hint">복사 버튼은 영어 문장만 복사합니다.</p>
      {hints.length > 0 && <p className="field-hint">발음 참고: {hints.join(" · ")}</p>}
      {!phrases.length ? <p className="phrase-placeholder">영어 안내 문구가 아직 등록되지 않았습니다.</p> : <ol className="english-phrases">{phrases.map((phrase, index) => <li key={index}>
        <h4 className="english-phrase-label">{index === 0 ? '기본 안내' : index === 1 ? '상세 안내' : `추가 안내 ${index - 1}`}</h4>
        <p className="english-phrase-text" lang="en">{phrase}</p>
        <p className="english-phrase-meaning" lang="ko">{meanings[index]?.trim() ? meanings[index] : '한국어 뜻 미등록'}</p>
        <Button variant="secondary" disabled={pending} onClick={() => void copy(index)} aria-label={`영어 문구 ${index + 1} 복사`} icon={<Icon name="copy" size={16} />}>{copyState?.target === index && copyState.status === 'success' ? '복사 완료' : '복사'}</Button>
      </li>)}</ol>}
      <p className={`copy-status ${copyState?.status === 'failed' ? 'copy-status--failed' : ''}`} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </section>
  )
}
