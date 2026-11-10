import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import { ConversationsByType } from "../../../@types/conversation";
import Markdown from "../../Common/Markdown";
import { sourceName } from "../Playground/useCurrentBot";
import { channelLabel, conversationTitle } from "./ConversationSidebar";

const BOT_PROSE =
  "chat-prose prose max-w-none break-words dark:prose-invert prose-pre:p-0 prose-pre:bg-transparent !text-sm !leading-[1.6]";

const sourcesLine = (sources: any) => {
  if (!Array.isArray(sources) || sources.length === 0) return null;
  const names = Array.from(new Set(sources.map((s) => sourceName(s))));
  return `${names.length === 1 ? "Source" : "Sources"}: ${names.join(", ")}`;
};

export const ConversationInfo = ({
  data,
  channel,
  onBack,
}: {
  data: ConversationsByType;
  channel: string;
  // Small screens show the list or the transcript; this returns to the list.
  onBack?: () => void;
}) => {
  const params = useParams<{ id: string }>();
  const count = data.all_messages.length;

  return (
    <section
      aria-label="Transcript"
      className="flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3.5 sm:px-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="-ml-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg lg:hidden"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        )}
        <h2 className="m-0 min-w-0 flex-1 truncate text-[15px] font-semibold text-fg">
          {conversationTitle(data)}
        </h2>
        <span className="basis-full text-[13px] text-fg-muted sm:basis-auto">
          {channelLabel(channel)}
          {data?.created_at &&
            ` · ${dayjs(data.created_at).format("MMM D, YYYY h:mm A")}`}
          {` · ${count} ${count === 1 ? "message" : "messages"}`}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex max-w-[720px] flex-col gap-[18px] p-4 text-sm leading-[1.6] text-fg sm:p-6">
          {data.all_messages.map((m, index) =>
            m.isBot ? (
              <div
                key={index}
                className="flex max-w-[85%] flex-col gap-1.5 self-start"
              >
                <Markdown className={BOT_PROSE} message={m.message || ""} />
                {sourcesLine(m.sources) && (
                  <span className="text-xs text-fg-subtle">
                    {sourcesLine(m.sources)}
                  </span>
                )}
              </div>
            ) : (
              <div
                key={index}
                className="max-w-[80%] self-end whitespace-pre-wrap break-words rounded-[14px] bg-surface-2 px-[13px] py-[9px]"
              >
                {m.message}
              </div>
            )
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] border border-dashed border-line-strong px-4 py-3.5 text-[13px]">
            <span className="min-w-[200px] flex-1 text-fg-muted">
              Missing info? Add a source so the bot can answer next time.
            </span>
            <Link
              to={`/bot/${params.id}/data-sources`}
              className="font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Add a source →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
