import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

export default function CorrectEventChecker({
  selectedEventId,
  eventIdInTicket,
  isCorrectEvent,
}) {
  if (!selectedEventId && !eventIdInTicket) {
    return <div></div>; // No output if IDs are missing
  }

  return (
    <div
      className={`mt-5 flex items-center rounded-md p-4 ${
        isCorrectEvent ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
      }`}>
      {isCorrectEvent ? (
        <>
          <CheckCircleIcon className='h-5 w-5 text-green-500 mr-2' />
          <p className='text-sm font-medium'>Correct event</p>
        </>
      ) : selectedEventId != 0 ? (
        <>
          <ExclamationCircleIcon className='h-5 w-5 text-red-500 mr-2' />
          <p className='text-sm font-medium'>
            This ticket is not valid for the selected event!
          </p>
        </>
      ) : (
        <>
          <ExclamationCircleIcon className='h-5 w-5 text-red-500 mr-2' />
          <p className='text-sm font-medium'>Please select an event!</p>
        </>
      )}
    </div>
  );
}
