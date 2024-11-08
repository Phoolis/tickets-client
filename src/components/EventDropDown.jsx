import { useState, useEffect } from "react";
import { useApiService } from "../service/api";

export default function EventDropDown({ selectedEventId, setSelectedEventId }) {
  const [events, setEvents] = useState([]);
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
    <div className="mt-5 sm:flex sm:items-center">
      <select
        id="eventSelect"
        value={selectedEventId}
        onChange={handleChange}
        className="block w-full pl-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:max-w-xs"
      >
        <option value="">Select an event</option>
        {events.map((event) => (
          <option key={event.eventId} value={event.eventId}>
            {event.eventName}
          </option>
        ))}
      </select>
    </div>
  );
}
