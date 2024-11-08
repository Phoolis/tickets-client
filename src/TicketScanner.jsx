import { useState, useEffect } from "react";
import axios from "axios";

import EventDropDown from "./eventDropDown";

export default function TicketScanner() {
  const [ticketData, setTicketData] = useState(null);
  const [example, setExample] = useState(null);
  const [error, setError] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(0);

  const OUR_API = "https://ticketguru.hellmanstudios.fi/api/tickets";
  const THEIR_API =
    "https://ticket-guru-ticketguru-scrum-ritarit.2.rahtiapp.fi/api/tickets";

  /**
   * Change the following 3 properties and uncomment the correct username and password to test the correct API
   */
  const URL = THEIR_API; // change to THEIR_API to test the API of Scrum Ritarit
  const BARCODE_PROPERTY = "ticketNumber"; // Ours: "barcode", Theirs: "ticketNumber"
  const TICKET_USED_ERROR_CODE = "ERR_BAD_REQUEST"; // Ours: "ERR_BAD_REQUEST", Theirs: nothing (yet?)

  const username = "client";
  const password = "client_salasana";
  //const username = "admin@test.com";
  //const password = "admin";
  //const username = "jane.doe@ticketguru.com";
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
      const response = await axios.get(URL);
      setExample(response.data[0]);
    } catch (error) {
      console.error("Error fetching ticket data: ", error);
    }
  };

  const fetchTicketData = async (barcode) => {
    setError(null);
    try {
      const fetchUrl = URL + (URL == THEIR_API ? "/" : "/barcode/") + barcode;
      const response = await axios.get(fetchUrl);
      setTicketData(response.data);
      setBarcode("");
    } catch (error) {
      console.error("Error fetching ticket data: ", error);
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
        "/" +
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
      <EventDropDown
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
      />
      Barcode:{" "}
      <input
        autoFocus
        type='text'
        value={barcode}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
      />
      {ticketData && (
        <>
          <div>
            <p>{JSON.stringify(ticketData)}</p>
          </div>
          <button
            onClick={() => markTicketAsUsed(ticketData[BARCODE_PROPERTY])}>
            Mark as Used
          </button>
        </>
      )}
      <div className='error'>
        {error && error.code == TICKET_USED_ERROR_CODE && (
          <p>Ticket already used!</p>
        )}
      </div>
      <div>{example && <p> Try this: {example[BARCODE_PROPERTY]}</p>}</div>
    </div>
  );
}
