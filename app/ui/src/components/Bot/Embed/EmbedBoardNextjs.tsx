import { Form, Input, Radio } from "antd";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import { DbColorPicker } from "../../Common/DbColorPicker";
import { Card, CardBody, CardHeader } from "../../ui";
import { EmbedCodePanel } from "./EmbedBoardCard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/cjs/styles/prism";

export function EmbedBoardNextjs({
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

    const btnColorHex = typeof widgetBtnColor === "string"
        ? widgetBtnColor
        : `#${widgetBtnColor?.toHex()}`;

    const msgBgColorHex = typeof widgetMsgBgColor === "string"
        ? widgetMsgBgColor
        : `#${widgetMsgBgColor?.toHex()}`;

    const msgTextColorHex = typeof widgetMsgTextColor === "string"
        ? widgetMsgTextColor
        : `#${widgetMsgTextColor?.toHex()}`;

    const userBgColorHex = typeof userMsgBgColor === "string"
        ? userMsgBgColor
        : `#${userMsgBgColor?.toHex()}`;

    const userTextColorHex = typeof userMsgTextColor === "string"
        ? userMsgTextColor
        : `#${userMsgTextColor?.toHex()}`;

    const nextjsCode = `import Script from 'next/script';

const ChatBot = () => {
  return (
    <>
      <Script
        src="${hostUrl}/chat.min.js"
        data-chat-url="${hostUrl}/bot/${public_id}"
        data-btn-position="${widgetPosition}"
        data-widget-btn-color="${btnColorHex}"
        data-widget-msg-bg-color="${msgBgColorHex}"
        data-widget-msg-text-color="${msgTextColorHex}"
        data-widget-user-bg-color="${userBgColorHex}"
        data-widget-user-text-color="${userTextColorHex}"${widgetIcon ? `\n        data-widget-icon="${widgetIcon}"` : ""}
        defer
      />
    </>
  );
};

export default ChatBot;`;

    return (
        <Card className="font-sans">
            <CardHeader
                icon={<CodeBracketIcon />}
                title="Next.js (React)"
                description="Drop this component into your Next.js app to embed your bot."
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
                            pickedColor={btnColorHex}
                        />
                    </Form.Item>

                    <Form.Item
                        name="data-widget-msg-bg-color"
                        label="Chat Bubble Background Color"
                        tooltip="This color will be used for the bot chat bubble background color"
                    >
                        <DbColorPicker
                            format="hex"
                            pickedColor={msgBgColorHex}
                        />
                    </Form.Item>

                    <Form.Item
                        name="data-widget-msg-text-color"
                        label="AI Chat Bubble Text Color"
                        tooltip="This color will be used for the bot chat bubble text color"
                    >
                        <DbColorPicker
                            format="hex"
                            pickedColor={msgTextColorHex}
                        />
                    </Form.Item>

                    <Form.Item
                        name="data-widget-user-bg-color"
                        label="User Chat Bubble Background Color"
                        tooltip="This color will be used for the user chat bubble background color"
                    >
                        <DbColorPicker
                            format="hex"
                            pickedColor={userBgColorHex}
                        />
                    </Form.Item>

                    <Form.Item
                        name="data-widget-user-text-color"
                        label="User Chat Bubble Text Color"
                        tooltip="This color will be used for the user chat bubble text color"
                    >
                        <DbColorPicker
                            format="hex"
                            pickedColor={userTextColorHex}
                        />
                    </Form.Item>
                </Form>

                <EmbedCodePanel label="ChatBot.tsx" copyValue={nextjsCode}>
                    {/* @ts-ignore */}
                    <SyntaxHighlighter
                        language="tsx"
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
                        {nextjsCode}
                    </SyntaxHighlighter>
                </EmbedCodePanel>
            </CardBody>
        </Card>
    );
}
