import { hotelParagraphs } from '../../services/guestHotelPresentation'

/** Keeps approved hotel wording intact; headings are presentation-only metadata. */
export function HotelParagraphs({ text, labels, idPrefix }: { text: string; labels?: readonly string[]; idPrefix?: string }) {
  const paragraphs = hotelParagraphs(text)
  if (labels) {
    return <ol className="hotel-numbered-list">{paragraphs.map((paragraph, index) =>
      <li key={index} id={idPrefix ? `${idPrefix}-${index}` : undefined} tabIndex={-1} className="hotel-numbered-item">
        <span className="hotel-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <div className="hotel-numbered-content">
          {labels[index] && <h4>{labels[index]}</h4>}
          <p>{paragraph}</p>
        </div>
      </li>
    )}</ol>
  }
  return <div className="hotel-copy-paragraphs">{paragraphs.map((paragraph, index) =>
    <p key={index} id={idPrefix ? `${idPrefix}-${index}` : undefined} tabIndex={idPrefix ? -1 : undefined}>{paragraph}</p>
  )}</div>
}
