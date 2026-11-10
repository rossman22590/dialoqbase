import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessage } from "../../../hooks/useMessage";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import { useStoreMessage } from "../../../store";
import { useSpeechRecognition } from "../../../hooks/useSpeechRecognition";
import { Tooltip } from "antd";
import { ArrowUpIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { StopIcon } from "@heroicons/react/24/solid";
import { useCurrentBot } from "./useCurrentBot";
import useDynamicTextareaSize from "../../../hooks/useDynamicTextareaSize";

export type PlaygroundPrefill = { text: string; key: number };

export const PlaygroundgForm = ({
  prefill,
  onSendStart,
  onSendError,
}: {
  // Text to drop into the composer (e.g. from a suggested prompt).
  prefill?: PlaygroundPrefill | null;
  onSendStart?: () => void;
  onSendError?: () => void;
}) => {
  const { onSubmit, stopStreamingRequest, streaming } = useMessage();
  const bot = useCurrentBot();
  const form = useForm({
    initialValues: {
      message: "",
      isBot: false,
    },
  });

  const client = useQueryClient();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [typing, setTyping] = useState<boolean>(false);

  const {
    defaultSpeechToTextLanguage,
    setDefaultSpeechToTextLanguage,
    setDefaultWebTextToSpeechLanguageWebAPI,
    setElevenLabsDefaultVoice,
  } = useStoreMessage();

  const {
    transcript,
    listening,
    supported: browserSupportsSpeechRecognition,
    listen,
    stop,
  } = useSpeechRecognition();

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef?.current?.focus();
    }
    const defaultLanguageFromLocalStorage = localStorage.getItem(
      "defaultSpeechToTextLanguage"
    );
    const defaultWebTextToSpeechLanguageWebAPIFromLocalStorage =
      localStorage.getItem("defaultWebTextToSpeechLanguageWebAPI");
    if (defaultLanguageFromLocalStorage) {
      setDefaultSpeechToTextLanguage(defaultLanguageFromLocalStorage);
    } else {
      setDefaultSpeechToTextLanguage(window.navigator.language);
    }

    if (defaultWebTextToSpeechLanguageWebAPIFromLocalStorage) {
      setDefaultWebTextToSpeechLanguageWebAPI(
        defaultWebTextToSpeechLanguageWebAPIFromLocalStorage
      );
    }

    const defaultElevenLabsDefaultVoiceFromLocalStorage = localStorage.getItem(
      "elevenLabsDefaultVoice"
    );

    if (defaultElevenLabsDefaultVoiceFromLocalStorage) {
      setElevenLabsDefaultVoice(defaultElevenLabsDefaultVoiceFromLocalStorage);
    }
  }, []);

  React.useEffect(() => {
    form.setFieldValue("message", transcript);
  }, [transcript]);

  React.useEffect(() => {
    if (!prefill) return;
    form.setFieldValue("message", prefill.text);
    const el = textareaRef.current;
    if (el) {
      el.focus();
      requestAnimationFrame(() => {
        el.setSelectionRange(prefill.text.length, prefill.text.length);
      });
    }
  }, [prefill]);

  const { mutateAsync: sendMessage, isLoading: isSending } = useMutation(
    onSubmit,
    {
      onMutate: () => {
        onSendStart?.();
      },
      onSuccess: () => {
        client.invalidateQueries(["getBotPlaygroundHistory"]);
        form.setFieldValue("message", "");
      },
      onError: (error) => {
        console.error(error);
        onSendError?.();
      },
    }
  );

  useDynamicTextareaSize(textareaRef, form.values.message, 200);

  const canSend = !isSending && form.values.message.trim().length > 0;

  const showStop = isSending && streaming;
  const botLabel = bot.name || "the bot";

  return (
    <div className="shrink-0 px-3 pb-3 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
      <form
        onSubmit={form.onSubmit(async (value) => {
          form.reset();
          await sendMessage(value.message);
        })}
        className={`mx-auto flex w-full max-w-[720px] flex-col gap-2 rounded-[14px] border bg-surface py-2.5 pl-3.5 pr-2.5 transition-colors focus-within:border-indigo-500 dark:bg-canvas ${
          listening
            ? "border-red-300 dark:border-red-500/40"
            : "border-line-strong"
        }`}
      >
        <label htmlFor="playground-message" className="sr-only">
          Message {botLabel}
        </label>
        <textarea
          id="playground-message"
          ref={textareaRef}
          onKeyDown={(e) => {
            if (!typing && e.key === "Enter" && !e.shiftKey && !isSending) {
              e.preventDefault();
              form.onSubmit(async (value) => {
                if (value.message.trim().length === 0) {
                  return;
                }
                form.reset();
                await sendMessage(value.message);
              })();
            }
          }}
          className="block max-h-[200px] min-h-[48px] w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-6 text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-0"
          required
          rows={2}
          tabIndex={0}
          placeholder={
            listening
              ? "Listening…"
              : bot.name
              ? `Ask ${bot.name}…`
              : "Ask anything…"
          }
          onCompositionStart={() => setTyping(true)}
          onCompositionEnd={() => setTyping(false)}
          {...form.getInputProps("message")}
        />
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 text-xs text-fg-subtle">
            Answers here use your credits, like any other channel.
          </span>
          {browserSupportsSpeechRecognition && (
            <Tooltip title={listening ? "Stop listening" : "Voice input"}>
              <button
                type="button"
                aria-label={listening ? "Stop listening" : "Voice input"}
                aria-pressed={listening}
                onClick={() => {
                  if (!listening) {
                    listen({
                      lang: defaultSpeechToTextLanguage,
                    });
                  } else {
                    stop();
                  }
                }}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  listening
                    ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                    : "text-fg-subtle hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
            </Tooltip>
          )}

          {showStop ? (
            <Tooltip title="Stop" mouseEnterDelay={0.4}>
              <button
                type="button"
                aria-label="Stop"
                onClick={() => stopStreamingRequest()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-fg text-canvas transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <StopIcon className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip title="Send" mouseEnterDelay={0.4}>
              <button
                type="submit"
                aria-label="Send message"
                disabled={!canSend}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed ${
                  canSend || isSending
                    ? "bg-fg text-canvas hover:opacity-90"
                    : "bg-surface-2 text-fg-subtle"
                }`}
              >
                {isSending ? (
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                ) : (
                  <ArrowUpIcon className="h-4 w-4" strokeWidth={2.5} />
                )}
              </button>
            </Tooltip>
          )}
        </div>
      </form>
    </div>
  );
};
