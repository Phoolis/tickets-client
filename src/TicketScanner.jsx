import { useState, useEffect } from "react";
import { useApiService } from "./service/api";
import { useAppContext } from "./AppContext";

import EventDropDown from "./components/EventDropDown";
import Ticket from "./components/Ticket";
import CorrectEventChecker from "./components/CorrectEventChecker";

export default function TicketScanner() {
  const { settings } = useAppContext();
  const [example, setExample] = useState(null);
  const [error, setError] = useState(null);
  const [barcode, setBarcode] = useState("");
  const {
    fetchExampleTicket,
    fetchTicket,
    fetchEvent,
    fetchTicketType,
    api,
    setApi,
    consumeTicket,
  } = useApiService();
  const [selectedEventId, setSelectedEventId] = useState(0);
  const [eventIdInTicket, setEventIdInTicket] = useState(0);
  const [ticketData, setTicketData] = useState(null);
  const [additionalData, setAdditionalData] = useState({
    event: null,
    ticketType: null,
  });

  useEffect(() => {
    if (api) {
      setApi(api);
      fetchExampleTicket()
        .then((data) => setExample(data))
        .catch((error) => setError({ message: error.message }));
    }
  }, [api]);

  useEffect(() => {
    if (ticketData != null) {
      setEventIdInTicket(ticketData.eventId);
      setError(null);
    }
  }, [ticketData]);

  const changeApi = async (newApi) => {
    try {
      setBarcode("");
      setTicketData(null);
      setApi(newApi); // This triggers the useEffect hook.
    } catch (error) {
      console.error("Error changing API:", error);
      setError({ message: "Error changing API or setting headers" });
    }
  };

  const handleChange = (event) => {
    setBarcode(event.target.value);
  };

  // fetch data on pressing Enter
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchTicketData(barcode);
    }
  };

  const fetchTicketData = async (barcode) => {
    try {
      const response = await fetchTicket(barcode);

      // If response is an object, directly set ticketData
      setTicketData(response.data);

      const fetchMoreFn = api === "their" ? fetchMoreTheirs : fetchMoreOurs;

      // Call fetchMore function conditionally
      if (fetchMoreFn) {
        await fetchMoreFn(response.data); // Assuming response contains the needed fields
      }
    } catch (error) {
      console.error("Error in fetchTicketData:", error);
      setError({ message: error.message });
    }
  };

  const fetchMoreOurs = async (ticket) => {
    setAdditionalData({
      event: {
        name: ticket.event.name,
        time: ticket.event.beingsAt,
        location: ticket.venue.name,
      },
      ticketType: ticket.ticketType.name,
    });
  };

  const fetchMoreTheirs = async (ticket) => {
    try {
      if (!ticket || !ticket.eventId) {
        throw new Error("Missing eventId in ticket data");
      }

      const eventResponse = await fetchEvent(ticket.eventId);
      const ticketTypeResponse = await fetchTicketType(ticket.ticketTypeId);

      setAdditionalData({
        event: {
          name: eventResponse.eventName,
          time: eventResponse.eventDate,
          location: eventResponse.location,
        },
        ticketType: ticketTypeResponse.ticketTypeName,
      });
    } catch (error) {
      console.error("Error in fetchMoreTheirs:", error);
      setError({ message: error.message });
    }
  };

  const markTicketAsUsed = async (barcode) => {
    // Scrum Ritarit have not implemented an error for a used ticket yet, so the following is a workaround
    if (api == "their" && ticketData["usedTimestamp"]) {
      setError({ code: "ERR_CONFLICT" });
      //return;
    }
    const data = await consumeTicket(barcode);
    setTicketData(data);
    setBarcode("");
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Select the server to fetch ticket data from.</p>
        </div>

        {/* API Selection Buttons */}
        <div className="mt-5 sm:flex sm:items-center">
          <div className="grid gap-3 sm:grid-cols-3 w-full sm:max-w-md">
            <button
              disabled={api === "local"}
              onClick={() => changeApi("local")}
              className={`w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                api === "local"
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              Local API
            </button>
            <button
              disabled={api === "our"}
              onClick={() => changeApi("our")}
              className={`w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                api === "our"
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              NAT20 API
            </button>
            <button
              disabled={api === "their"}
              onClick={() => changeApi("their")}
              className={`w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                api === "their"
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              Scrum Ritarit API
            </button>
          </div>
        </div>

        {/* Event Dropdown */}
        <div className="mt-5">
          <EventDropDown
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
            settings={settings}
            api={api}
          />
        </div>

        {/* Barcode Input */}
        <div className="mt-5 sm:flex sm:items-center">
          <label htmlFor="barcode" className="sr-only">
            Barcode
          </label>
          <input
            id="barcode"
            type="text"
            placeholder="Enter/Read ticket number here"
            value={barcode}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            autoFocus
            className="block w-full pl-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:max-w-xs"
          />
        </div>

        {/* Correct Event Checker */}
        <CorrectEventChecker
          selectedEventId={selectedEventId}
          eventIdInTicket={eventIdInTicket}
        />

        {/* Error Message */}
        {error && (
          <div className="mt-5 text-sm text-red-600">
            <p>Error: {error.message || "An unexpected error occurred."}</p>
            {error.code === settings[api].ticketUsedErrorCode && (
              <p>Ticket already used!</p>
            )}
          </div>
        )}

        {/* Ticket Data Display */}
        {ticketData && (
          <div className="mt-5">
            <Ticket ticketData={ticketData} additionalData={additionalData} />
            <button
              onClick={() =>
                markTicketAsUsed(ticketData[settings[api].barcodeProperty])
              }
              className="mt-3 inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Mark as Used
            </button>
          </div>
        )}

        {/* Example Barcode */}
        {example && (
          <div className="mt-5 text-sm text-gray-500">
            <p>
              Try this:{" "}
              <input
                onClick={() => {
                  setBarcode(example[settings[api].barcodeProperty]);
                  fetchTicketData(example[settings[api].barcodeProperty]);
                }}
                type="button"
                style={{ cursor: "pointer" }}
                value={example[settings[api].barcodeProperty]}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
