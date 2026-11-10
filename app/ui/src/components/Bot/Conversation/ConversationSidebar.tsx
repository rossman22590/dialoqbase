import React from "react";
import { ConversationsByType } from "../../../@types/conversation";
import { getOSAndBrowser } from "../../../utils/useragent";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
dayjs.extend(relativeTime);

// The channels the conversations API can list (one request per channel).
export const CONVERSATION_CHANNELS = [
  { label: "Website", value: "website" },
  { label: "Telegram", value: "telegram" },
  { label: "Discord", value: "discord" },
  { label: "WhatsApp", value: "whatsapp" },
];

export const channelLabel = (value: string) =>
  CONVERSATION_CHANNELS.find((c) => c.value === value)?.label || value;

export const conversationTitle = (item?: ConversationsByType) =>
  item?.metdata?.user_agent
    ? getOSAndBrowser(item.metdata.user_agent)
    : item?.metdata?.info || "Anonymous";

const shortTime = (date?: Date | string) => {
  if (!date) return "";
  const d = dayjs(date);
  if (!d.isValid()) return "";
  const today = dayjs().startOf("day");
  if (!d.isBefore(today)) return d.format("HH:mm");
  if (!d.isBefore(today.subtract(1, "day"))) return "Yesterday";
  if (d.year() === dayjs().year()) return d.format("MMM D");
  return d.format("MMM D, YYYY");
};

// The latest thing the visitor asked, for the list preview.
const lastQuestion = (item: ConversationsByType) => {
  for (let i = item.all_messages.length - 1; i >= 0; i--) {
    const m = item.all_messages[i];
    if (!m.isBot && m.message) return m.message;
  }
  return item.human || item.bot || "";
};

export const ConversationSidebar = ({
  data,
  selectedId,
  onSelect,
  onChannelChange,
  defaultChannel,
  className = "",
}: {
  data: ConversationsByType[];
  selectedId: string | null;
  onSelect: (chatId: string) => void;
  onChannelChange: (value: string) => void;
  defaultChannel: string;
  className?: string;
}) => {
  const [_, setSearchParams] = useSearchParams();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        conversationTitle(item).toLowerCase().includes(q) ||
        item.all_messages.some((m) =>
          (m.message || "").toLowerCase().includes(q)
        )
    );
  }, [data, query]);

  return (
    <aside
      aria-label="Conversation list"
      className={`flex-col border-line bg-canvas lg:w-[300px] lg:shrink-0 lg:border-r ${className}`}
    >
      <div className="flex flex-col gap-2.5 border-b border-line p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="m-0 text-lg font-semibold text-fg">Conversations</h1>
          <span className="text-xs tabular-nums text-fg-subtle">
            {data.length}
          </span>
        </div>
        <input
          type="search"
          aria-label="Search conversations"
          placeholder="Search messages"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ui-input h-9 text-[13px]"
        />
        <div
          role="group"
          aria-label="Channel"
          className="flex flex-wrap gap-1.5"
        >
          {CONVERSATION_CHANNELS.map((channel) => {
            const active = channel.value === defaultChannel;
            return (
              <button
                key={channel.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  if (active) return;
                  onChannelChange(channel.value);
                  setSearchParams({ channel: channel.value });
                }}
                className={`h-7 rounded-full px-2.5 text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active
                    ? "bg-fg text-canvas"
                    : "border border-line bg-surface text-fg hover:bg-surface-2"
                }`}
              >
                {channel.label}
              </button>
            );
          })}
        </div>
      </div>

      <nav
        aria-label="Conversations"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        {data.length === 0 && (
          <div className="px-4 pt-10 text-center">
            <p className="text-sm font-medium text-fg">No conversations yet</p>
            <p className="mt-1 text-xs leading-relaxed text-fg-subtle">
              Chats from {channelLabel(defaultChannel)} will show up here.
            </p>
          </div>
        )}
        {data.length > 0 && filtered.length === 0 && (
          <p className="px-4 pt-10 text-center text-sm text-fg-subtle">
            No conversations match “{query.trim()}”.
          </p>
        )}
        {filtered.map((item) => {
          const isActive = selectedId === item.chat_id;
          const count = item.all_messages.length;
          return (
            <button
              type="button"
              onClick={() => onSelect(item.chat_id)}
              key={item.chat_id}
              aria-current={isActive ? "true" : undefined}
              className={`flex w-full flex-col gap-[3px] border-b border-line/70 px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                isActive
                  ? "bg-indigo-50/70 shadow-[inset_3px_0_0_theme(colors.indigo.600)] dark:bg-indigo-500/10 dark:shadow-[inset_3px_0_0_theme(colors.indigo.400)]"
                  : "hover:bg-surface-2"
              }`}
            >
              <span className="flex min-w-0 justify-between gap-2 text-[13px]">
                <span className="truncate font-semibold text-fg">
                  {conversationTitle(item)}
                </span>
                <span className="shrink-0 tabular-nums text-fg-subtle">
                  {shortTime(item.created_at)}
                </span>
              </span>
              <span className="truncate text-[13px] text-fg-muted">
                {lastQuestion(item)}
              </span>
              <span className="text-xs text-fg-subtle">
                {channelLabel(defaultChannel)} · {count}{" "}
                {count === 1 ? "message" : "messages"}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
