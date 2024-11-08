import { useState, useEffect } from "react";
import axios from "axios";

import EventDropDown from "./eventDropDown";

export default function TicketScanner() {
  const [ticketData, setTicketData] = useState(null);
  const [additionalData, setAdditionalData] = useState({
    event: null,
    ticketType: null,
  });
  const [example, setExample] = useState(null);
  const [error, setError] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [api, setApi] = useState("their");

  const settings = {
    local: {
      url: "http://localhost:8080",
      ticketUsedErrorCode: "ERR_BAD_REQUEST",
      barcodeProperty: "barcode",
      username: "admin@test.com",
      password: "admin",
    },
    our: {
      url: "https://ticketguru.hellmanstudios.fi",
      ticketUsedErrorCode: "ERR_BAD_REQUEST",
      barcodeProperty: "barcode",
      username: "jane.doe@ticketguru.com",
      password: "TicketInspector123",
    },
    their: {
      url: "https://ticket-guru-ticketguru-scrum-ritarit.2.rahtiapp.fi",
      ticketUsedErrorCode: "NOT_IMPLEMENTED",
      barcodeProperty: "ticketNumber",
      username: "client",
      password: "client_salasana",
    },
  };

  useEffect(() => {
    if (api) {
      setAuthHeader();
      fetchExampleTicket();
    }
  }, [api]);

  const setAuthHeader = () => {
    const authToken = btoa(
      `${settings[api].username}:${settings[api].password}`
    );
    axios.defaults.headers.common["Authorization"] = `Basic ${authToken}`;
  };

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

  const fetchExampleTicket = async () => {
    setError(null);
    try {
      const response = await axios.get(settings[api].url + "/api/tickets");
      setExample(response.data[0]);
    } catch (error) {
      console.error("Error fetching example ticket data: ", error);
      setError({ message: "Network error. Is the server up?" });
    }
  };

  const fetchTicketData = async (barcode) => {
    setError(null);
    try {
      const fetchUrl =
        settings[api].url +
        (api == "their" ? "/api/tickets/" : "/api/tickets/barcode/") +
        barcode;
      const response = await axios.get(fetchUrl);
      setTicketData(response.data);
      const fetchMoreFn = api == "their" ? fetchMoreTheirs : fetchMoreOurs;
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
        settings[api].url + "/api/events/" + ticketData["eventId"]
      );
      const ticketTypeResponse = await axios.get(
        settings[api].url + "/api/ticket-types/" + ticketData["ticketTypeId"]
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
    if (api == "their" && ticketData["usedTimestamp"]) {
      setError({ code: settings[api].ticketUsedErrorCode });
      return;
    }

    try {
      const useUrl =
        settings[api].url +
        "/api/tickets/" +
        (api == "their" ? barcode + "/use?used=true" : "use/" + barcode);
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
