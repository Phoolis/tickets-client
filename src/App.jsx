import "./App.css";
import AppContext from "./AppContext";
import TicketScanner from "./TicketScanner";

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
    //username: "jane.doe@ticketguru.com",
    //password: "TicketInspector123",
    username: "admin@test.com",
    password: "admin",
  },
  their: {
    url: "https://ticket-guru-ticketguru-scrum-ritarit.2.rahtiapp.fi",
    ticketUsedErrorCode: "ERR_BAD_REQUEST", // Not really implemented yet
    barcodeProperty: "ticketNumber",
    username: "client",
    password: "client_salasana",
  },
};

function App() {
  return (
    <AppContext.Provider value={{ settings }}>
      <TicketScanner />
    </AppContext.Provider>
  );
}

export default App;
