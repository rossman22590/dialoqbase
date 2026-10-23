import React from "react";
import { ConversationsByType } from "../../../@types/conversation";
import { Select } from "antd";
import { getOSAndBrowser } from "../../../utils/useragent";
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
dayjs.extend(relativeTime);

export const ConversationSidebar = ({
  data,
  defaultIndex,
  setDefaultIndex,
  onChannelChange,
  defaultChannel,
}: {
  data: ConversationsByType[];
  defaultIndex: number | null;
  setDefaultIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onChannelChange: (value: string) => void;
  defaultChannel: string;
}) => {
  const [hideMenu] = React.useState(false);
  const [_, setSearchParams] = useSearchParams();
  return (
    <div
      id="menu"
      className={`fixed z-[999] flex flex-col border-r border-line bg-sidebar transition-transform max-md:w-3/4 md:bottom-0 md:top-14 md:w-[320px] ${
        hideMenu ? "translate-x-[-100%]" : "translate-x-[0%]"
      }`}
    >
      <div className="space-y-3 border-b border-line px-4 pb-4 pt-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold tracking-tight text-fg">
            Conversations
          </h2>
          <span className="ui-badge ui-badge-neutral tabular-nums">
            {data.length}
          </span>
        </div>
        <Select
          options={[
            { label: "Website", value: "website" },
            { label: "Telegram", value: "telegram" },
            { label: "Discord", value: "discord" },
            { label: "WhatsApp", value: "whatsapp" },
          ]}
          onChange={(value) => {
            onChannelChange(value);
            setSearchParams({ channel: value });
          }}
          defaultValue={defaultChannel}
          style={{ width: "100%" }}
        />
      </div>

      <nav
        aria-label="Conversations"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2"
      >
        {data.length === 0 && (
          <div className="flex flex-col items-center px-4 pt-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface shadow-soft ring-1 ring-line">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-fg-subtle" />
            </span>
            <p className="mt-3 text-sm font-medium text-fg">
              No conversations yet
            </p>
            <p className="mt-1 text-xs leading-relaxed text-fg-subtle">
              Chats from this channel will show up here.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-0.5 text-sm">
          {data.map((item, index) => {
            const isActive = defaultIndex === index;
            return (
              <button
                type="button"
                onClick={() => setDefaultIndex(index)}
                key={index}
                aria-current={isActive ? "true" : undefined}
                className={`group relative w-full rounded-lg px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                  isActive
                    ? "bg-surface shadow-soft ring-1 ring-line before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-full before:bg-indigo-500"
                    : "hover:bg-surface-2"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`truncate text-[13px] ${
                      isActive ? "font-semibold text-fg" : "font-medium text-fg"
                    }`}
                  >
                    {item?.metdata?.user_agent
                      ? getOSAndBrowser(item?.metdata?.user_agent)
                      : item?.metdata?.info || "Anonymous"}
                  </h3>
                  <span className="shrink-0 text-[11px] tabular-nums text-fg-subtle">
                    {item?.created_at && dayjs(item?.created_at).fromNow()}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-col gap-1">
                  <div className="flex min-w-0 flex-row items-center gap-2">
                    <UserIcon className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
                    <p className="truncate text-xs text-fg-muted">
                      {item?.human}
                    </p>
                  </div>
                  <div className="flex min-w-0 flex-row items-center gap-2">
                    <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
                    <p className="truncate text-xs text-fg-subtle">
                      {item?.bot}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
