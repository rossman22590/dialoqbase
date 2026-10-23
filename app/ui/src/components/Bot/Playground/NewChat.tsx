import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "antd";
import { useMessage } from "../../../hooks/useMessage";
import { useNavigate, useParams } from "react-router-dom";

export const PlaygroundNewChat = ({
  variant = "full",
}: {
  variant?: "full" | "icon";
}) => {
  const { setHistory, setMessages, setHistoryId } = useMessage();

  const navigate = useNavigate();

  const params = useParams<{ id: string }>();

  const handleClick = () => {
    setHistoryId(null);
    setMessages([]);
    setHistory([]);
    navigate(`/bot/${params.id}`);
  };

  if (variant === "icon") {
    return (
      <Tooltip title="New chat">
        <button
          type="button"
          onClick={handleClick}
          aria-label="New chat"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-3 text-sm font-medium text-white shadow-brand ring-1 ring-inset ring-white/10 transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
    >
      <PlusIcon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      New chat
    </button>
  );
};
