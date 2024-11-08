import { useState, useEffect } from "react";
import { useAppContext } from "../AppContext";
import { useApiService } from "../service/api";

export default function EventDropDown({ selectedEventId, setSelectedEventId }) {
  const [events, setEvents] = useState([]);
  useAppContext();
  const { api, fetchEvents } = useApiService();

  useEffect(() => {
    getEvents();
  }, [api]);

  const getEvents = async () => {
    const response = await fetchEvents();
    setEvents(response);
  };

  const handleChange = (e) => {
    setSelectedEventId(e.target.value);
  };

  return (
    <div>
      <select id='eventSelect' value={selectedEventId} onChange={handleChange}>
        <option></option>
        {events.map((event) => (
          <option key={event.eventId} value={event.eventId}>
            {event.eventName}
          </option>
        ))}
      </select>
    </div>
  );
}
