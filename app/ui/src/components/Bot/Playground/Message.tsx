import {
  ArrowPathIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  SpeakerWaveIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/20/solid";
import { Message } from "../../../store";
import Markdown from "../../Common/Markdown";
import React from "react";
import { removeUUID } from "../../../utils/filename";
import { useSpeechSynthesis } from "../../../hooks/useSpeechSynthesis";
import { useElevenLabsTTS } from "../../../hooks/useElevenLabsTTS";
import { Tooltip } from "antd";
import { clipbardCopy } from "../../../utils/clipboard";

type Props = Message & {
  onSourceClick(source: any): void;
  textToSpeech: boolean;
  textToSpeechType: string;
  hideCopy?: boolean;
  botAvatar?: JSX.Element;
  userAvatar?: JSX.Element;
  botName?: string;
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

export const BotAvatar = ({
  size = "md",
  live = false,
}: {
  size?: "md" | "lg";
  live?: boolean;
}) => (
  <div
    className={`relative flex shrink-0 items-center justify-center bg-gradient-to-br from-violet-500 via-indigo-600 to-fuchsia-600 text-white shadow-brand ring-1 ring-inset ring-white/20 ${
      size === "lg" ? "h-14 w-14 rounded-2xl" : "h-8 w-8 rounded-[10px]"
    } ${live ? "chat-avatar-live" : ""}`}
  >
    <SparklesIcon className={size === "lg" ? "h-7 w-7" : "h-4 w-4"} />
  </div>
);

export const TypingIndicator = () => (
  <div
    className="flex h-7 items-center gap-2.5"
    role="status"
    aria-label="Assistant is thinking"
  >
    <span className="flex items-center gap-1">
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
    </span>
    <span className="chat-shimmer-text text-sm font-medium">Thinking…</span>
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
      className="flex h-7 w-7 items-center justify-center rounded-lg text-fg-subtle transition-all duration-150 hover:bg-surface-2 hover:text-fg active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
    >
      {children}
    </button>
  </Tooltip>
);

const AvatarSlot = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden [&_svg]:h-7 [&_svg]:w-7">
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
        <div className="min-w-0 max-w-[85%] rounded-[20px] rounded-br-md bg-gradient-to-br from-indigo-500 to-indigo-600 px-4 py-2.5 text-white shadow-brand sm:max-w-[75%]">
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
  const working = (isWaiting || isStreaming) && !failed;
  const done = !isWaiting && !isStreaming;
  const hasSources = !!props.sources && props.sources.length > 0;
  const showWebTTS = props.textToSpeech && props.textToSpeechType === "web_api";
  const showElevenLabsTTS =
    props.textToSpeech && props.textToSpeechType === "elevenlabs";
  const hasActions = !props.hideCopy || showWebTTS || showElevenLabsTTS;

  return (
    <div className="chat-msg-in group flex w-full gap-3.5">
      {props.botAvatar ? (
        <AvatarSlot>{props.botAvatar}</AvatarSlot>
      ) : (
        <BotAvatar live={working} />
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex h-8 items-center text-[13px] font-semibold tracking-tight text-fg">
          {props.botName || "Assistant"}
        </div>

        {isWaiting && !failed ? (
          <TypingIndicator />
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
            className="animate-fade-up mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-red-700 shadow-soft ring-1 ring-red-200 transition hover:bg-red-50 dark:bg-white/5 dark:text-red-200 dark:ring-red-500/30 dark:hover:bg-white/10"
              >
                <ArrowPathIcon className="h-3.5 w-3.5" />
                Edit &amp; retry
              </button>
            )}
          </div>
        )}

        {hasSources && done && (
          <div className="mt-3.5">
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              aria-expanded={showSources}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-fg-muted shadow-soft transition-colors hover:border-line-strong hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <DocumentTextIcon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              {props.sources.length}{" "}
              {props.sources.length === 1 ? "source" : "sources"}
              <ChevronDownIcon
                className={`h-3 w-3 transition-transform duration-200 ${
                  showSources ? "rotate-180" : ""
                }`}
              />
            </button>
            {showSources && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {props.sources.map((source, index) => {
                  const name = removeUUID(
                    `${
                      source?.metadata?.path || source?.metadata?.source
                    }`.replace("./uploads/", "")
                  );
                  return (
                    <button
                      key={index}
                      type="button"
                      title={name}
                      onClick={props.onSourceClick.bind(null, source)}
                      style={{ animationDelay: `${index * 40}ms` }}
                      className="animate-scale-in group/source inline-flex max-w-[16rem] items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2 py-1 text-xs text-fg-muted transition-all hover:-translate-y-px hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-surface text-[9px] font-semibold text-fg-subtle ring-1 ring-line group-hover/source:text-indigo-600 dark:group-hover/source:text-indigo-300">
                        {index + 1}
                      </span>
                      <span className="truncate">{name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {hasActions && done && (
          <div className="-ml-1.5 mt-2 flex translate-y-0.5 items-center gap-0.5 opacity-0 transition-all duration-200 ease-out focus-within:translate-y-0 focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
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
                  <ClipboardIcon className="h-4 w-4" />
                ) : (
                  <CheckIcon className="animate-scale-in h-4 w-4 text-emerald-500" />
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
                  <SpeakerWaveIcon className="h-4 w-4" />
                ) : (
                  <StopIcon className="h-4 w-4 text-red-500" />
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
                    <SpeakerWaveIcon className="h-4 w-4" />
                  ) : (
                    <StopIcon className="h-4 w-4 text-red-500" />
                  )
                ) : (
                  <svg
                    className="h-4 w-4 animate-spin"
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
          </div>
        )}
      </div>
    </div>
  );
};
