import { PlayIcon } from "@heroicons/react/24/outline";
import { FormInstance, Form } from "antd";
import { colorToHex } from "./AppearanceForm";

// The chat widget is always light, so this mock uses fixed light colours
// rather than theme tokens.
const useAppearanceValues = (form: FormInstance) => {
  const botBubbleStyle = Form.useWatch("chat_bot_bubble_style", form);
  const humanBubbleStyle = Form.useWatch("chat_human_bubble_style", form);
  const botName = Form.useWatch("bot_name", form);
  const firstMessage = Form.useWatch("first_message", form);
  const isTTS = Form.useWatch("tts", form);
  return {
    botName,
    firstMessage,
    isTTS,
    bot: {
      backgroundColor: colorToHex(botBubbleStyle?.background_color),
      color: colorToHex(botBubbleStyle?.text_color),
    },
    human: {
      backgroundColor: colorToHex(humanBubbleStyle?.background_color),
      color: colorToHex(humanBubbleStyle?.text_color),
    },
  };
};

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>
);

// Full-page chat, as in a shared link.
export const AppearancePreview = ({ form }: { form: FormInstance }) => {
  const v = useAppearanceValues(form);

  return (
    <div className="flex h-full min-h-[460px] w-full flex-col bg-white text-zinc-900">
      <div className="flex items-center gap-2.5 border-b border-zinc-100 px-4 py-3">
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
        <p className="m-0 truncate text-sm font-semibold">{v.botName}</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 py-4 text-sm leading-relaxed">
        <div
          className="max-w-[85%] self-start rounded-xl px-3 py-2"
          style={v.bot}
        >
          <p className="m-0">{v.firstMessage}</p>
          {v.isTTS && (
            <span className="mt-2 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700">
              <PlayIcon className="h-3 w-3" />
            </span>
          )}
        </div>
        <div
          className="max-w-[85%] self-end rounded-xl px-3 py-2"
          style={v.human}
        >
          <p className="m-0">Nice to meet you!</p>
        </div>
      </div>
      <div className="border-t border-zinc-100 p-2.5">
        <div className="flex h-[38px] items-center rounded-[10px] border border-zinc-200 pl-3 pr-1.5 text-sm text-zinc-400">
          <span className="flex-1">Type a message…</span>
          <SendIcon />
        </div>
      </div>
    </div>
  );
};

// The widget as it sits on someone's website.
export const AppearanceWidgetPreview = ({ form }: { form: FormInstance }) => {
  const v = useAppearanceValues(form);

  return (
    <div className="relative h-full min-h-[600px] overflow-hidden bg-white">
      <div aria-hidden="true" className="flex flex-col gap-2.5 p-5">
        <div className="h-3 w-2/5 rounded bg-zinc-100" />
        <div className="h-2.5 w-4/5 rounded bg-zinc-50" />
        <div className="h-2.5 w-[70%] rounded bg-zinc-50" />
      </div>
      <div className="absolute bottom-20 right-4 w-[290px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border border-zinc-200 bg-white text-[13px] leading-normal text-zinc-900 shadow-lg">
        <div
          className="px-3.5 py-3 font-semibold"
          style={{
            background: v.human.backgroundColor,
            color: v.human.color,
          }}
        >
          {v.botName}
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div
            className="max-w-[85%] self-start rounded-xl px-2.5 py-2"
            style={v.bot}
          >
            {v.firstMessage}
            {v.isTTS && (
              <span className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700">
                <PlayIcon className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
          <div
            className="max-w-[85%] self-end rounded-xl px-2.5 py-2"
            style={v.human}
          >
            Nice to meet you!
          </div>
        </div>
        <div className="border-t border-zinc-100 px-2.5 py-2 text-zinc-500">
          Type a message…
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-4 right-4 flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-md"
        style={{ background: v.human.backgroundColor }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={v.human.color || "#FFFFFF"}
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <path d="M4 5h16v11H9l-5 4z" />
        </svg>
      </div>
    </div>
  );
};
