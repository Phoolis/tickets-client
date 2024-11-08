export default function CorrectEventChecker({
  selectedEventId,
  eventIdInTicket,
}) {
  if (selectedEventId != 0 && eventIdInTicket != 0) {
    return (
      <div>
        {selectedEventId != eventIdInTicket && <p>Tarkista event</p>}
        {selectedEventId == eventIdInTicket && <p>Oikea event</p>}
      </div>
    );
  } else {
    return <div></div>;
  }
}
