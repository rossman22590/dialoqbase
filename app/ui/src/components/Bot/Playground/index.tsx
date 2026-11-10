import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useMessage } from "../../../hooks/useMessage";
import { PlaygroundChat } from "./Chat";
import { PlaygroundgForm, PlaygroundPrefill } from "./Form";
import { PlaygroundMenu } from "./Menu";
import { PlaygroundNewChat } from "./NewChat";
import { cleanModelName, useCurrentBot } from "./useCurrentBot";
import { fetchPlaygroundHistory } from "./HistoryList";

const ChatSkeleton = () => (
  <div
    className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-7 px-4 pt-7 sm:px-5"
    aria-busy="true"
    aria-label="Loading conversation"
  >
    <div className="flex justify-end">
      <div className="skeleton h-10 w-48 rounded-2xl" />
    </div>
    <div className="flex gap-3">
      <div className="skeleton h-7 w-7 shrink-0 rounded-[7px]" />
      <div className="flex flex-1 flex-col gap-2.5 pt-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-[92%] rounded" />
        <div className="skeleton h-3 w-[84%] rounded" />
        <div className="skeleton h-3 w-[60%] rounded" />
      </div>
    </div>
  </div>
);

export const PlaygroundBody = () => {
  const { isLoading, historyId } = useMessage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<PlaygroundPrefill | null>(null);
  const [failed, setFailed] = React.useState(false);
  const params = useParams<{ id: string; history_id?: string }>();
  const bot = useCurrentBot();
  const model = cleanModelName(bot.model);

  // Read-only view of the history query PlaygroundHistoryList runs, for the
  // current chat's title.
  const { data: historyData } = useQuery(
    ["getBotPlaygroundHistory", params.id, params.history_id],
    () => fetchPlaygroundHistory(params.id!, params.history_id),
    { enabled: false, keepPreviousData: true }
  );
  const currentId = params.history_id || historyId;
  const title =
    (currentId &&
      historyData?.history?.find((h) => h.id === currentId)?.title) ||
    (params.history_id ? "Chat" : "New chat");

  // Close the mobile history drawer after picking a chat or starting a new one.
  React.useEffect(() => {
    setMenuOpen(false);
    setFailed(false);
  }, [location.pathname]);

  const fillComposer = React.useCallback(
    (text: string) => setPrefill({ text, key: Date.now() }),
    []
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden bg-canvas">
      <PlaygroundMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <section
        aria-label="Chat"
        className="relative flex min-w-0 flex-1 flex-col"
      >
        <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-line px-2 sm:px-5 lg:gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open chats"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <h1 className="m-0 min-w-0 flex-1 truncate text-[15px] font-semibold text-fg">
            {title}
          </h1>
          {model && (
            <span
              className="hidden max-w-[40%] shrink-0 truncate rounded-full border border-line px-2 py-0.5 text-xs text-fg-muted sm:inline-block"
              title={model}
            >
              {model}
            </span>
          )}
          <div className="lg:hidden">
            <PlaygroundNewChat variant="icon" />
          </div>
        </div>

        {isLoading ? (
          <ChatSkeleton />
        ) : (
          <>
            <PlaygroundChat onSuggestion={fillComposer} failed={failed} />
            <PlaygroundgForm
              prefill={prefill}
              onSendStart={() => setFailed(false)}
              onSendError={() => setFailed(true)}
            />
          </>
        )}
      </section>
    </div>
  );
};
