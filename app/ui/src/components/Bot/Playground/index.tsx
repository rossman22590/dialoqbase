import React from "react";
import { useLocation } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useMessage } from "../../../hooks/useMessage";
import { PlaygroundChat } from "./Chat";
import { PlaygroundgForm, PlaygroundPrefill } from "./Form";
import { PlaygroundMenu } from "./Menu";
import { PlaygroundNewChat } from "./NewChat";

const ChatSkeleton = () => (
  <div
    className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pt-10 sm:px-6"
    aria-busy="true"
    aria-label="Loading conversation"
  >
    <div className="flex justify-end">
      <div className="skeleton h-10 w-48 rounded-[20px] rounded-br-md" />
    </div>
    <div className="flex gap-3.5">
      <div className="skeleton h-8 w-8 shrink-0 rounded-[10px]" />
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
  const { isLoading } = useMessage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<PlaygroundPrefill | null>(null);
  const [failed, setFailed] = React.useState(false);

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
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden bg-canvas md:ml-16">
      <PlaygroundMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line bg-canvas/80 px-2 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Bars3Icon className="h-5 w-5" />
            Chats
          </button>
          <div className="flex-1" />
          <PlaygroundNewChat variant="icon" />
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
      </div>
    </div>
  );
};
