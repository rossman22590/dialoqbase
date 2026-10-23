import React from "react";
import { useMessage } from "../../../hooks/useMessage";
import { BotAvatar, PlaygroundMessage } from "./Message";
import { Modal } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { COMMON_PROGRAMMING_LANGUAGES_EXTENSIONS } from "../../../utils/languges";
import { removeUUID } from "../../../utils/filename";
import { useStoreMessage } from "../../../store";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

const SUGGESTIONS = [
  {
    title: "What can you help me with?",
    subtitle: "See what this bot knows about",
    prompt: "What can you help me with?",
  },
  {
    title: "Summarize the key topics",
    subtitle: "An overview of the bot's sources",
    prompt: "Summarize the key topics covered in your knowledge base.",
  },
  {
    title: "Explain a concept simply",
    subtitle: "As if I'm new to the subject",
    prompt:
      "Explain the most important concept from your sources as if I'm new to the subject.",
  },
  {
    title: "Quiz me",
    subtitle: "Three quick questions to check understanding",
    prompt:
      "Give me three quick questions to test my understanding of this material.",
  },
];

const PlaygroundEmptyState = ({
  onSuggestion,
}: {
  onSuggestion?: (prompt: string) => void;
}) => (
  <div className="flex min-h-full flex-col items-center justify-center px-4 py-10 text-center">
    <BotAvatar size="lg" />
    <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
      How can I help you today?
    </h2>
    <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
      Test your bot here. Answers use the bot's data sources and model
      settings.
    </p>
    {onSuggestion && (
      <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.title}
            type="button"
            onClick={() => onSuggestion(suggestion.prompt)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {suggestion.title}
            </div>
            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {suggestion.subtitle}
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

export const PlaygroundChat = ({
  onSuggestion,
}: {
  onSuggestion?: (prompt: string) => void;
}) => {
  const { messages } = useMessage();
  const { textToSpeechEnabled, defaultWebTextToSpeechLanguageType } =
    useStoreMessage();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const stickToBottom = React.useRef(true);
  const prevLength = React.useRef(0);
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
    stickToBottom.current = distance < 80;
    setShowJump(distance > 240);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="chat-scroll flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <PlaygroundEmptyState onSuggestion={onSuggestion} />
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
            {messages.map((message, index) => (
              <PlaygroundMessage
                key={index}
                {...message}
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
          aria-label="Scroll to latest message"
          onClick={() => {
            stickToBottom.current = true;
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
          className="absolute bottom-3 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-md transition hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-[#262626] dark:text-gray-300 dark:hover:bg-[#303030]"
        >
          <ArrowDownIcon className="h-4 w-4" />
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
        <div className="flex flex-col gap-3 mt-6">
          <h4 className="rounded-md bg-gray-100 text-sm dark:bg-white/5 text-gray-800 dark:text-gray-100 font-semibold px-3 py-2 break-all">
            {removeUUID(
              `${
                sourceData?.metadata?.path || sourceData?.metadata?.source
              }`.replace("./uploads/", "")
            )}
          </h4>
          {fileType === "pdf" && (
            <>
              <p className="text-gray-500 text-sm">{sourceData?.pageContent}</p>

              <div className="flex flex-wrap gap-3">
                <span className="border border-gray-300 dark:border-gray-700 rounded-md p-1 text-gray-500 text-xs">
                  {`Page ${sourceData?.metadata?.loc?.pageNumber}`}
                </span>

                <span className="border border-gray-300 dark:border-gray-700 rounded-md p-1 text-xs text-gray-500">
                  {`Line ${sourceData?.metadata?.loc?.lines?.from} - ${sourceData?.metadata?.loc?.lines?.to}`}
                </span>
              </div>
            </>
          )}

          {fileType === "other" && (
            <>
              <p className="text-gray-500 text-sm">{sourceData?.pageContent}</p>
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
              <p className="text-gray-500 text-sm">{sourceData?.pageContent}</p>

              <div className="flex flex-wrap gap-3">
                <span className="border border-gray-300 dark:border-gray-700 rounded-md p-1 text-xs text-gray-500">
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
