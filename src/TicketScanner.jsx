import { useState, useEffect } from "react";
import { useApiService } from "./service/api";
import { useAppContext } from "./AppContext";

import EventDropDown from "./EventDropDown";

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
    useTicket,
  } = useApiService();
  const [selectedEventId, setSelectedEventId] = useState(0);
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
      return;
    }
    const data = await useTicket(barcode);
    setTicketData(data);
    setBarcode("");
  };

  return (
    <div>
      <h5>Choose API server:</h5>
      <div className="testButtonsRow">
        <button disabled={api == "local"} onClick={() => changeApi("local")}>
          Local API
        </button>
        <button disabled={api == "our"} onClick={() => changeApi("our")}>
          NAT20 API
        </button>
        <button disabled={api == "their"} onClick={() => changeApi("their")}>
          Scrum Ritarit API
        </button>
      </div>
      <EventDropDown
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
        settings={settings}
        api={api}
      />
      <div className="barcodeReader">
        Barcode:{" "}
        <input
          autoFocus
          type="text"
          value={barcode}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
        />
      </div>
      {ticketData && (
        <>
          <div>
            <p>{JSON.stringify(ticketData)}</p>
          </div>
          <div>
            <p>{JSON.stringify(additionalData)}</p>
          </div>
          <button
            onClick={() =>
              markTicketAsUsed(ticketData[settings[api].barcodeProperty])
            }
          >
            Mark as Used
          </button>
        </>
      )}

      <div className="error">
        {error && (
          <p>Error: {error.message || "An unexpected error occurred."}</p>
        )}
        {error && error.code === settings[api].ticketUsedErrorCode && (
          <p>Ticket already used!</p>
        )}
      </div>

      <div>
        {example && <p> Try this: {example[settings[api].barcodeProperty]}</p>}
      </div>
    </div>
  );
}
