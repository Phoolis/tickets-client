import { useState, useEffect } from "react";
import { useApiService } from "./service/ApiProvider";
import { useAppContext } from "./AppContext";
import EventDropDown from "./components/EventDropDown";
import Ticket from "./components/Ticket";
import CorrectEventChecker from "./components/CorrectEventChecker";
import ApiSelectionButtons from "./components/ApiSelectionButtons";
import BarcodeInput from "./components/BarcodeInput";
import ErrorMessage from "./components/ErrorMessage";
import ExampleBarcode from "./components/ExampleBarcode";

export default function TicketScanner() {
  const { settings } = useAppContext();
  const [example, setExample] = useState(null);
  const [barcode, setBarcode] = useState("");
  const {
    fetchExampleTicket,
    fetchTicket,
    fetchEvent,
    fetchTicketType,
    api,
    setApi,
    consumeTicket,
    releaseTicket,
    errorMessage,
    clearErrorMessage,
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
      fetchExampleTicket().then((data) => setExample(data));
    }
  }, [api]);

  useEffect(() => {
    if (ticketData != null) {
      if (ticketData.eventId) {
        setEventIdInTicket(ticketData.eventId);
      } else {
        setEventIdInTicket(ticketData.event.id);
      }
      clearErrorMessage(); // Clear any error once data is fetched
    }
  }, [ticketData]);

  const changeApi = (newApi) => {
    setBarcode("");
    setTicketData(null);
    clearErrorMessage();
    setApi(newApi);
  };

  const handleChange = (event) => {
    setBarcode(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchTicketData(barcode);
    }
  };

  const fetchTicketData = async (barcode) => {
    try {
      const response = await fetchTicket(barcode);
      setTicketData(response.data);
      const fetchMoreFn = api === "their" ? fetchMoreTheirs : fetchMoreOurs;
      if (fetchMoreFn) await fetchMoreFn(response.data);
    } catch (error) {
      console.error("Error fetching ticket data:", error);
    }
  };

  const fetchMoreOurs = async (ticket) => {
    console.log("Fetching additional data for our ticket", ticket);
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
      console.error("Error fetching additional data:", error);
    }
  };

  const markTicketAsUsed = async () => {
    const data = await consumeTicket(barcode);
    setTicketData(data);
    setBarcode("");
  };

  const markTicketAsUnused = async () => {
    const data = await releaseTicket(barcode);
    setTicketData(data);
    setBarcode("");
  };

  const isCorrectEvent = selectedEventId == eventIdInTicket;

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <p className="text-sm text-gray-500">
          Select the server to fetch ticket data from.
        </p>
        <ApiSelectionButtons changeApi={changeApi} />
        <EventDropDown
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
        />
        <BarcodeInput
          barcode={barcode}
          handleChange={handleChange}
          handleKeyPress={handleKeyPress}
        />
        <CorrectEventChecker
          selectedEventId={selectedEventId}
          eventIdInTicket={eventIdInTicket}
          isCorrectEvent={isCorrectEvent}
        />
        <ErrorMessage
          error={errorMessage}
          errorCode={settings[api].ticketUsedErrorCode}
        />
        {ticketData && isCorrectEvent && !ticketData.used && (
          <div className="mt-5">
            <Ticket ticketData={ticketData} additionalData={additionalData} />
            <button
              onClick={markTicketAsUsed}
              className="mt-3 inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Mark as Used
            </button>
          </div>
        )}
        {ticketData && isCorrectEvent && ticketData.used && (
          <div className="mt-5">
            <Ticket ticketData={ticketData} additionalData={additionalData} />
            <button
              onClick={markTicketAsUnused}
              className="mt-3 inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Mark as Unused
            </button>
          </div>
        )}
        <ExampleBarcode
          example={example}
          barcodeProperty={settings[api].barcodeProperty}
          setBarcode={setBarcode}
          fetchTicketData={fetchTicketData}
        />
      </div>
    </div>
  );
}
