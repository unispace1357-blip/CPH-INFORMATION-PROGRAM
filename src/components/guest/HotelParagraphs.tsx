import { hotelParagraphs } from '../../services/guestHotelPresentation'

/** Plain text only. Paragraph spacing never changes the approved copy or adds markup from it. */
export function HotelParagraphs({ text }: { text: string }) {
  return <div className="hotel-copy-paragraphs">{hotelParagraphs(text).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
}
