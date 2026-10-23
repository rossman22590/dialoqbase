import React from "react";
import { useLocation } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useMessage } from "../../../hooks/useMessage";
import { PlaygroundChat } from "./Chat";
import { PlaygroundgForm, PlaygroundPrefill } from "./Form";
import { PlaygroundMenu } from "./Menu";
import { PlaygroundNewChat } from "./NewChat";
import { Skeleton } from "antd";

export const PlaygroundBody = () => {
  const { isLoading } = useMessage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [prefill, setPrefill] = React.useState<PlaygroundPrefill | null>(null);

  // Close the mobile history drawer after picking a chat or starting a new one.
  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden bg-white dark:bg-[#171717] md:ml-16">
      <PlaygroundMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 px-2 dark:border-white/10 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <Bars3Icon className="h-5 w-5" />
            Chats
          </button>
          <div className="flex-1" />
          <PlaygroundNewChat variant="icon" />
        </div>

        {isLoading ? (
          <div className="mx-auto w-full max-w-3xl p-8">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : (
          <>
            <PlaygroundChat
              onSuggestion={(text) => setPrefill({ text, key: Date.now() })}
            />
            <PlaygroundgForm prefill={prefill} />
          </>
        )}
      </div>
    </div>
  );
};
