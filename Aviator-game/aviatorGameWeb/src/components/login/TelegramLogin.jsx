import { FaTelegramPlane } from "react-icons/fa";
import { toast } from "react-toastify";

export default function TelegramLogin() {
  const handleTelegramLogin = () => {
    const botUsername =
      import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "Aviator_auth_bot";

    // Open Telegram bot directly for login
    const telegramUrl = `https://t.me/${botUsername}?start=login`;
    window.open(telegramUrl, "_blank");

    toast.info("Complete login in Telegram bot, then refresh this page", {
      autoClose: 5000,
    });
  };

  return (
    <button
      onClick={handleTelegramLogin}
      className="bg-sky-500 text-white p-2 w-full rounded-sm text-md flex items-center justify-center gap-2 hover:bg-sky-600 transition"
    >
      <FaTelegramPlane className="text-xl" />
      Telegram
    </button>
  );
}
