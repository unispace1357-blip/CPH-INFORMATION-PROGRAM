import type { ValidationResult } from '../services/workspace'

export function ValidationPanel({ title, result }: { title: string; result: ValidationResult }) {
  return <section className={`admin-validation ${result.valid ? 'admin-validation--pass' : ''}`} aria-label={title}>
    <h3>{title} · {result.valid ? 'PASS' : 'FAIL'}</h3>
    {result.valid ? <p>검사한 기술적 조건을 충족합니다. 실제 정보 정확성은 담당자가 별도로 확인해야 합니다.</p> : <><ul>{result.messages.map((message, index) => <li key={index}>{message}</li>)}</ul><details><summary>상세 검증 오류</summary><pre>{result.technical}</pre></details></>}
  </section>
}
