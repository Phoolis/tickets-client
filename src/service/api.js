import axios from "axios";
import { useAppContext } from "../AppContext";
import { useState } from "react";

export const useApiService = () => {
  const { settings } = useAppContext();

  const [api, setApi] = useState("their");

  const setAuthHeader = () => {
    const authToken = btoa(
      `${settings[api].username}:${settings[api].password}`
    );
    axios.defaults.headers.common["Authorization"] = `Basic ${authToken}`;
  };

  const fetchExampleTicket = async () => {
    try {
      setAuthHeader();
      const response = await axios.get(settings[api].url + "/api/tickets");
      return response.data[0];
    } catch (error) {
      console.error("Error fetching example ticket data: ", error);
      throw new Error("Network error. Is the server up?");
    }
  };

  const fetchTicket = async (barcode) => {
    try {
      setAuthHeader();
      const fetchUrl =
        settings[api].url +
        (api === "their" ? "/api/tickets/" : "/api/tickets/barcode/") +
        barcode;
      const response = await axios.get(fetchUrl);
      return response; // Return full response
    } catch (error) {
      console.error("Error fetching ticket data:", error);
      throw new Error("Network error. Is the server up?");
    }
  };

  const fetchEvent = async (eventId) => {
    try {
      setAuthHeader();
      const response = await axios.get(
        settings[api].url + "/api/events/" + eventId
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching events: ", error);
      throw new Error("Network error. Is the server up?");
    }
  };

  const fetchEvents = async () => {
    try {
      setAuthHeader();
      const events = [];
      const response = await axios.get(settings[api].url + "/api/events");
      for (const event of response.data) {
        const eventObject =
          api == "their"
            ? { eventId: event.eventId, eventName: event.eventName }
            : { eventId: event.id, eventName: event.name };
        events.push(eventObject);
      }
      return events;
    } catch (error) {
      console.error("Error fetching events: ", error);
      throw new Error("Network error. Is the server up?");
    }
  };

  const fetchTicketType = async (ticketTypeId) => {
    try {
      setAuthHeader();
      const response = await axios.get(
        settings[api].url + "/api/ticket-types/" + ticketTypeId
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket types: ", error);
      throw new Error("Network error. Is the server up?");
    }
  };

  const consumeTicket = async (barcode) => {
    try {
      const useUrl =
        settings[api].url +
        "/api/tickets/" +
        (api == "their" ? barcode + "/use?used=true" : "use/" + barcode);
      const response = await axios.put(useUrl);
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket data: ", error);
    }
  };

  return {
    setAuthHeader,
    fetchExampleTicket,
    api,
    setApi,
    fetchTicket,
    fetchEvent,
    fetchTicketType,
    consumeTicket,
    fetchEvents,
  };
};
