import { Form, FormInstance } from "antd";
import { CodeBlock, EmbedCodePanel, hexOf } from "./EmbedBoardCard";

// Next.js: a component that loads the same chat-bubble script.
export function EmbedBoardNextjs({
  hostUrl,
  public_id,
  form,
}: {
  public_id: string;
  hostUrl: string;
  form: FormInstance;
}) {
  const widgetBtnColor = Form.useWatch("data-widget-btn-color", form);
  const widgetMsgBgColor = Form.useWatch("data-widget-msg-bg-color", form);
  const widgetMsgTextColor = Form.useWatch("data-widget-msg-text-color", form);
  const userMsgBgColor = Form.useWatch("data-widget-user-bg-color", form);
  const userMsgTextColor = Form.useWatch("data-widget-user-text-color", form);
  const widgetPosition = Form.useWatch("data-btn-position", form);
  const widgetIcon = Form.useWatch("data-widget-icon", form);

  const nextjsCode = `import Script from 'next/script';

const ChatBot = () => {
  return (
    <>
      <Script
        src="${hostUrl}/chat.min.js"
        data-chat-url="${hostUrl}/bot/${public_id}"
        data-btn-position="${widgetPosition}"
        data-widget-btn-color="${hexOf(widgetBtnColor)}"
        data-widget-msg-bg-color="${hexOf(widgetMsgBgColor)}"
        data-widget-msg-text-color="${hexOf(widgetMsgTextColor)}"
        data-widget-user-bg-color="${hexOf(userMsgBgColor)}"
        data-widget-user-text-color="${hexOf(userMsgTextColor)}"${
    widgetIcon ? `\n        data-widget-icon="${widgetIcon}"` : ""
  }
        defer
      />
    </>
  );
};

export default ChatBot;`;

  return (
    <EmbedCodePanel label="components/ChatBot.tsx" copyValue={nextjsCode}>
      <CodeBlock code={nextjsCode} />
    </EmbedCodePanel>
  );
}
