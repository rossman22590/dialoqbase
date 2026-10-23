import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessage } from "../../../hooks/useMessage";
import { useForm } from "@mantine/form";
import React, { useState } from "react";
import { useStoreMessage } from "../../../store";
import { useSpeechRecognition } from "../../../hooks/useSpeechRecognition";
import { Tooltip } from "antd";
import { ArrowUpIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
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
  const { onSubmit } = useMessage();
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

  return (
    <div className="relative shrink-0 px-3 pb-3 sm:px-6 sm:pb-4">
      {/* Messages fade out as they scroll under the composer. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-canvas to-transparent"
      />
      <div className="mx-auto w-full max-w-3xl">
        <form
          onSubmit={form.onSubmit(async (value) => {
            form.reset();
            await sendMessage(value.message);
          })}
          className={`group/composer flex items-end gap-2 rounded-[22px] border bg-surface py-2 pl-4 pr-2 shadow-raised transition-all duration-200 ease-out focus-within:border-indigo-400/70 focus-within:shadow-[0_0_0_4px_rgb(124_58_237/0.12),0_12px_32px_-12px_rgb(124_58_237/0.35)] dark:focus-within:border-indigo-400/50 ${
            listening
              ? "border-red-300 dark:border-red-500/40"
              : "border-line hover:border-line-strong"
          }`}
        >
          <textarea
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
            className="block max-h-[200px] min-w-0 flex-1 resize-none border-0 bg-transparent px-0 py-1.5 text-[15px] leading-6 text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-0"
            required
            rows={1}
            tabIndex={0}
            placeholder={listening ? "Listening…" : "Ask anything…"}
            aria-label="Message"
            onCompositionStart={() => setTyping(true)}
            onCompositionEnd={() => setTyping(false)}
            {...form.getInputProps("message")}
          />
          <div className="flex shrink-0 items-center gap-1">
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
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    listening
                      ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                      : "text-fg-subtle hover:bg-surface-2 hover:text-fg"
                  }`}
                >
                  {listening && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-400/20" />
                  )}
                  <MicrophoneIcon className="relative h-5 w-5" />
                </button>
              </Tooltip>
            )}

            <Tooltip title="Send" mouseEnterDelay={0.4}>
              <button
                type="submit"
                aria-label="Send message"
                disabled={!canSend}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed ${
                  canSend
                    ? "scale-100 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-brand hover:brightness-110 active:scale-90"
                    : isSending
                    ? "bg-indigo-600 text-white"
                    : "scale-95 bg-surface-3 text-fg-subtle"
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
          </div>
        </form>
        <p className="mt-2 hidden text-center text-[11px] text-fg-subtle sm:block">
          <kbd className="rounded border border-line bg-surface px-1 py-px font-sans text-[10px] font-medium">
            Enter
          </kbd>{" "}
          to send ·{" "}
          <kbd className="rounded border border-line bg-surface px-1 py-px font-sans text-[10px] font-medium">
            Shift + Enter
          </kbd>{" "}
          for a new line
        </p>
      </div>
    </div>
  );
};
