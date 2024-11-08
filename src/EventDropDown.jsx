import { useState, useEffect } from "react";
import axios from "axios";

export default function EventDropDown({ selectedEventId, setSelectedEventId }) {
  const [events, setEvents] = useState([]);

  const username = "client";
  const password = "client_salasana";
  const authToken = btoa(`${username}:${password}`);

  // add basic auth header to all axios requests
  axios.defaults.headers.common["Authorization"] = `Basic ${authToken}`;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        "https://ticket-guru-ticketguru-scrum-ritarit.2.rahtiapp.fi/api/events"
      );
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };

  const handleChange = (e) => {
    setSelectedEventId(e.target.value);
  };

  return (
    <div>
      <select id='eventSelect' value={selectedEventId} onChange={handleChange}>
        {events.map((event) => (
          <option key={event.eventId} value={event.eventId}>
            {event.eventName}
          </option>
        ))}
      </select>
    </div>
  );
}
