import {
  ConfigProvider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  // Switch,
  Upload,
  message,
} from "antd";
import { RadioGroup } from "@headlessui/react";
import React from "react";
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
  // Shows a Cancel button next to the submit button when given.
  onCancel?: () => void;
};
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const formatSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// antd Form tuned to the mock: 13px labels, tighter field spacing, small help.
const formClass = [
  "[&_.ant-form-item]:!mb-4",
  "[&_.ant-form-item-label]:!pb-1.5",
  "[&_.ant-form-item-label>label]:!h-auto",
  "[&_.ant-form-item-label>label]:!text-[13px]",
  "[&_.ant-form-item-label>label]:!font-medium",
  "[&_.ant-form-item-label>label]:!text-fg",
  "[&_.ant-form-item-explain]:!mt-1",
  "[&_.ant-form-item-explain]:!text-xs",
  "[&_.ant-form-item-extra]:!mt-1",
  "[&_.ant-form-item-extra]:!min-h-0",
  "[&_.ant-form-item-extra]:!text-xs",
  "[&_.ant-form-item-extra]:!text-fg-subtle",
].join(" ");

const draggerClass = [
  "[&_.ant-upload-drag]:!rounded-[10px]",
  "[&_.ant-upload-drag]:!border-[1.5px]",
  "[&_.ant-upload-drag]:!border-dashed",
  "[&_.ant-upload-drag]:!border-line-strong",
  "[&_.ant-upload-drag]:!bg-app",
  "[&_.ant-upload-drag:hover]:!border-indigo-500",
  "[&_.ant-upload-drag-hover]:!border-indigo-500",
  "[&_.ant-upload-btn]:!px-4",
  "[&_.ant-upload-btn]:!py-7",
  "[&_.ant-upload-list]:!mt-2",
  "[&_.ant-upload-list]:!flex",
  "[&_.ant-upload-list]:!flex-col",
  "[&_.ant-upload-list]:!gap-2",
].join(" ");

export const BotForm = ({
  createBot,
  isLoading,
  setSelectedSource,
  form,
  showEmbeddingAndModels,
  botConfig,
  onCancel,
}: Props) => {
  const youtubeMode = Form.useWatch(["options", "youtube_mode"], form);
  const url = Form.useWatch(["content"], form);
  // Listed in the order the mock shows them.
  const [availableSources] = React.useState([
    {
      id: 2,
      value: "file",
      title: "Files",
      hint: "PDF, Word, CSV…",
      formComponent: (
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
            className={draggerClass}
            accept={`.pdf,.docx,.csv,.txt,.mp3,.mp4,.zip,.json`}
            multiple={true}
            maxCount={botConfig?.fileUploadSizeLimit}
            itemRender={(_node, file, _list, actions) => (
              <div className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-[13px]">
                <span className="min-w-0 flex-1 truncate text-fg">
                  {file.name}
                </span>
                <span className="shrink-0 text-fg-subtle">
                  {formatSize(file.size)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={actions.remove}
                  className="ui-btn-ghost h-7 w-7 shrink-0 px-0 text-base"
                >
                  ×
                </button>
              </div>
            )}
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
            <div className="flex flex-col items-center gap-2 text-center">
              <svg
                aria-hidden="true"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-fg-muted"
              >
                <path d="M12 16V4M7 9l5-5 5 5" />
                <path d="M4 16v4h16v-4" />
              </svg>
              <p className="text-sm text-fg">
                Drag files here or{" "}
                <span className="font-medium text-indigo-700 dark:text-indigo-300">
                  choose files
                </span>
              </p>
              <p className="text-xs text-fg-subtle">
                PDF, Word, CSV, TXT, MP3, MP4, Zip or JSON
                {botConfig?.fileUploadSizeLimit
                  ? `, up to ${botConfig.fileUploadSizeLimit} files`
                  : ""}
              </p>
            </div>
          </Upload.Dragger>
        </Form.Item>
      ),
    },
    {
      id: 1,
      value: "website",
      title: "Website",
      hint: "One page",
      formComponent: (
        <Form.Item
          name="content"
          label="Page URL"
          rules={[
            {
              required: true,
              message: "Please enter the webpage URL",
            },
          ]}
        >
          <Input type="url" placeholder="https://example.com/page" />
        </Form.Item>
      ),
    },
    {
      id: 4,
      value: "crawl",
      title: "Crawl",
      hint: "A whole site",
      formComponent: (
        <>
          <Form.Item
            name="content"
            label="Website URL"
            rules={[
              {
                required: true,
                message: "Please enter the website URL",
              },
            ]}
          >
            <Input type="url" placeholder="https://example.com" />
          </Form.Item>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item
              name="maxDepth"
              label="Max depth"
              extra="How many links deep to follow."
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
              label="Max links"
              extra="The most pages to read."
              rules={[
                {
                  required: true,
                  message: "Please input max links count",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter the max links"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>
        </>
      ),
    },
    {
      id: 9,
      value: "sitemap",
      title: "Sitemap",
      hint: "sitemap.xml",
      formComponent: (
        <Form.Item
          name="content"
          label="Sitemap URL"
          rules={[
            {
              required: true,
              message: "Please enter the sitemap URL",
            },
          ]}
        >
          <Input type="url" placeholder="https://example.com/sitemap.xml" />
        </Form.Item>
      ),
    },
    {
      id: 3,
      value: "text",
      title: "Text",
      hint: "Paste it in",
      formComponent: (
        <Form.Item
          name="content"
          label="Text"
          rules={[
            {
              required: true,
              message: "Please enter the text",
            },
          ]}
        >
          <Input.TextArea placeholder="Paste the text your bot should know" rows={6} />
        </Form.Item>
      ),
    },
    // GitHub and YouTube sources are switched off for now.
    {
      id: 8,
      value: "rest",
      title: "REST API",
      hint: "JSON endpoint",
      formComponent: (
        <div className="flex gap-3">
          <Form.Item
            name={["options", "method"]}
            label="Method"
            className="w-28 shrink-0"
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
          <Form.Item
            name="content"
            label="Endpoint URL"
            className="min-w-0 flex-1"
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
            <Input type="url" placeholder="https://api.example.com/data" />
          </Form.Item>
        </div>
      ),
    },
  ]);

  const [selectedSource, _setSelectedSource] = React.useState<any>(
    showEmbeddingAndModels
      ? null
      : availableSources.find((s) => s.value === "website")
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

  const modelSelectProps = {
    showSearch: true,
    filterOption: (input: string, option?: { label?: string; value?: string }) =>
      (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase()) ||
      (option?.value?.toLowerCase() ?? "").includes(input?.toLowerCase()),
    filterSort: (
      optionA: { label?: string },
      optionB: { label?: string }
    ) =>
      (optionA?.label ?? "")
        .toLowerCase()
        .localeCompare((optionB?.label ?? "").toLowerCase()),
  };

  return (
    <ConfigProvider theme={{ token: { controlHeight: 40 } }}>
      <Form
        layout="vertical"
        onFinish={createBot}
        form={form}
        requiredMark={false}
        className={formClass}
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
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6">
          <RadioGroup
            value={selectedSource}
            onChange={(e: any) => {
              _setSelectedSource(e);
              setSelectedSource(e);
            }}
          >
            <RadioGroup.Label
              as="h2"
              className="text-base font-semibold text-fg"
            >
              Where should it learn from?
            </RadioGroup.Label>
            <p className="mt-1 text-sm text-fg-muted">Pick one to start.</p>

            <div className="mt-4 grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
              {availableSources.map((source) => (
                <RadioGroup.Option
                  key={source.id}
                  value={source}
                  className={({ checked, active }) =>
                    classNames(
                      checked
                        ? "border-[1.5px] border-indigo-600 ring-[3px] ring-indigo-50 dark:border-indigo-400 dark:ring-indigo-500/15"
                        : "border border-line hover:border-line-strong",
                      active && !checked ? "ring-2 ring-indigo-500/30" : "",
                      "flex min-h-[56px] cursor-pointer flex-col items-start gap-0.5 rounded-[10px] bg-surface px-3 py-2.5 text-left transition-colors focus:outline-none"
                    )
                  }
                >
                  <RadioGroup.Label
                    as="span"
                    className="text-sm font-medium text-fg"
                  >
                    {source.title}
                  </RadioGroup.Label>
                  <RadioGroup.Description
                    as="span"
                    className="text-xs text-fg-subtle"
                  >
                    {source.hint}
                  </RadioGroup.Description>
                </RadioGroup.Option>
              ))}
            </div>
          </RadioGroup>

          {selectedSource && (
            <div className="-mb-4">{selectedSource.formComponent}</div>
          )}

          {selectedSource && selectedSource.value === "rest" && (
            <div className="-mb-4 grid gap-x-4 sm:grid-cols-2">
              <Form.Item name={["options", "headers"]} label="Headers">
                <Input.TextArea placeholder="Enter the headers" />
              </Form.Item>
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
            </div>
          )}

          {selectedSource &&
            selectedSource.value === "youtube" &&
            youtubeMode === "transcript" && (
              <div className="-mb-4">
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
              </div>
            )}
        </div>

        <div
          className={
            showEmbeddingAndModels
              ? "flex flex-col gap-4 border-t border-line px-5 pb-1 pt-5 sm:px-6"
              : "hidden"
          }
        >
          <div>
            <h2 className="text-base font-semibold text-fg">Pick a model</h2>
            <p className="mt-1 text-sm text-fg-muted">
              You can change both later in the bot's settings.
            </p>
          </div>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item
              hidden={!showEmbeddingAndModels}
              label="Chat model"
              extra="Writes the answers."
              name="model"
            >
              <Select
                {...modelSelectProps}
                placeholder="Select a Chat Model"
                options={botConfig.chatModel}
              />
            </Form.Item>
            <Form.Item
              hidden={!showEmbeddingAndModels}
              label="Embedding model"
              extra="Indexes your sources for search."
              name="embedding"
            >
              <Select
                {...modelSelectProps}
                options={botConfig.embeddingModel}
                placeholder="Select an Embedding Model"
              />
            </Form.Item>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3.5 sm:px-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="ui-btn-secondary h-10 px-4"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="ui-btn-primary h-10 px-4"
          >
            {isLoading && (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
            )}
            {isLoading ? "Creating..." : "Create bot"}
          </button>
        </div>
      </Form>
    </ConfigProvider>
  );
};
