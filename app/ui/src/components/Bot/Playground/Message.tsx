import {
  CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  DocumentTextIcon,
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
};

// useMessage appends this cursor while a streamed answer is arriving and
// shows "Hold on..." while a non-streamed answer is pending.
const STREAM_CURSOR = "▋";
const PENDING_TEXT = "Hold on...";

const CHAT_PROSE =
  "chat-prose prose max-w-none break-words dark:prose-invert prose-pre:p-0 prose-pre:bg-transparent";

export const BotAvatar = ({ size = "md" }: { size?: "md" | "lg" }) => (
  <div
    className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm ${
      size === "lg" ? "h-12 w-12 rounded-2xl" : "h-8 w-8 rounded-lg"
    }`}
  >
    <SparklesIcon className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
  </div>
);

export const TypingIndicator = () => (
  <div
    className="flex h-7 items-center gap-1"
    role="status"
    aria-label="Assistant is typing"
  >
    <span className="typing-dot h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
    <span className="typing-dot h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
    <span className="typing-dot h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500" />
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
  <Tooltip title={title} mouseEnterDelay={0.3}>
    <button
      type="button"
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 dark:text-gray-500 dark:hover:bg-white/10 dark:hover:text-gray-200"
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
      <div className="chat-msg-in flex w-full justify-end gap-3">
        <div className="min-w-0 max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-white shadow-sm sm:max-w-[75%]">
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
  const hasSources = !!props.sources && props.sources.length > 0;
  const showWebTTS = props.textToSpeech && props.textToSpeechType === "web_api";
  const showElevenLabsTTS =
    props.textToSpeech && props.textToSpeechType === "elevenlabs";
  const hasActions = !props.hideCopy || showWebTTS || showElevenLabsTTS;

  return (
    <div className="chat-msg-in group flex w-full gap-3">
      {props.botAvatar ? (
        <AvatarSlot>{props.botAvatar}</AvatarSlot>
      ) : (
        <BotAvatar />
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex h-8 items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
          {props.botName || "Assistant"}
        </div>

        {isWaiting ? (
          <TypingIndicator />
        ) : (
          <div
            className={`text-gray-800 dark:text-gray-100 ${
              isStreaming ? "chat-streaming" : ""
            }`}
          >
            <Markdown className={CHAT_PROSE} message={text} />
          </div>
        )}

        {hasSources && !isWaiting && !isStreaming && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              aria-expanded={showSources}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-white/10 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5"
            >
              <DocumentTextIcon className="h-3.5 w-3.5" />
              {props.sources.length}{" "}
              {props.sources.length === 1 ? "source" : "sources"}
              <ChevronDownIcon
                className={`h-3 w-3 transition-transform ${
                  showSources ? "rotate-180" : ""
                }`}
              />
            </button>
            {showSources && (
              <div className="mt-2 flex flex-wrap gap-1.5">
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
                      className="max-w-[16rem] truncate rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {hasActions && !isWaiting && !isStreaming && (
          <div className="-ml-1.5 mt-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
            {!props.hideCopy && (
              <ActionButton
                title={isBtnPressed ? "Copied" : "Copy"}
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
                  <CheckIcon className="h-4 w-4 text-green-500" />
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
