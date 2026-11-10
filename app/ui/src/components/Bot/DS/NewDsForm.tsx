import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Upload,
  message,
  notification,
} from "antd";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCreateConfig } from "../../../hooks/useCreateConfig";
import { InboxIcon } from "@heroicons/react/24/outline";

// The source types this app can add, in tab order. `id` and `value` match the
// ones BotForm uses, so the submit payload is the same as before.
export const DS_SOURCE_TABS = [
  { id: 1, value: "website", label: "Website" },
  { id: 4, value: "crawl", label: "Crawl" },
  { id: 9, value: "sitemap", label: "Sitemap" },
  { id: 2, value: "file", label: "Files" },
  { id: 3, value: "text", label: "Text" },
  { id: 8, value: "rest", label: "REST API" },
] as const;

export type DsSourceKey = (typeof DS_SOURCE_TABS)[number]["value"];

const ALLOWED_FILE_TYPES = [
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

const SubmitButton = ({ isLoading }: { isLoading: boolean }) => (
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
    {isLoading ? "Adding..." : "Add source"}
  </button>
);

const Help = ({ children }: { children: React.ReactNode }) => (
  <p className="m-0 text-xs leading-relaxed text-fg-subtle">{children}</p>
);

// "Add a source" card body: underline tabs per source type, then the fields
// for that type. Replaces the old modal flow.
export const NewDsForm = ({
  onClose,
  selected,
  onSelect,
}: {
  onClose?: () => void;
  selected?: DsSourceKey;
  onSelect?: (key: DsSourceKey) => void;
}) => {
  const { data: botConfig, status: botConfigStatus } = useCreateConfig();
  const [innerSelected, setInnerSelected] =
    React.useState<DsSourceKey>("website");
  const current = selected ?? innerSelected;
  const selectedSource =
    DS_SOURCE_TABS.find((s) => s.value === current) || DS_SOURCE_TABS[0];
  const setSelected = (key: DsSourceKey) => {
    setInnerSelected(key);
    onSelect?.(key);
  };

  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const [form] = Form.useForm();
  const onSubmit = async (values: any) => {
    if (selectedSource.id == 2) {
      const formData = new FormData();
      values.file.forEach((file: any) => {
        formData.append("file", file.originFileObj);
      });
      const response = await api.post(
        `/bot/${params.id}/source/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    }
    const response = await api.post(`/bot/${params.id}/source`, {
      type: selectedSource.value.toLowerCase(),
      ...values,
    });
    return response.data;
  };

  const { mutateAsync: createBot, isLoading } = useMutation(onSubmit, {
    onSuccess: () => {
      client.invalidateQueries(["getBotDS", params.id]);
      onClose?.();
      notification.success({
        message: "Success",
        description: "New Source added successfully.",
      });
      form.resetFields();
    },
    onError: (e) => {
      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data?.message ||
          e?.response?.data?.error ||
          "Something went wrong.";
        notification.error({
          message: "Error",
          description: message,
        });
        return;
      }
      notification.error({
        message: "Error",
        description: "Something went wrong.",
      });
    },
  });

  const tabs = (
    <div
      role="tablist"
      aria-label="Source type"
      className="flex flex-wrap gap-1 border-b border-line px-5 pt-3"
    >
      {DS_SOURCE_TABS.map((tab) => {
        const active = tab.value === current;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setSelected(tab.value)}
            className={`ui-tab min-h-[36px] text-[13px] ${
              active ? "ui-tab-active" : ""
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  if (botConfigStatus === "loading") {
    return (
      <>
        {tabs}
        <div className="px-5 py-4">
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      </>
    );
  }

  if (botConfigStatus === "error") {
    return (
      <>
        {tabs}
        <div className="px-5 py-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            Something went wrong while fetching config
          </div>
        </div>
      </>
    );
  }

  const urlRow = (
    label: string,
    placeholder: string,
    requiredMessage: string,
    help: React.ReactNode
  ) => (
    <>
      <label htmlFor="ds-content" className="ui-label">
        {label}
      </label>
      <div className="flex flex-wrap items-start gap-2">
        <Form.Item
          name="content"
          className="mb-0 min-w-0 flex-[1_1_280px]"
          rules={[{ required: true, message: requiredMessage }]}
        >
          <Input
            id="ds-content"
            size="large"
            type="url"
            placeholder={placeholder}
          />
        </Form.Item>
        <SubmitButton isLoading={isLoading} />
      </div>
      <Help>{help}</Help>
    </>
  );

  let fields: React.ReactNode = null;
  switch (selectedSource.value) {
    case "website":
      fields = urlRow(
        "Page URL",
        "https://example.com/course/week-3",
        "Please enter the webpage URL",
        "Adds one page. Use Crawl or Sitemap to pull in a whole site."
      );
      break;
    case "sitemap":
      fields = urlRow(
        "Sitemap URL",
        "https://example.com/sitemap.xml",
        "Please enter the sitemap URL",
        "Adds every page listed in the sitemap."
      );
      break;
    case "crawl":
      fields = (
        <>
          <label htmlFor="ds-content" className="ui-label">
            Start URL
          </label>
          <Form.Item
            name="content"
            className="mb-0"
            rules={[
              { required: true, message: "Please enter the website URL" },
            ]}
          >
            <Input
              id="ds-content"
              size="large"
              type="url"
              placeholder="https://example.com"
            />
          </Form.Item>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Form.Item
              name="maxDepth"
              label="Max depth"
              className="mb-0"
              help="The max depth of the website to crawl"
              rules={[{ required: true, message: "Please input max depth!" }]}
            >
              <InputNumber
                size="large"
                placeholder="Enter the max depth"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="maxLinks"
              label="Max links"
              className="mb-0"
              help="The max links to crawl"
              rules={[
                { required: true, message: "Please input max links count" },
              ]}
            >
              <InputNumber
                size="large"
                placeholder="Enter the max links"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Help>Follows links from the start URL and adds each page.</Help>
            <SubmitButton isLoading={isLoading} />
          </div>
        </>
      );
      break;
    case "text":
      fields = (
        <>
          <label htmlFor="ds-content" className="ui-label">
            Text
          </label>
          <Form.Item
            name="content"
            className="mb-0"
            rules={[{ required: true, message: "Please enter the text" }]}
          >
            <Input.TextArea
              id="ds-content"
              placeholder="Paste or type the text your bot should know"
              rows={5}
            />
          </Form.Item>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Help>Good for FAQs, policies and short notes.</Help>
            <SubmitButton isLoading={isLoading} />
          </div>
        </>
      );
      break;
    case "file":
      fields = (
        <>
          <Form.Item
            name="file"
            className="mb-0"
            rules={[
              {
                required: true,
                message: `Please upload your files (PDF, Docx, CSV, TXT, MP3, MP4)`,
              },
            ]}
            getValueFromEvent={(e) => {
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
                if (!ALLOWED_FILE_TYPES.includes(file.type.toLowerCase())) {
                  message.error(
                    `File type not supported. Please upload a ${ALLOWED_FILE_TYPES} file.`
                  );
                  return Upload.LIST_IGNORE;
                }

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
              <div className="flex flex-col items-center gap-1.5 px-3 py-3">
                <InboxIcon
                  className="h-6 w-6 text-fg-subtle"
                  aria-hidden="true"
                />
                <p className="m-0 text-sm font-medium text-fg">
                  Drop files here or click to choose
                </p>
                <p className="m-0 text-xs text-fg-subtle">
                  PDF, Docx, CSV, TXT, MP3, MP4, Zip or JSON. Up to{" "}
                  {botConfig?.fileUploadSizeLimit} files at once.
                </p>
              </div>
            </Upload.Dragger>
          </Form.Item>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Help>Audio and video need English speech.</Help>
            <SubmitButton isLoading={isLoading} />
          </div>
        </>
      );
      break;
    case "rest":
      fields = (
        <>
          <label htmlFor="ds-content" className="ui-label">
            Endpoint
          </label>
          <div className="flex flex-wrap items-start gap-2">
            <Form.Item
              name={["options", "method"]}
              className="mb-0 w-28"
              rules={[{ required: true, message: "Please select a method" }]}
            >
              <Select
                size="large"
                aria-label="Method"
                options={[
                  { label: "GET", value: "get" },
                  { label: "POST", value: "post" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="content"
              className="mb-0 min-w-0 flex-[1_1_240px]"
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
              <Input
                id="ds-content"
                size="large"
                type="url"
                placeholder="https://api.example.com/items"
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Form.Item
              name={["options", "headers"]}
              label="Headers"
              className="mb-0"
            >
              <Input.TextArea placeholder="Enter the headers" />
            </Form.Item>
            <Form.Item
              name={["options", "body"]}
              label="Body (JSON)"
              className="mb-0"
              rules={[{ required: true, message: "Please enter a valid JSON" }]}
            >
              <Input.TextArea placeholder="Enter the body" />
            </Form.Item>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <Help>Adds the JSON the endpoint returns.</Help>
            <SubmitButton isLoading={isLoading} />
          </div>
        </>
      );
      break;
  }

  return (
    <>
      {tabs}
      <Form
        layout="vertical"
        onFinish={createBot}
        form={form}
        requiredMark={false}
        className="flex flex-col gap-2 px-5 pb-5 pt-4"
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
        {/* Same hidden fields the old BotForm sent with every source. */}
        <Form.Item name="model" hidden noStyle>
          <Input />
        </Form.Item>
        <Form.Item name="embedding" hidden noStyle>
          <Input />
        </Form.Item>
        {fields}
      </Form>
    </>
  );
};
