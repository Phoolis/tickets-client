import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAppContext } from "../AppContext";

// Create the ApiContext
const ApiContext = createContext();

// Define the ApiProvider component
export const ApiProvider = ({ children }) => {
  const { settings } = useAppContext();
  const [api, setApi] = useState("our"); // DEFAULT API: "their", change to "local" or "our" for testing
  const [errorMessage, setErrorMessage] = useState("");

  // Set authorization header whenever the API changes
  const setAuthHeader = () => {
    console.log("Setting auth header for user:", settings[api].username);
    const authToken = btoa(
      `${settings[api].username}:${settings[api].password}`
    );
    axios.defaults.headers.common["Authorization"] = `Basic ${authToken}`;
  };

  useEffect(() => {
    setAuthHeader();
  }, [api]);

  // Error handling function
  const handleApiError = (error) => {
    if (error.response) {
      setErrorMessage(error.response.data.message);
    } else if (error.request) {
      setErrorMessage("No response received from the server.");
    } else {
      setErrorMessage("An unexpected error occurred. Is the server up?");
    }
  };

  // Function to clear the error message
  const clearErrorMessage = () => {
    setErrorMessage("");
  };

  // API service functions
  const fetchExampleTicket = async () => {
    try {
      setAuthHeader();
      const response = await axios.get(`${settings[api].url}/api/tickets`);
      return response.data[0];
    } catch (error) {
      console.error("Error fetching example ticket data:", error);
      handleApiError(error);
    }
  };

  const fetchTicket = async (barcode) => {
    try {
      setAuthHeader();
      const fetchUrl = `${settings[api].url}/api/tickets/${
        api === "their" ? "" : "barcode/"
      }${barcode}`;
      const response = await axios.get(fetchUrl);
      return response;
    } catch (error) {
      console.error("Error fetching ticket data:", error);
      handleApiError(error);
    }
  };

  const fetchEvent = async (eventId) => {
    try {
      setAuthHeader();
      const response = await axios.get(
        `${settings[api].url}/api/events/${eventId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      handleApiError(error);
    }
  };

  const fetchEvents = async () => {
    try {
      setAuthHeader();
      console.log("Fetching events for API:", api);
      const response = await axios.get(`${settings[api].url}/api/events`);
      console.log("Events fetched:", response.data);
      return response.data.map((event) =>
        api === "their"
          ? { eventId: event.eventId, eventName: event.eventName }
          : { eventId: event.id, eventName: event.name }
      );
    } catch (error) {
      console.error("Error fetching events:", error);
      handleApiError(error);
    }
  };

  const fetchTicketType = async (ticketTypeId) => {
    try {
      setAuthHeader();
      const response = await axios.get(
        `${settings[api].url}/api/ticket-types/${ticketTypeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching ticket types:", error);
      handleApiError(error);
    }
  };

  const consumeTicket = async (barcode) => {
    try {
      const useUrl = `${settings[api].url}/api/tickets/${
        api === "their" ? `${barcode}/use?used=true` : `use/${barcode}`
      }`;
      const response = await axios.put(useUrl);
      return response.data;
    } catch (error) {
      console.error("Error consuming ticket data:", error);
      handleApiError(error);
    }
  };

  return (
    <ApiContext.Provider
      value={{
        api,
        setApi,
        errorMessage,
        clearErrorMessage,
        fetchExampleTicket,
        fetchTicket,
        fetchEvent,
        fetchEvents,
        fetchTicketType,
        consumeTicket,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the ApiContext
export const useApiService = () => useContext(ApiContext);
