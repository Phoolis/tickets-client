import { useState, useEffect } from "react";
import axios from "axios";

export default function TicketScanner() {
  const [ticketData, setTicketData] = useState(null);
  const [example, setExample] = useState(null);
  const [error, setError] = useState(null);
  const [barcode, setBarcode] = useState("");

  const url = "https://ticketguru.hellmanstudios.fi/api/tickets";

  //const username = "admin@test.com";
  //const password = "admin";
  const username = "jane.doe@ticketguru.com";
  const password = "TicketInspector123";
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
      const response = await axios.get(url);
      setExample(response.data[0]);
    } catch (error) {
      console.error("Error fetching ticket data: ", error);
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
          <button onClick={() => markTicketAsUsed(barcode)}>
            Mark as Used
          </button>
        </>
      )}
      <div className="error">
        {error &&
          error.code == "ERR_BAD_REQUEST" && ( // This would be better if it received the CONFLICT status code
            <p>Ticket already used!</p>
          )}
      </div>
      <div>{example && <p> Try this: {example.barcode}</p>}</div>
    </div>
  );
}
