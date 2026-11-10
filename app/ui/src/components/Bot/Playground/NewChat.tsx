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
      className="flex h-[38px] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <PlusIcon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      New chat
    </button>
  );
};
