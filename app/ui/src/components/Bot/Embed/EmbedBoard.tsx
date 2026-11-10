import React from "react";
import { Form } from "antd";
import { useSearchParams } from "react-router-dom";
import { EmbedBoardCard, WidgetOptionsForm } from "./EmbedBoardCard";
import { EmbedBoardScript } from "./EmbedBoardScript";
import { EmbedBoardNextjs } from "./EmbedBoardNextjs";
import { AllowedSites } from "./AllowedSites";

type Props = {
  public_id: string;
};

type Kind = "script" | "iframe" | "nextjs" | "link";

const KINDS: { key: Kind; name: string; desc: string }[] = [
  {
    key: "script",
    name: "Chat bubble",
    desc: "A button in the corner that opens the chat.",
  },
  {
    key: "iframe",
    name: "Inline",
    desc: "The chat sits inside your page, like a section.",
  },
  {
    key: "nextjs",
    name: "Next.js",
    desc: "A ready-made component for Next.js sites.",
  },
  {
    key: "link",
    name: "Share link",
    desc: "A full-page chat you can send anyone.",
  },
];

export const EmbedBoard = ({ public_id }: Props) => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [kind, setKind] = React.useState<Kind>(
    type === "nextjs" ? "nextjs" : "script"
  );
  const [widgetForm] = Form.useForm();

  const [hostUrl] = React.useState<string>(
    () =>
      import.meta.env.VITE_HOST_URL ||
      window.location.protocol + "//" + window.location.host
  );

  return (
    <div className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-label="Embed type"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {KINDS.map((k) => {
          const on = kind === k.key;
          return (
            <button
              key={k.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setKind(k.key)}
              className={`flex flex-col items-start gap-1 rounded-[10px] bg-surface p-3.5 text-left text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                on
                  ? "border-[1.5px] border-indigo-600 ring-[3px] ring-indigo-50 dark:border-indigo-400 dark:ring-indigo-500/15"
                  : "border border-line hover:border-line-strong"
              }`}
            >
              <span className="text-sm font-semibold">{k.name}</span>
              <span className="text-[13px] leading-snug text-fg-muted">
                {k.desc}
              </span>
            </button>
          );
        })}
      </div>

      {kind === "script" && (
        <EmbedBoardScript
          hostUrl={hostUrl}
          public_id={public_id}
          form={widgetForm}
        />
      )}

      {kind === "nextjs" && (
        <EmbedBoardNextjs
          hostUrl={hostUrl}
          public_id={public_id}
          form={widgetForm}
        />
      )}

      {kind === "iframe" && (
        <EmbedBoardCard
          title="Paste where it should appear"
          content={`<iframe src="${hostUrl}/bot/${public_id}?mode=iframe" width="400" height="500" />`}
        />
      )}

      {kind === "link" && (
        <EmbedBoardCard
          title="Public link"
          content={`${hostUrl}/bot/${public_id}`}
        />
      )}

      {(kind === "script" || kind === "nextjs") && (
        <WidgetOptionsForm form={widgetForm} />
      )}

      <AllowedSites />
    </div>
  );
};
