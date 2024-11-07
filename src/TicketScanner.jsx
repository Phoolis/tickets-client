import { useState } from "react";
import axios from "axios";

export default function TicketScanner() {
  const [ticketData, setTicketData] = useState(null);
  const [barcode, setBarcode] = useState("");

  const url = "http://localhost:8080/api/tickets";
  //"https://ticketguru.hellmanstudios.fi/api/tickets/1";

  const username = "admin@test.com";
  const password = "admin";
  const authToken = btoa(`${username}:${password}`);

  // add basic auth header to all axios requests
  axios.defaults.headers.common["Authorization"] = `Basic ${authToken}`;

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
      const response = await axios.get(url + "/barcode/" + barcode);
      setTicketData(response.data);
    } catch (error) {
      console.error("Error fetching ticket data: ", error);
    }
  };

  const markTicketAsUsed = async (barcode) => {
    try {
      const response = await axios.put(url + "/use/" + barcode);
      setTicketData(response.data);
      setBarcode("");
    } catch (error) {
      console.error("Error marking ticket as used: ", error);
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
          <button onClick={() => markTicketAsUsed(barcode)}>
            Mark as Used
          </button>
        </>
      )}
    </div>
  );
}
