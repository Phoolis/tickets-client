import { useState, useEffect } from "react";
import axios from "axios";

export default function TicketScanner() {
  const [ticketData, setTicketData] = useState(null);
  const [additionalData, setAdditionalData] = useState({
    event: null,
    ticketType: null,
  });
  const [example, setExample] = useState(null);
  const [error, setError] = useState(null);
  const [barcode, setBarcode] = useState("");

  const LOCAL_API = "http://localhost:8080";
  const OUR_API = "https://ticketguru.hellmanstudios.fi";
  const THEIR_API =
    "https://ticket-guru-ticketguru-scrum-ritarit.2.rahtiapp.fi";

  /**
   * Change the following properties and uncomment the correct username and password to test the correct API
   */
  const URL = THEIR_API; // change to THEIR_API to test the API of Scrum Ritarit
  const TICKET_USED_ERROR_CODE = "ERR_BAD_REQUEST"; // Ours: "ERR_BAD_REQUEST", Theirs: nothing (yet?)

  const BARCODE_PROPERTY = URL === THEIR_API ? "ticketNumber" : "barcode"; // Ours: "barcode", Theirs: "ticketNumber"

  const username = URL === THEIR_API ? "client" : "admin@test.com";
  const password = URL === THEIR_API ? "client_salasana" : "admin";
  //const username = "jane.doe@ticketguru.com"; // Jane needs access to events and ticket types before this works
  //const password = "TicketInspector123";
  const authToken = btoa(`${username}:${password}`);

  // add basic auth header to all axios requests
  axios.defaults.headers.common["Authorization"] = `Basic ${authToken}`;

  useEffect(() => {
    fetchExampleTicket();
  }, []);

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

  const fetchExampleTicket = async () => {
    try {
      const response = await axios.get(URL + "/api/tickets");
      setExample(response.data[0]);
    } catch (error) {
      console.error("Error fetching ticket data: ", error);
    }
  };

  const fetchTicketData = async (barcode) => {
    setError(null);
    try {
      const fetchUrl =
        URL +
        (URL == THEIR_API ? "/api/tickets/" : "/api/tickets/barcode/") +
        barcode;
      const response = await axios.get(fetchUrl);
      setTicketData(response.data);
      const fetchMoreFn = URL === THEIR_API ? fetchMoreTheirs : fetchMoreOurs;
      fetchMoreFn(response.data);
      setBarcode("");
    } catch (error) {
      console.error("Error fetching ticket data: ", error);
    }
  };

  const fetchMoreOurs = (ticketData) => {
    setAdditionalData({
      event: {
        name: ticketData.event.name,
        time: ticketData.event.beingsAt,
        location: ticketData.venue.name,
      },
      ticketType: ticketData.ticketType.name,
    });
  };

  const fetchMoreTheirs = async (ticketData) => {
    if (!ticketData["eventId"]) {
      throw new Error("Missing eventId in ticket data");
    }
    try {
      const eventResponse = await axios.get(
        URL + "/api/events/" + ticketData["eventId"]
      );
      const ticketTypeResponse = await axios.get(
        URL + "/api/ticket-types/" + ticketData["ticketTypeId"]
      );
      setAdditionalData({
        event: {
          name: eventResponse.data.eventName,
          time: eventResponse.data.eventDate,
          location: eventResponse.data.location,
        },
        ticketType: ticketTypeResponse.data.ticketTypeName,
      });
    } catch (error) {
      console.error("Error fetching additional data: ", error);
    }
  };

  const markTicketAsUsed = async (barcode) => {
    // Scrum Ritarit have not implemented an error for a used ticket yet, so the following is a workaround
    if (URL === THEIR_API && ticketData["usedTimestamp"]) {
      setError({ code: TICKET_USED_ERROR_CODE });
      return;
    }

    try {
      const useUrl =
        URL +
        "/api/tickets/" +
        (URL == THEIR_API ? barcode + "/use?used=true" : "use/" + barcode);
      const response = await axios.put(useUrl);
      setTicketData(response.data);
      setBarcode("");
    } catch (error) {
      console.error("Error marking ticket as used: ", error);
      setError(error);
    }
  };

  return (
    <div>
      Barcode:{" "}
      <input
        autoFocus
        type="text"
        value={barcode}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
      />
      {ticketData && (
        <>
          <div>
            <p>{JSON.stringify(ticketData)}</p>
          </div>
          <div>
            <p>{JSON.stringify(additionalData)}</p>
          </div>
          <button
            onClick={() => markTicketAsUsed(ticketData[BARCODE_PROPERTY])}
          >
            Mark as Used
          </button>
        </>
      )}
      <div className="error">
        {error && error.code == TICKET_USED_ERROR_CODE && (
          <p>Ticket already used!</p>
        )}
      </div>
      <div>{example && <p> Try this: {example[BARCODE_PROPERTY]}</p>}</div>
    </div>
  );
}
