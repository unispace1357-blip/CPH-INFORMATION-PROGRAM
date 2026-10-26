/** Reserved staff-only area for operational manuals. No procedures are published yet. */
export function StaffWorkPanel() {
  return (
    <section className="panel staff-work-panel" aria-labelledby="staff-work-title">
      <p className="staff-section-kicker">STAFF OPERATIONS</p>
      <h1 id="staff-work-title" tabIndex={-1}>업무용</h1>
      <p className="staff-work-empty-message">아직 등록된 업무 안내가 없습니다. 내용은 추후 추가할 예정입니다.</p>
    </section>
  )
}
