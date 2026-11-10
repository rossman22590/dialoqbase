import {
  ArrowPathIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { Message } from "../../../store";
import Markdown from "../../Common/Markdown";
import React from "react";
import { useSpeechSynthesis } from "../../../hooks/useSpeechSynthesis";
import { useElevenLabsTTS } from "../../../hooks/useElevenLabsTTS";
import { Tooltip, notification } from "antd";
import api from "../../../services/api";
import { clipbardCopy } from "../../../utils/clipboard";
import { BotAvatarTile } from "../../../Layout/BotLayout";
import { sourceLabel } from "./useCurrentBot";

type Props = Message & {
  onSourceClick(source: any): void;
  textToSpeech: boolean;
  textToSpeechType: string;
  hideCopy?: boolean;
  botAvatar?: JSX.Element;
  userAvatar?: JSX.Element;
  botName?: string;
  botId?: string;
  // The request for this reply failed before it finished.
  failed?: boolean;
  onRetry?: () => void;
};

// useMessage appends this cursor while a streamed answer is arriving and
// shows "Hold on..." while a non-streamed answer is pending.
const STREAM_CURSOR = "▋";
const PENDING_TEXT = "Hold on...";

const CHAT_PROSE =
  "chat-prose prose max-w-none break-words dark:prose-invert prose-pre:p-0 prose-pre:bg-transparent";

// The bot's letter tile, same as the sidebar's bot switcher.
export const BotAvatar = ({
  name,
  id,
  size = 28,
}: {
  name?: string;
  id?: string;
  size?: number;
}) => <BotAvatarTile name={name || "Bot"} id={id} size={size} />;

// Shown while the answer is pending. The stream doesn't say which sources are
// being read, so this stays generic.
export const RetrievalStatus = ({ botName }: { botName?: string }) => (
  <div role="status" className="flex flex-col gap-2 pt-1">
    <p className="m-0 flex items-center gap-2 text-[13px] font-medium text-fg-muted">
      {botName ? `Searching ${botName}'s sources…` : "Searching sources…"}
      <span aria-hidden="true" className="flex items-center gap-1">
        <span className="typing-dot h-1 w-1 rounded-full bg-fg-subtle" />
        <span className="typing-dot h-1 w-1 rounded-full bg-fg-subtle" />
        <span className="typing-dot h-1 w-1 rounded-full bg-fg-subtle" />
      </span>
    </p>
  </div>
);

const ActionButton = ({
  title,
  onClick,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <Tooltip title={title} mouseEnterDelay={0.25}>
    <button
      type="button"
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
    >
      {children}
    </button>
  </Tooltip>
);

const AvatarSlot = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden">
    {children}
  </div>
);

export const PlaygroundMessage = (props: Props) => {
  const [isBtnPressed, setIsBtnPressed] = React.useState(false);
  const [showSources, setShowSources] = React.useState(false);

  const { speak, cancel, speaking: isWebSpeaking } = useSpeechSynthesis();
  const {
    speak: speakElevenLabs,
    cancel: cancelElevenLabs,
    isPlaying: isElevenLabsPlaying,
    loading: isElevenLabsLoading,
  } = useElevenLabsTTS();

  if (!props.isBot) {
    return (
      <div className="chat-msg-in-user flex w-full justify-end gap-3">
        <div className="min-w-0 max-w-[80%] rounded-2xl bg-surface-2 px-3.5 py-2.5 text-fg">
          <Markdown
            className={`${CHAT_PROSE} chat-prose-user`}
            message={props.message}
          />
        </div>
        {props.userAvatar && <AvatarSlot>{props.userAvatar}</AvatarSlot>}
      </div>
    );
  }

  const isWaiting =
    props.message === STREAM_CURSOR || props.message === PENDING_TEXT;
  const isStreaming = !isWaiting && props.message.endsWith(STREAM_CURSOR);
  const text = isStreaming ? props.message.slice(0, -1) : props.message;
  const failed = !!props.failed && (isWaiting || isStreaming);
  const done = !isWaiting && !isStreaming;
  const sources = props.sources || [];
  const hasSources = sources.length > 0;
  const showWebTTS = props.textToSpeech && props.textToSpeechType === "web_api";
  const showElevenLabsTTS =
    props.textToSpeech && props.textToSpeechType === "elevenlabs";
  const hasActions =
    !props.hideCopy || showWebTTS || showElevenLabsTTS || !!props.id;

  return (
    <div className="chat-msg-in flex w-full gap-3">
      {props.botAvatar ? (
        <AvatarSlot>{props.botAvatar}</AvatarSlot>
      ) : (
        <BotAvatar name={props.botName} id={props.botId} />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {hasSources && done && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              aria-expanded={showSources}
              className="flex items-center gap-1.5 self-start rounded text-[13px] text-fg-muted transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <CheckIcon
                className="h-3.5 w-3.5 text-green-700 dark:text-green-400"
                strokeWidth={2.2}
              />
              Searched {sources.length}{" "}
              {sources.length === 1 ? "source" : "sources"}
              <ChevronDownIcon
                className={`h-3 w-3 transition-transform duration-200 ${
                  showSources ? "rotate-180" : ""
                }`}
              />
            </button>
            {showSources && (
              <ul className="m-0 flex list-none flex-col gap-1 border-l-2 border-line py-0 pl-3 text-[13px] text-fg-muted">
                {sources.map((source, index) => (
                  <li key={index} className="min-w-0">
                    <button
                      type="button"
                      onClick={props.onSourceClick.bind(null, source)}
                      className="block max-w-full truncate text-left hover:text-fg focus:outline-none focus-visible:underline"
                    >
                      {sourceLabel(source)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {isWaiting && !failed ? (
          <RetrievalStatus botName={props.botName} />
        ) : (
          !isWaiting && (
            <div className={isStreaming && !failed ? "chat-streaming" : ""}>
              <Markdown className={CHAT_PROSE} message={text} />
            </div>
          )
        )}

        {failed && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              {isStreaming
                ? "The response was interrupted."
                : "Couldn't get a response. Check your connection and try again."}
            </span>
            {props.onRetry && (
              <button
                type="button"
                onClick={props.onRetry}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-surface px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-200 dark:hover:bg-white/5"
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
                Edit &amp; retry
              </button>
            )}
          </div>
        )}

        {hasSources && done && (
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, index) => {
              const name = sourceLabel(source);
              return (
                <button
                  key={index}
                  type="button"
                  title={name}
                  onClick={props.onSourceClick.bind(null, source)}
                  className="inline-flex max-w-[240px] items-center gap-1.5 rounded-full border border-line py-1 pl-1 pr-2.5 text-xs text-fg-muted transition-colors hover:border-line-strong hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-surface-2 text-[11px] font-semibold text-fg">
                    {index + 1}
                  </span>
                  <span className="truncate">{name}</span>
                </button>
              );
            })}
          </div>
        )}

        {hasActions && done && (
          <div className="-ml-1.5 flex items-center gap-0.5">
            {!props.hideCopy && (
              <ActionButton
                title={isBtnPressed ? "Copied!" : "Copy"}
                onClick={async () => {
                  await clipbardCopy(props.message);
                  setIsBtnPressed(true);
                  setTimeout(() => {
                    setIsBtnPressed(false);
                  }, 4000);
                }}
              >
                {!isBtnPressed ? (
                  <ClipboardIcon className="h-[15px] w-[15px]" />
                ) : (
                  <CheckIcon className="h-[15px] w-[15px] text-green-600" />
                )}
              </ActionButton>
            )}

            {showWebTTS && (
              <ActionButton
                title={isWebSpeaking ? "Stop reading" : "Read aloud"}
                onClick={() => {
                  if (!isWebSpeaking) {
                    speak({
                      text: props.message,
                    });
                  } else {
                    cancel();
                  }
                }}
              >
                {!isWebSpeaking ? (
                  <SpeakerWaveIcon className="h-[15px] w-[15px]" />
                ) : (
                  <StopIcon className="h-[15px] w-[15px] text-red-500" />
                )}
              </ActionButton>
            )}

            {showElevenLabsTTS && (
              <ActionButton
                title={isElevenLabsPlaying ? "Stop reading" : "Read aloud"}
                disabled={isElevenLabsLoading}
                onClick={() => {
                  if (!isElevenLabsPlaying) {
                    speakElevenLabs({
                      text: props.message,
                    });
                  } else {
                    cancelElevenLabs();
                  }
                }}
              >
                {!isElevenLabsLoading ? (
                  !isElevenLabsPlaying ? (
                    <SpeakerWaveIcon className="h-[15px] w-[15px]" />
                  ) : (
                    <StopIcon className="h-[15px] w-[15px] text-red-500" />
                  )
                ) : (
                  <svg
                    className="h-[15px] w-[15px] animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </ActionButton>
            )}
            {props.id && (
              <FeedbackButtons id={props.id} initial={props.feedback} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ThumbIcon = ({ down = false }: { down?: boolean }) => (
  <svg
    aria-hidden="true"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
    style={down ? { transform: "rotate(180deg)" } : undefined}
  >
    <path d="M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v4h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 20H7" />
  </svg>
);

// Thumbs up/down on an answer, saved per message. Clicking the active one
// clears it.
const FeedbackButtons = ({
  id,
  initial,
}: {
  id: string;
  initial?: string | null;
}) => {
  const [value, setValue] = React.useState<string | null>(initial ?? null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setValue(initial ?? null);
  }, [id, initial]);

  const rate = async (next: "up" | "down") => {
    const feedback = value === next ? null : next;
    const previous = value;
    setValue(feedback);
    setSaving(true);
    try {
      await api.put(`/bot/feedback/${id}`, { feedback });
    } catch {
      setValue(previous);
      notification.error({ message: "Couldn't save your rating" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ActionButton
        title={value === "up" ? "Remove rating" : "Good answer"}
        onClick={() => rate("up")}
        disabled={saving}
      >
        <span className={value === "up" ? "text-indigo-600 dark:text-indigo-400" : ""}>
          <ThumbIcon />
        </span>
      </ActionButton>
      <ActionButton
        title={value === "down" ? "Remove rating" : "Bad answer"}
        onClick={() => rate("down")}
        disabled={saving}
      >
        <span className={value === "down" ? "text-red-600 dark:text-red-400" : ""}>
          <ThumbIcon down />
        </span>
      </ActionButton>
    </>
  );
};
