export default function ErrorMessage({ error, errorCode }) {
  if (!error) return null;

  return (
    <div className="mt-5 text-sm text-red-600">
      <p>Error: {error.message || "An unexpected error occurred."}</p>
      {error.code === errorCode && <p>Ticket already used!</p>}
    </div>
  );
}
