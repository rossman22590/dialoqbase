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
}: {
  // Text to drop into the composer (e.g. from a suggested prompt).
  prefill?: PlaygroundPrefill | null;
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
      onSuccess: () => {
        client.invalidateQueries(["getBotPlaygroundHistory"]);
        form.setFieldValue("message", "");
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );

  useDynamicTextareaSize(textareaRef, form.values.message, 200);

  const canSend = !isSending && form.values.message.trim().length > 0;

  return (
    <div className="shrink-0 bg-white px-3 pb-3 pt-1 dark:bg-[#171717] sm:px-6 sm:pb-4">
      <div className="mx-auto w-full max-w-3xl">
        <form
          onSubmit={form.onSubmit(async (value) => {
            form.reset();
            await sendMessage(value.message);
          })}
          className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white py-2 pl-4 pr-2 shadow-sm transition-shadow focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-white/10 dark:bg-[#212121] dark:focus-within:border-indigo-400/60 dark:focus-within:ring-indigo-400/10"
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
            className="block max-h-[200px] min-w-0 flex-1 resize-none border-0 bg-transparent px-0 py-1.5 text-[15px] leading-6 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:text-gray-100 dark:placeholder:text-gray-500"
            required
            rows={1}
            tabIndex={0}
            placeholder={listening ? "Listening…" : "Send a message…"}
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
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    listening
                      ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
                  }`}
                >
                  {listening && (
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                    </span>
                  )}
                  <MicrophoneIcon className="h-5 w-5" />
                </button>
              </Tooltip>
            )}

            <Tooltip title="Send (Enter)">
              <button
                type="submit"
                aria-label="Send message"
                disabled={!canSend}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-600/40 disabled:shadow-none dark:focus-visible:ring-offset-[#212121] dark:disabled:bg-indigo-500/30 dark:disabled:text-white/60"
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
        <p className="mt-2 hidden text-center text-[11px] text-gray-400 dark:text-gray-500 sm:block">
          <kbd className="font-sans font-medium">Enter</kbd> to send ·{" "}
          <kbd className="font-sans font-medium">Shift + Enter</kbd> for a new
          line
        </p>
      </div>
    </div>
  );
};
