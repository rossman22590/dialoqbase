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
    const widgetPosition = Form.useWatch("data-btn-position", from);
    const widgetIcon = Form.useWatch("data-widget-icon", from);

    const btnColorHex = typeof widgetBtnColor === "string"
        ? widgetBtnColor
        : `#${widgetBtnColor?.toHex()}`;

    const nextjsCode = `import Script from 'next/script';

const ChatBot = () => {
  return (
    <>
      <Script
        src="${hostUrl}/chat.min.js"
        data-chat-url="${hostUrl}/bot/${public_id}"
        data-btn-position="${widgetPosition}"
        data-widget-btn-color="${btnColorHex}"${widgetIcon ? `\n        data-widget-icon="${widgetIcon}"` : ""}
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
