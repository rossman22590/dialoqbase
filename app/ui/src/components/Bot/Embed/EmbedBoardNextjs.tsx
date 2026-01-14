import { Form, Input, Radio } from "antd";
import { CopyBtn } from "../../Common/CopyBtn";
import { DbColorPicker } from "../../Common/DbColorPicker";
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
        <div className="px-4 py-6 sm:p-6 lg:pb-8 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-[#262626] dark:border-gray-700 font-sans">
            <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Next.js (React)
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You can use this component to embed your bot into your Next.js application.
            </p>
            <div className="mt-6 flex flex-col ">
                <Form
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

                <div>
                    <div className="flex-grow">
                        {/* @ts-ignore */}
                        <SyntaxHighlighter
                            language="tsx"
                            customStyle={{
                                borderRadius: "0.7rem",
                                lineHeight: "1.25rem",
                                overflow: "auto",
                                fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
                                color: "#d6deeb",
                            }}
                            style={nightOwl}
                            codeTagProps={{
                                className: "text-sm",
                            }}
                        >
                            {nextjsCode}
                        </SyntaxHighlighter>
                    </div>
                    <span className="flex justify-end mt-4">
                        <CopyBtn
                            value={nextjsCode}
                            className="border border-gray-300 dark:border-gray-700 dark:text-white dark:hover:bg-[#333030] dark:focus:ring-gray-900 rounded-md dark:bg-[#171717]"
                        />
                    </span>
                </div>
            </div>
        </div>
    );
}
