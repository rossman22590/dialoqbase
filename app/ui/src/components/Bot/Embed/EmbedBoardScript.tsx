import { Form, Input, Radio } from "antd";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import { DbColorPicker } from "../../Common/DbColorPicker";
import { Card, CardBody, CardHeader } from "../../ui";
import { EmbedCodePanel } from "./EmbedBoardCard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/cjs/styles/prism";

export function EmbedBoardScript({
  hostUrl,
  public_id,
}: {
  public_id: string;
  hostUrl: string;
}) {
  const [from] = Form.useForm();

  const widgetBtnColor = Form.useWatch("data-widget-btn-color", from);
  const widgetMsgBgColor = Form.useWatch("data-widget-msg-bg-color", from);
  const widgetMsgTextColor = Form.useWatch("data-widget-msg-text-color", from);
  const userMsgBgColor = Form.useWatch("data-widget-user-bg-color", from);
  const userMsgTextColor = Form.useWatch("data-widget-user-text-color", from);
  const widgetPosition = Form.useWatch("data-btn-position", from);
  const widgetIcon = Form.useWatch("data-widget-icon", from);
  //content={`<script src="${hostUrl}/chat.min.js" data-chat-url="${hostUrl}/bot/${public_id}" data-btn-position="bottom-right" defer></script>`}
  return (
    <Card>
      <CardHeader
        icon={<CodeBracketIcon />}
        title="Script"
        description="Add this script to your website or web app to show the chat widget."
      />
      <CardBody className="flex flex-col gap-6">
        <Form
          className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 [&_.ant-form-item]:mb-5"
          form={from}
          initialValues={{
            "data-btn-position": "bottom-right",
            "data-widget-btn-color": "#9b59b6",
            "data-widget-msg-bg-color": "#f3f4f6",
            "data-widget-msg-text-color": "#000000",
            "data-widget-user-bg-color": "#3b82f6",
            "data-widget-user-text-color": "#ffffff",
          }}
          layout="vertical"
        >
          <Form.Item
            className="sm:col-span-2 max-w-full overflow-x-auto"
            name="data-btn-position"
            label="Widget Position"
            tooltip="This position will be used for the widget button position"
          >
            <Radio.Group size="large">
              <Radio.Button value="bottom-right">Bottom Right</Radio.Button>
              <Radio.Button value="bottom-left">Bottom Left</Radio.Button>
              <Radio.Button value="top-right">Top Right</Radio.Button>
              <Radio.Button value="top-left">Top Left</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            className="sm:col-span-2"
            name="data-widget-icon"
            label="Widget Icon"
            tooltip="This icon will be used for the widget button icon default is the bot icon"
          >
            <Input size="large" placeholder="https://example.com/icon.png" />
          </Form.Item>

          <Form.Item
            name="data-widget-btn-color"
            label="Widget Button Color"
            tooltip="This color will be used for the widget button background color"
          >
            <DbColorPicker
              format="hex"
              pickedColor={
                typeof widgetBtnColor === "string"
                  ? widgetBtnColor
                  : `#${widgetBtnColor?.toHex()}`
              }
            />
          </Form.Item>

          <Form.Item
            name="data-widget-msg-bg-color"
            label="Chat Bubble Background Color"
            tooltip="This color will be used for the bot chat bubble background color"
          >
            <DbColorPicker
              format="hex"
              pickedColor={
                typeof widgetMsgBgColor === "string"
                  ? widgetMsgBgColor
                  : `#${widgetMsgBgColor?.toHex()}`
              }
            />
          </Form.Item>

          <Form.Item
            name="data-widget-msg-text-color"
            label="AI Chat Bubble Text Color"
            tooltip="This color will be used for the bot chat bubble text color"
          >
            <DbColorPicker
              format="hex"
              pickedColor={
                typeof widgetMsgTextColor === "string"
                  ? widgetMsgTextColor
                  : `#${widgetMsgTextColor?.toHex()}`
              }
            />
          </Form.Item>

          <Form.Item
            name="data-widget-user-bg-color"
            label="User Chat Bubble Background Color"
            tooltip="This color will be used for the user chat bubble background color"
          >
            <DbColorPicker
              format="hex"
              pickedColor={
                typeof userMsgBgColor === "string"
                  ? userMsgBgColor
                  : `#${userMsgBgColor?.toHex()}`
              }
            />
          </Form.Item>

          <Form.Item
            name="data-widget-user-text-color"
            label="User Chat Bubble Text Color"
            tooltip="This color will be used for the user chat bubble text color"
          >
            <DbColorPicker
              format="hex"
              pickedColor={
                typeof userMsgTextColor === "string"
                  ? userMsgTextColor
                  : `#${userMsgTextColor?.toHex()}`
              }
            />
          </Form.Item>
        </Form>

        <EmbedCodePanel
          label="index.html"
          copyValue={`<script src="${hostUrl}/chat.min.js" data-chat-url="${hostUrl}/bot/${public_id}" data-btn-position="${widgetPosition}" data-widget-btn-color="${typeof widgetBtnColor === "string"
                ? widgetBtnColor
                : `#${widgetBtnColor?.toHex()}`
                }" data-widget-msg-bg-color="${typeof widgetMsgBgColor === "string"
                  ? widgetMsgBgColor
                  : `#${widgetMsgBgColor?.toHex()}`
                }" data-widget-msg-text-color="${typeof widgetMsgTextColor === "string"
                  ? widgetMsgTextColor
                  : `#${widgetMsgTextColor?.toHex()}`
                }" data-widget-user-bg-color="${typeof userMsgBgColor === "string"
                  ? userMsgBgColor
                  : `#${userMsgBgColor?.toHex()}`
                }" data-widget-user-text-color="${typeof userMsgTextColor === "string"
                  ? userMsgTextColor
                  : `#${userMsgTextColor?.toHex()}`
                }" ${widgetIcon ? `data-widget-icon="${widgetIcon}"` : ""
                } defer> </script>`}
        >
          {/* @ts-ignore */}
          <SyntaxHighlighter
            language="html"
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: "1rem 1.25rem",
              background: "transparent",
              lineHeight: "1.4rem",
              overflow: "auto",
              fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
              color: "#d6deeb",
            }}
            style={nightOwl}
            codeTagProps={{
              className: "text-[13px]",
            }}
          >
            {`<script 
    src="${hostUrl}/chat.min.js" 
    data-chat-url="${hostUrl}/bot/${public_id}" 
    data-btn-position="${widgetPosition}"
    data-widget-btn-color="${typeof widgetBtnColor === "string"
                ? widgetBtnColor
                : `#${widgetBtnColor?.toHex()}`
              }"
    data-widget-msg-bg-color="${typeof widgetMsgBgColor === "string"
                ? widgetMsgBgColor
                : `#${widgetMsgBgColor?.toHex()}`
              }"
    data-widget-msg-text-color="${typeof widgetMsgTextColor === "string"
                ? widgetMsgTextColor
                : `#${widgetMsgTextColor?.toHex()}`
              }"
    data-widget-user-bg-color="${typeof userMsgBgColor === "string"
                ? userMsgBgColor
                : `#${userMsgBgColor?.toHex()}`
              }"
    data-widget-user-text-color="${typeof userMsgTextColor === "string"
                ? userMsgTextColor
                : `#${userMsgTextColor?.toHex()}`
              }"${widgetIcon ? `\n    data-widget-icon="${widgetIcon}"` : ""}
    defer>
</script>`}
          </SyntaxHighlighter>
        </EmbedCodePanel>
      </CardBody>
    </Card>
  );
}
