import React from "react";
import { Form, FormInstance, Input, Radio } from "antd";
import { CheckIcon } from "@heroicons/react/24/outline";
import { clipbardCopy } from "../../../utils/clipboard";
import { DbColorPicker } from "../../Common/DbColorPicker";

// Small "Copy" button with a short "Copied" confirmation.
export function CopyTextButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await clipbardCopy(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy text: ", err);
        }
      }}
      className={`ui-btn-secondary h-[30px] shrink-0 px-2.5 text-xs font-normal ${className}`}
    >
      {copied && <CheckIcon className="text-green-600 dark:text-green-400" />}
      {copied ? "Copied" : label}
    </button>
  );
}

// Bordered code box: a title bar with Copy, then the code. `copyValue` can
// differ from what is shown (e.g. a one-line version of a pretty snippet).
export function EmbedCodePanel({
  label,
  copyValue,
  children,
}: {
  label: React.ReactNode;
  copyValue: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ui-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line bg-app py-2.5 pl-4 pr-3">
        <h2 className="m-0 min-w-0 flex-1 truncate text-[13px] font-medium text-fg-muted">
          {label}
        </h2>
        <CopyTextButton value={copyValue} />
      </div>
      {children}
    </section>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="m-0 overflow-x-auto whitespace-pre p-4 text-[13px] leading-relaxed text-fg">
      {code}
    </pre>
  );
}

export function EmbedBoardCard({
  content,
  title,
}: {
  content: string;
  title: string;
  description?: string;
}) {
  return (
    <EmbedCodePanel label={title} copyValue={content}>
      <CodeBlock code={content} />
    </EmbedCodePanel>
  );
}

export const WIDGET_INITIAL_VALUES = {
  "data-btn-position": "bottom-right",
  "data-widget-btn-color": "#9b59b6",
  "data-widget-msg-bg-color": "#f3f4f6",
  "data-widget-msg-text-color": "#000000",
  "data-widget-user-bg-color": "#3b82f6",
  "data-widget-user-text-color": "#ffffff",
};

export const hexOf = (value: any) =>
  typeof value === "string" ? value : `#${value?.toHex()}`;

// Options for the chat-bubble script (shared by the HTML and Next.js
// snippets). Field names are the script's data attributes.
export function WidgetOptionsForm({ form }: { form: FormInstance }) {
  const widgetBtnColor = Form.useWatch("data-widget-btn-color", form);
  const widgetMsgBgColor = Form.useWatch("data-widget-msg-bg-color", form);
  const widgetMsgTextColor = Form.useWatch("data-widget-msg-text-color", form);
  const userMsgBgColor = Form.useWatch("data-widget-user-bg-color", form);
  const userMsgTextColor = Form.useWatch("data-widget-user-text-color", form);

  const color = (name: string, label: string, value: any) => (
    <Form.Item name={name} label={label}>
      <DbColorPicker format="hex" pickedColor={hexOf(value)} />
    </Form.Item>
  );

  return (
    <section className="ui-card px-5 py-4">
      <h2 className="m-0 mb-3 text-[15px] font-semibold text-fg">
        Widget options
      </h2>
      <Form
        className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 [&_.ant-form-item]:mb-0"
        form={form}
        initialValues={WIDGET_INITIAL_VALUES}
        layout="vertical"
      >
        <Form.Item
          className="max-w-full overflow-x-auto sm:col-span-2"
          name="data-btn-position"
          label="Button position"
        >
          <Radio.Group>
            <Radio.Button value="bottom-right">Bottom right</Radio.Button>
            <Radio.Button value="bottom-left">Bottom left</Radio.Button>
            <Radio.Button value="top-right">Top right</Radio.Button>
            <Radio.Button value="top-left">Top left</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          className="sm:col-span-2"
          name="data-widget-icon"
          label="Button icon URL"
          extra="Leave empty to use the bot icon."
        >
          <Input placeholder="https://example.com/icon.png" />
        </Form.Item>

        {color("data-widget-btn-color", "Button color", widgetBtnColor)}
        {color(
          "data-widget-msg-bg-color",
          "Bot bubble background",
          widgetMsgBgColor
        )}
        {color("data-widget-msg-text-color", "Bot bubble text", widgetMsgTextColor)}
        {color(
          "data-widget-user-bg-color",
          "Visitor bubble background",
          userMsgBgColor
        )}
        {color(
          "data-widget-user-text-color",
          "Visitor bubble text",
          userMsgTextColor
        )}
      </Form>
    </section>
  );
}
