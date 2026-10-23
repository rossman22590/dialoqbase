import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { PlaygroundNewChat } from "./NewChat";
import { PlaygroundHistoryList } from "./HistoryList";
import PlaygroundFooter from "./Footer";

// Always mounted (the history list also loads the selected chat), so on small
// screens it slides in as a drawer instead of being conditionally rendered.
export const PlaygroundMenu = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[1000] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="menu"
        className={`fixed inset-y-0 left-0 z-[1001] flex w-[288px] max-w-[85vw] flex-col border-r border-line bg-sidebar shadow-float transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-[272px] lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 p-3">
          <PlaygroundNewChat />
          <PlaygroundFooter />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chats"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
          Recent chats
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <PlaygroundHistoryList />
        </div>
      </aside>
    </>
  );
};
