import { PlayIcon } from "@heroicons/react/24/outline";
import { FormInstance, Form } from "antd";

export const AppearancePreview = ({ form }: { form: FormInstance }) => {
  const botBubbleStyle = Form.useWatch("chat_bot_bubble_style", form);
  const humanBubbleStyle = Form.useWatch("chat_human_bubble_style", form);
  const botName = Form.useWatch("bot_name", form);
  const firstMessage = Form.useWatch("first_message", form);

  const isTTS = Form.useWatch("tts", form);

  return (
    <div
      style={{
        height: "clamp(460px, calc(100vh - 280px), 640px)",
        width: "100%",
        maxWidth: "100%",
        minWidth: "100%",
        minHeight: "100%",
      }}
      className="flex flex-col bg-white text-gray-900"
    >
      <div className="sticky top-0 z-10 ">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" />
            <p className="truncate text-[15px] font-semibold tracking-tight">
              {botName}
            </p>
          </div>
          <div className="flex items-center">
            <span className="mr-3">
              <button type="button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </span>
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="grow flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out">
        <div className="grow px-4 sm:px-6 md:px-5 py-6">
          <div className="flex w-full mt-2 space-x-3 ">
            <div
              className="max-w-[85%] rounded-2xl rounded-tl-md px-3.5 py-2.5 shadow-sm"
              style={{
                backgroundColor:
                  typeof botBubbleStyle?.background_color === "string"
                    ? botBubbleStyle?.background_color
                    : `#${botBubbleStyle?.background_color?.toHex()}`,

                color:
                  typeof botBubbleStyle?.text_color === "string"
                    ? botBubbleStyle?.text_color
                    : `#${botBubbleStyle?.text_color?.toHex()}`,
              }}
            >
              <p className="text-sm leading-relaxed">{firstMessage}</p>
              {isTTS && (
                <div className=" mt-3">
                  <button className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors duration-200">
                    <PlayIcon className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
            <div
              style={{
                backgroundColor:
                  typeof humanBubbleStyle?.background_color === "string"
                    ? humanBubbleStyle?.background_color
                    : `#${humanBubbleStyle?.background_color?.toHex()}`,

                color:
                  typeof humanBubbleStyle?.text_color === "string"
                    ? humanBubbleStyle?.text_color
                    : `#${humanBubbleStyle?.text_color?.toHex()}`,
              }}
              className="rounded-2xl rounded-br-md px-3.5 py-2.5 shadow-sm"
            >
              <p className="text-sm leading-relaxed">Nice to meet you!</p>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0">
        <div className="border-t border-gray-200 bg-white p-3 text-black">
          <div className="flex-grow space-y-6 ">
            <div className="flex">
              <form className="flex-grow  flex items-center">
                <div className="flex w-full items-center rounded-full border border-gray-200 bg-gray-50">
                  <textarea
                    className="w-full resize-none rounded-full border-0 bg-transparent p-2.5 pl-4 pr-2 text-sm text-black ring-0 placeholder:text-gray-400 focus-within:outline-none focus:ring-0 focus-visible:ring-0"
                    required
                    rows={1}
                    tabIndex={0}
                    placeholder="Type your message…"
                  />
                  <button className="mx-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
