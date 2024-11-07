import { useState } from "react";
import axios from "axios";

export default function TicketDetails() {
  const [ticketData, setTicketData] = useState(null);
  const [barcode, setBarcode] = useState("");

  let url = "https://ticketguru.hellmanstudios.fi/api/tickets";
  //"https://ticketguru.hellmanstudios.fi/api/tickets/1";

  const username = "admin@test.com";
  const password = "admin";
  const authToken = btoa(`${username}:${password}`);

  axios.defaults.headers.common["Authorization"] = `Basic ${authToken}`;

  const handleChange = (event) => {
    setBarcode(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchTicketData({ url, barcode });
      setBarcode("");
    }
  };

  const fetchTicketData = async ({ url, barcode }) => {
    try {
      const response = await axios.get(url + "/barcode/" + barcode);
      setTicketData(response.data);
    } catch (error) {
      console.error("Error fetching: ", error);
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
        <div>
          <p>{JSON.stringify(ticketData)}</p>
        </div>
      )}
    </div>
  );
}
