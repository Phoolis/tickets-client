import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

export default function CorrectEventChecker({
  selectedEventId,
  eventIdInTicket,
}) {
  if (!selectedEventId && !eventIdInTicket) {
    return <div></div>; // No output if IDs are missing
  }

  const isCorrectEvent = selectedEventId == eventIdInTicket;

  return (
    <div
      className={`mt-5 flex items-center rounded-md p-4 ${
        isCorrectEvent ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
      }`}
    >
      {isCorrectEvent ? (
        <>
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-sm font-medium">Oikea event</p>
        </>
      ) : (
        <>
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm font-medium">Tarkista event</p>
        </>
      )}
    </div>
  );
}
