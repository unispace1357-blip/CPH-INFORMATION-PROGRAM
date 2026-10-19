import { englishReadingSegments } from '../../services/englishReading'

/** Decorative staff aid only: preserves every byte of the English source for clipboard actions. */
export function EnglishReadingText({ text }: { text: string }) {
  return <>{englishReadingSegments(text).map((segment, index) => segment.reading
    ? <span key={index}>{segment.text}<span className="staff-reading-hint" lang="ko"> ({segment.reading})</span></span>
    : <span key={index}>{segment.text}</span>)}</>
}
