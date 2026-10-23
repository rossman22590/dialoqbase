import React from "react";
import { useMessage } from "../../../hooks/useMessage";
import { BotAvatar, PlaygroundMessage } from "./Message";
import { Modal } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { COMMON_PROGRAMMING_LANGUAGES_EXTENSIONS } from "../../../utils/languges";
import { removeUUID } from "../../../utils/filename";
import { useStoreMessage } from "../../../store";
import {
  AcademicCapIcon,
  ArrowDownIcon,
  BookOpenIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const SUGGESTIONS = [
  {
    icon: QuestionMarkCircleIcon,
    title: "What can you help me with?",
    subtitle: "See what this bot knows about",
    prompt: "What can you help me with?",
  },
  {
    icon: BookOpenIcon,
    title: "Summarize the key topics",
    subtitle: "An overview of the bot's sources",
    prompt: "Summarize the key topics covered in your knowledge base.",
  },
  {
    icon: LightBulbIcon,
    title: "Explain a concept simply",
    subtitle: "As if I'm new to the subject",
    prompt:
      "Explain the most important concept from your sources as if I'm new to the subject.",
  },
  {
    icon: AcademicCapIcon,
    title: "Quiz me",
    subtitle: "Three quick questions to check understanding",
    prompt:
      "Give me three quick questions to test my understanding of this material.",
  },
];

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight oil?";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const PlaygroundEmptyState = ({
  onSuggestion,
}: {
  onSuggestion?: (prompt: string) => void;
}) => (
  <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-4 py-12 text-center">
    <div className="animate-fade-up relative">
      <div
        aria-hidden="true"
        className="chat-hero-glow pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2"
      />
      <BotAvatar size="lg" />
    </div>
    <p
      className="animate-fade-up mt-6 text-sm font-medium text-indigo-600 dark:text-indigo-400"
      style={{ animationDelay: "60ms" }}
    >
      {greeting()}
    </p>
    <h2
      className="animate-fade-up mt-1 text-2xl font-semibold tracking-tight text-fg sm:text-[28px]"
      style={{ animationDelay: "100ms" }}
    >
      How can I help you today?
    </h2>
    <p
      className="animate-fade-up mt-2 max-w-md text-sm leading-relaxed text-fg-muted"
      style={{ animationDelay: "140ms" }}
    >
      Test your bot here. Answers use the bot's data sources and model
      settings.
    </p>
    {onSuggestion && (
      <div className="mt-9 grid w-full max-w-2xl gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={suggestion.title}
            type="button"
            onClick={() => onSuggestion(suggestion.prompt)}
            style={{ animationDelay: `${200 + index * 60}ms` }}
            className="animate-fade-up group flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-left shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-indigo-300/70 hover:shadow-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:translate-y-0 dark:hover:border-indigo-400/40"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white group-hover:ring-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20 dark:group-hover:bg-indigo-500 dark:group-hover:text-white">
              <suggestion.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-fg">
                {suggestion.title}
              </span>
              <span className="mt-0.5 block text-xs text-fg-subtle">
                {suggestion.subtitle}
              </span>
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
);

export const PlaygroundChat = ({
  onSuggestion,
  failed,
}: {
  onSuggestion?: (prompt: string) => void;
  // The latest request failed; flag the last reply instead of leaving it
  // stuck in its waiting state.
  failed?: boolean;
}) => {
  const { messages } = useMessage();
  const { textToSpeechEnabled, defaultWebTextToSpeechLanguageType } =
    useStoreMessage();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stickToBottom = React.useRef(true);
  const prevLength = React.useRef(0);
  const lastScrollTop = React.useRef(0);
  const [showJump, setShowJump] = React.useState(false);

  const [sourceData, setSourceData] = React.useState<any>(null);
  const [openSource, setOpenSource] = React.useState(false);
  const [fileType, setFileType] = React.useState<
    "pdf" | "mp3" | "mp4" | "other" | "lang"
  >("other");

  // useMessage mutates the messages array in place while streaming, so watch
  // the length and the last message's text rather than the array identity.
  const lastText = messages[messages.length - 1]?.message;
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const added = messages.length !== prevLength.current;
    prevLength.current = messages.length;
    if (added) {
      stickToBottom.current = true;
    }
    if (stickToBottom.current) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: added ? "smooth" : "auto",
      });
    }
  }, [messages.length, lastText]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Only a scroll up lets go of the bottom. Our own smooth scroll moves
    // down and passes through positions far from the bottom while new
    // tokens keep growing the reply, so distance alone would drop it.
    const scrolledUp = el.scrollTop < lastScrollTop.current;
    lastScrollTop.current = el.scrollTop;
    if (distance < 80) {
      stickToBottom.current = true;
    } else if (scrolledUp) {
      stickToBottom.current = false;
    }
    setShowJump(distance > 240);
  };

  const lastUserMessage = [...messages].reverse().find((m) => !m.isBot)
    ?.message;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        {messages.length === 0 ? (
          <PlaygroundEmptyState onSuggestion={onSuggestion} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
            {messages.map((message, index) => (
              <PlaygroundMessage
                key={index}
                {...message}
                failed={failed && index === messages.length - 1}
                onRetry={
                  onSuggestion && lastUserMessage
                    ? () => onSuggestion(lastUserMessage)
                    : undefined
                }
                onSourceClick={(source) => {
                  const fileInfo = `${
                    source?.metadata?.path || source?.metadata?.source
                  }`;
                  const fileExtension = fileInfo.split(".").pop();
                  if (fileExtension === "pdf") {
                    setFileType("pdf");
                  } else if (
                    fileExtension === "mp3" ||
                    fileExtension === "wav"
                  ) {
                    setFileType("mp3");
                  } else if (fileExtension === "mp4") {
                    setFileType("mp4");
                  } else {
                    const isExist =
                      COMMON_PROGRAMMING_LANGUAGES_EXTENSIONS[
                        `${
                          source?.metadata?.path || source?.metadata?.source
                        }`
                          .split(".")
                          .pop() ||
                          ("" as keyof typeof COMMON_PROGRAMMING_LANGUAGES_EXTENSIONS)
                      ];

                    if (isExist) {
                      setFileType("lang");
                    } else {
                      setFileType("other");
                    }
                  }
                  setSourceData(source);
                  setOpenSource(true);
                }}
                textToSpeech={textToSpeechEnabled}
                textToSpeechType={defaultWebTextToSpeechLanguageType}
              />
            ))}
          </div>
        )}
      </div>
      {showJump && (
        <button
          type="button"
          onClick={() => {
            stickToBottom.current = true;
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="animate-fade-up absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-line bg-surface/90 py-1.5 pl-2.5 pr-3 text-xs font-medium text-fg-muted shadow-float backdrop-blur transition hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowDownIcon className="h-3.5 w-3.5" />
          Jump to latest
        </button>
      )}
      <Modal
        open={openSource}
        // mask={false}
        zIndex={10000}
        onCancel={() => setOpenSource(false)}
        footer={null}
        onOk={() => setOpenSource(false)}
      >
        <div className="mt-6 flex flex-col gap-3">
          <h4 className="flex items-center gap-2 break-all rounded-lg bg-surface-2 px-3 py-2 text-sm font-semibold text-fg">
            {removeUUID(
              `${
                sourceData?.metadata?.path || sourceData?.metadata?.source
              }`.replace("./uploads/", "")
            )}
          </h4>
          {fileType === "pdf" && (
            <>
              <p className="text-sm leading-relaxed text-fg-muted">
                {sourceData?.pageContent}
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-line px-1.5 py-0.5 text-xs text-fg-subtle">
                  {`Page ${sourceData?.metadata?.loc?.pageNumber}`}
                </span>

                <span className="rounded-md border border-line px-1.5 py-0.5 text-xs text-fg-subtle">
                  {`Line ${sourceData?.metadata?.loc?.lines?.from} - ${sourceData?.metadata?.loc?.lines?.to}`}
                </span>
              </div>
            </>
          )}

          {fileType === "other" && (
            <>
              <p className="text-sm leading-relaxed text-fg-muted">
                {sourceData?.pageContent}
              </p>
            </>
          )}
          {fileType === "lang" && (
            <>
              <SyntaxHighlighter
                startingLineNumber={sourceData?.metadata?.loc?.lines?.from}
                showLineNumbers={true}
                language={
                  COMMON_PROGRAMMING_LANGUAGES_EXTENSIONS[
                    `${
                      sourceData?.metadata?.path || sourceData?.metadata?.source
                    }`
                      .split(".")
                      .pop() ||
                      ("" as keyof typeof COMMON_PROGRAMMING_LANGUAGES_EXTENSIONS)
                  ]
                }
                style={nightOwl}
                customStyle={{
                  margin: 0,
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                }}
                codeTagProps={{
                  className: "text-sm",
                }}
              >
                {sourceData?.pageContent}
              </SyntaxHighlighter>
            </>
          )}
          {fileType === "mp3" && (
            <>
              <p className="text-sm leading-relaxed text-fg-muted">
                {sourceData?.pageContent}
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-line px-1.5 py-0.5 text-xs text-fg-subtle">
                  {`Line ${sourceData?.metadata?.loc?.lines?.from} - ${sourceData?.metadata?.loc?.lines?.to}`}
                </span>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
