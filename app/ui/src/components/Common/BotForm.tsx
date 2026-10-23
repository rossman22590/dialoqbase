import {
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  // Switch,
  Upload,
  message,
} from "antd";
import { RadioGroup } from "@headlessui/react";
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import React from "react";
import { SpiderIcon } from "../Icons/SpiderIcon";
// import { GithubIcon } from "../Icons/GithubIcon";
// import { YoutubeIcon } from "../Icons/YoutubeIcon";
import { ApiIcon } from "../Icons/ApiIcon";
import { SitemapIcon } from "../Icons/SitemapIcon";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { BotConfig } from "../../@types/bot";

type Props = {
  createBot: (values: any) => void;
  isLoading: boolean;
  setSelectedSource: React.Dispatch<React.SetStateAction<any>>;
  form: FormInstance<any>;
  showEmbeddingAndModels: boolean;
  newSelectedSource?: any;
  botConfig: BotConfig;
};
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const BotForm = ({
  createBot,
  isLoading,
  setSelectedSource,
  form,
  showEmbeddingAndModels,
  botConfig,
}: Props) => {
  const youtubeMode = Form.useWatch(["options", "youtube_mode"], form);
  const url = Form.useWatch(["content"], form);
  const [availableSources] = React.useState([
    {
      id: 1,
      value: "website",
      title: "Webpage",
      icon: GlobeAltIcon,
      formComponent: (
        <Form.Item
          name="content"
          rules={[
            {
              required: true,
              message: "Please enter the webpage URL",
            },
          ]}
        >
          <Input type="url" placeholder="Enter the webpage URL" />
        </Form.Item>
      ),
    },
    {
      id: 3,
      value: "text",
      title: "Text",
      icon: DocumentTextIcon,
      formComponent: (
        <Form.Item
          name="content"
          rules={[
            {
              required: true,
              message: "Please enter the text",
            },
          ]}
        >
          <Input.TextArea placeholder="Enter the text" rows={5} />
        </Form.Item>
      ),
    },
    {
      id: 2,
      value: "file",
      title: "File",
      icon: DocumentArrowUpIcon,
      formComponent: (
        <>
          <Form.Item
            name="file"
            rules={[
              {
                required: true,
                message: `Please upload your files (PDF, Docx, CSV, TXT, MP3, MP4)`,
              },
            ]}
            getValueFromEvent={(e) => {
              console.log("Upload event:", e);
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload.Dragger
              accept={`.pdf,.docx,.csv,.txt,.mp3,.mp4,.zip,.json`}
              multiple={true}
              maxCount={botConfig?.fileUploadSizeLimit}
              beforeUpload={(file) => {
                const allowedTypes = [
                  "application/pdf",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  "text/csv",
                  "text/plain",
                  "audio/mpeg",
                  "audio/mp4",
                  "video/mp4",
                  "video/mpeg",
                  "application/zip",
                  "application/x-zip-compressed",
                  "application/json",
                ]
                  .map((type) => type.toLowerCase())
                  .join(", ");

                console.log("file type:", file.type.toLowerCase());

                if (!allowedTypes.includes(file.type.toLowerCase())) {
                  message.error(
                    `File type not supported. Please upload a ${allowedTypes} file.`
                  );
                  return Upload.LIST_IGNORE;
                }

                // if video or audio
                if (
                  file.type.toLowerCase().includes("audio") ||
                  file.type.toLowerCase().includes("video")
                ) {
                  message.warning(
                    `Currently, Only support video and audio files with English audio`
                  );
                }

                return false;
              }}
            >
              <div className="px-3 py-4">
                <p className="ant-upload-drag-icon flex justify-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20">
                    <InboxIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </p>
                <p className="ant-upload-text">
                  Click or drag PDF, Docx, CSV, TXT, MP3, MP4, Zip, or JSON
                  files to this area
                </p>
                <p className="ant-upload-hint">
                  {`Support is available for a single or bulk upload of up to ${botConfig?.fileUploadSizeLimit}
                  files. Please note that file upload is in beta, so if you
                  encounter any issues, kindly report them.`}
                </p>
              </div>
            </Upload.Dragger>
          </Form.Item>
          <p className="text-xs leading-relaxed text-fg-subtle">
            If you find any issues, please report them on{" "}
            <a
              href={`https://myapps.ai`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Support
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: 4,
      value: "crawl",
      title: "Crawler",
      icon: SpiderIcon,
      formComponent: (
        <>
          <Form.Item
            name="content"
            rules={[
              {
                required: true,
                message: "Please enter the website URL",
              },
            ]}
          >
            <Input type="url" placeholder="Enter the website URL" />
          </Form.Item>
          <Form.Item
            name="maxDepth"
            help="The max depth of the website to crawl"
            rules={[
              {
                required: true,
                message: "Please input max depth!",
              },
            ]}
          >
            <InputNumber
              placeholder="Enter the max depth"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="maxLinks"
            help="The max links to crawl"
            rules={[
              {
                required: true,
                message: "Please input max links count",
              },
            ]}
          >
            <InputNumber
              placeholder="Enter the max depth"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <p className="text-xs leading-relaxed text-fg-subtle">
            If you find any issues, please report them on{" "}
            <a
              href={`https://myapps.ai`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Support
            </a>
            .
          </p>
        </>
      ),
    },
    // {
    //   id: 6,
    //   value: "github",
    //   title: "GitHub",
    //   icon: GithubIcon,
    //   formComponent: (
    //     <>
    //       <Form.Item
    //         name="content"
    //         rules={[
    //           {
    //             required: true,
    //             message: "Please enter the public github repo URL",
    //           },
    //           {
    //             pattern: new RegExp(
    //               "^(https?://)?(www.)?github.com/([a-zA-Z0-9-]+)/([a-zA-Z0-9_-]+)(.git)?$"
    //             ),
    //             message: "Please enter a valid public github repo URL",
    //           },
    //         ]}
    //       >
    //         <Input type="url" placeholder="Enter the github repo URL" />
    //       </Form.Item>
    //       <Row gutter={16}>
    //         <Col span={12}>
    //           <Form.Item
    //             name={["options", "branch"]}
    //             label="Branch"
    //             rules={[
    //               {
    //                 required: true,
    //                 message: "Please input branch",
    //               },
    //             ]}
    //           >
    //             <Input placeholder="Enter the branch" />
    //           </Form.Item>
    //         </Col>
    //         <Col span={12}>
    //           <Form.Item label="Private repo?" name={["options", "is_private"]}>
    //             <Switch className="mr-2" />
    //           </Form.Item>
    //         </Col>
    //       </Row>

    //       <p className="text-xs leading-relaxed text-fg-subtle">
    //         If you find any issues, please report them on{" "}
    //         <a
    //           href={`https://myapps.ai`}
    //           target="_blank"
    //           rel="noreferrer"
    //           className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
    //         >
    //           Support
    //         </a>
    //         .
    //       </p>
    //     </>
    //   ),
    // },
    // {
    //   id: 7,
    //   value: "youtube",
    //   title: "Youtube",
    //   icon: YoutubeIcon,
    //   formComponent: (
    //     <>
    //       <Form.Item
    //         name="content"
    //         rules={[
    //           {
    //             required: true,
    //             message: "Please enter a valid youtube URL",
    //           },
    //           {
    //             pattern: new RegExp(
    //               /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    //             ),
    //             message: "Please enter a valid youtube URL",
    //           },
    //         ]}
    //       >
    //         <Input
    //           type="url"
    //           size="large"
    //           placeholder="Enter the youtube URL"
    //         />
    //       </Form.Item>

    //       <Form.Item
    //         name={["options", "youtube_mode"]}
    //         label="Youtube mode"
    //         rules={[
    //           {
    //             required: true,
    //             message: "Please select a youtube mode",
    //           },
    //         ]}
    //       >
    //         <Select
    //           options={[
    //             {
    //               label: "Transcribe using Whisper",
    //               value: "whisper",
    //             },
    //             {
    //               label: "Youtube Transcript",
    //               value: "transcript",
    //             },
    //           ]}
    //         />
    //       </Form.Item>
    //     </>
    //   ),
    // },
    {
      id: 8,
      value: "rest",
      title: "REST API",
      icon: ApiIcon,
      formComponent: (
        <>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item
                name={["options", "method"]}
                rules={[
                  {
                    required: true,
                    message: "Please select a method",
                  },
                ]}
              >
                <Select
                  options={[
                    {
                      label: "GET",
                      value: "get",
                    },
                    {
                      label: "POST",
                      value: "post",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item
                name="content"
                rules={[
                  {
                    required: true,
                    message: "Please enter a valid REST API URL",
                  },
                  {
                    pattern: new RegExp(/^(https?:\/\/)?(www\.)?(.+)\.(.+)$/),
                    message: "Please enter a valid REST API URL",
                  },
                ]}
              >
                <Input type="url" placeholder="Enter the REST API URL" />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      id: 9,
      value: "sitemap",
      title: "Sitemap",
      icon: SitemapIcon,
      formComponent: (
        <Form.Item
          name="content"
          rules={[
            {
              required: true,
              message: "Please enter the sitemap URL",
            },
          ]}
        >
          <Input type="url" placeholder="Enter the sitemap URL" />
        </Form.Item>
      ),
    },
  ]);

  const [selectedSource, _setSelectedSource] = React.useState<any>(
    showEmbeddingAndModels ? null : availableSources[0]
  );
  const { data: transcripts, isLoading: isFetchingTranscript } = useQuery({
    queryKey: [
      "fetchYoutubeTranscript",
      url,
      youtubeMode,
      selectedSource?.value,
    ],
    queryFn: async () => {
      if (Boolean(url) && youtubeMode === "transcript") {
        const res = await api.get("/yt/transcript?url=" + url);
        return res.data["data"] as {
          name: {
            simpleText: string;
          };
          languageCode: string;
        }[];
      }

      return [];
    },
    enabled:
      Boolean(url) &&
      youtubeMode === "transcript" &&
      selectedSource?.value === "youtube",
  });

  return (
    <>
      <Form
        layout="vertical"
        onFinish={createBot}
        form={form}
        className="space-y-6"
        initialValues={{
          embedding:
            botConfig?.defaultEmbeddingModel ||
            "dialoqbase_eb_text-embedding-ada-002",
          model: botConfig?.defaultChatModel || "openai/gpt-5.6-terra",
          maxDepth: 2,
          maxLinks: 10,
          options: {
            branch: "main",
            is_private: false,
            method: "get",
            headers: "{}",
            body: "{}",
            youtube_mode: "whisper",
          },
        }}
      >
        <RadioGroup
          value={selectedSource}
          onChange={(e: any) => {
            _setSelectedSource(e);
            setSelectedSource(e);
          }}
        >
          <RadioGroup.Label className="block text-sm font-semibold tracking-tight text-fg">
            Select a data source
          </RadioGroup.Label>
          <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">
            Where should your bot learn from?
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {availableSources.map((source) => (
              <RadioGroup.Option
                key={source.id}
                value={source}
                className={({ checked, active }) =>
                  classNames(
                    checked
                      ? "border-indigo-500 bg-indigo-50/60 shadow-soft ring-1 ring-indigo-500 dark:border-indigo-400 dark:bg-indigo-500/10 dark:ring-indigo-400"
                      : "border-line bg-surface shadow-soft hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised",
                    active && !checked ? "ring-2 ring-indigo-500/30" : "",
                    "group relative flex cursor-pointer flex-col items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 ease-out focus:outline-none"
                  )
                }
              >
                {({ checked }) => (
                  <>
                    <span
                      className={classNames(
                        checked
                          ? "bg-indigo-600 text-white ring-indigo-600 dark:bg-indigo-500 dark:ring-indigo-500"
                          : "bg-surface-2 text-fg-muted ring-line group-hover:text-indigo-600 dark:group-hover:text-indigo-300",
                        "flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset transition-colors"
                      )}
                    >
                      <source.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <RadioGroup.Label
                      as="span"
                      className={classNames(
                        checked
                          ? "text-indigo-700 dark:text-indigo-200"
                          : "text-fg",
                        "block text-sm font-medium"
                      )}
                    >
                      {source.title}
                    </RadioGroup.Label>

                    <CheckCircleIcon
                      className={classNames(
                        checked ? "scale-100 opacity-100" : "scale-75 opacity-0",
                        "pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-indigo-600 transition-all duration-200 ease-out dark:text-indigo-400"
                      )}
                      aria-hidden="true"
                    />
                  </>
                )}
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>

        {selectedSource && selectedSource.formComponent}

        {selectedSource && selectedSource.value === "rest" && (
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name={["options", "headers"]} label="Headers">
                <Input.TextArea placeholder="Enter the headers" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["options", "body"]}
                label="Body (JSON)"
                rules={[
                  {
                    required: true,
                    message: "Please enter a valid JSON",
                  },
                ]}
              >
                <Input.TextArea placeholder="Enter the body" />
              </Form.Item>
            </Col>
          </Row>
        )}

        {selectedSource &&
          selectedSource.value === "youtube" &&
          youtubeMode === "transcript" && (
            <>
              <Form.Item
                name={["options", "language_code"]}
                label="Select language"
                rules={[
                  {
                    required: true,
                    message: "Please select a language",
                  },
                ]}
              >
                <Select
                  loading={isFetchingTranscript}
                  placeholder="Select language"
                  options={transcripts?.map((transcript) => ({
                    label: transcript.name.simpleText,
                    value: transcript.languageCode,
                  }))}
                />
              </Form.Item>

              <p className="text-xs leading-relaxed text-fg-subtle">
                If you find any issues, please report them on{" "}
                <a
                  href={`https://myapps.ai`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Support
                </a>
                .
              </p>
            </>
          )}

        <Form.Item hidden={!showEmbeddingAndModels} noStyle>
          <Divider />
        </Form.Item>

        <Form.Item
          hidden={!showEmbeddingAndModels}
          label={
            <span className="text-sm font-medium text-fg">
              Chat Model
            </span>
          }
          name="model"
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toLowerCase() ?? "").includes(
                input?.toLowerCase()
              ) ||
              (option?.value?.toLowerCase() ?? "").includes(
                input?.toLowerCase()
              )
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            placeholder="Select a Chat Model"
            options={botConfig.chatModel}
          />
        </Form.Item>
        <Form.Item
          hidden={!showEmbeddingAndModels}
          label={
            <span className="text-sm font-medium text-fg">
              Embedding model
            </span>
          }
          name="embedding"
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toLowerCase() ?? "").includes(
                input?.toLowerCase()
              ) ||
              (option?.value?.toLowerCase() ?? "").includes(
                input?.toLowerCase()
              )
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={botConfig.embeddingModel}
            placeholder="Select an Embedding Model"
          />
        </Form.Item>

        <Form.Item>
          <button
            type="submit"
            disabled={isLoading}
            className="ui-btn-primary h-10 w-full"
          >
            {isLoading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
            )}
            {isLoading ? "Creating..." : "Create"}
          </button>
        </Form.Item>
      </Form>
    </>
  );
};
