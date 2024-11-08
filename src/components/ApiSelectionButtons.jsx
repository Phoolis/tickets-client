import { useApiService } from "../service/ApiProvider";

export default function ApiSelectionButtons({ changeApi }) {
  const { api, setApi } = useApiService();

  const buttonStyles = (isSelected) =>
    `w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
      isSelected
        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
        : "bg-indigo-600 text-white hover:bg-indigo-500"
    }`;

  const handleChangeApi = async (newApi) => {
    console.log("Changing API to:", newApi); // Log the API change
    await changeApi(newApi); // Await the update of `api`
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3 w-full sm:max-w-md">
      <button
        disabled={api === "local"}
        onClick={() => handleChangeApi("local")}
        className={buttonStyles(api === "local")}
      >
        Local API
      </button>
      <button
        disabled={api === "our"}
        onClick={() => handleChangeApi("our")}
        className={buttonStyles(api === "our")}
      >
        NAT20 API
      </button>
      <button
        disabled={api === "their"}
        onClick={() => handleChangeApi("their")}
        className={buttonStyles(api === "their")}
      >
        Scrum Ritarit API
      </button>
    </div>
  );
}
