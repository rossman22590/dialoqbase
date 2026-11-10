import {
  Dropdown,
  Form,
  Input,
  InputNumber,
  notification,
  Select,
  Slider,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import {
  HELPFUL_ASSISTANT_WITH_CONTEXT_PROMPT,
  HELPFUL_ASSISTANT_WITHOUT_CONTEXT_PROMPT,
} from "../../../utils/prompts";
import { BotSettings } from "../../../@types/bot";
import { SettingsPwdP } from "./SettingPwdP";
import { SwitchControl, ToggleRow } from "./SettingsControls";
import { PreviewIframe } from "../Preview/PreviewIFrame";
import { DocumentDuplicateIcon, TrashIcon } from "@heroicons/react/24/outline";

type TabKey = "behavior" | "retrieval" | "access" | "advanced";

const TABS: { key: TabKey; label: string }[] = [
  { key: "behavior", label: "Behavior" },
  { key: "retrieval", label: "Retrieval" },
  { key: "access", label: "Access" },
  { key: "advanced", label: "Advanced" },
];

// Which tab each form field lives on, so a failed save can jump to it.
const FIELD_TAB: Record<string, TabKey> = {
  name: "behavior",
  model: "behavior",
  qaPrompt: "behavior",
  temperature: "behavior",
  streaming: "behavior",
  showRef: "behavior",
  internetSearchEnabled: "behavior",
  embedding: "retrieval",
  noOfDocumentsToRetrieve: "retrieval",
  noOfChatHistoryInContext: "retrieval",
  semanticSearchSimilarityScore: "retrieval",
  use_hybrid_search: "retrieval",
  bot_model_api_key: "access",
  inactivityTimeout: "access",
  bot_protect: "access",
  autoResetSession: "access",
  questionGeneratorPrompt: "advanced",
  autoSyncDataSources: "advanced",
};

const TOGGLE_LIST = "rounded-xl border border-line";

export const SettingsBody: React.FC<BotSettings> = ({
  data,
  chatModel,
  embeddingModel,
}) => {
  const [form] = Form.useForm();
  const [disableStreaming, setDisableStreaming] = React.useState(false);
  const [tab, setTab] = React.useState<TabKey>("behavior");
  const [dirty, setDirty] = React.useState(false);
  const [previewKey, setPreviewKey] = React.useState(0);
  const params = useParams<{ id: string }>();

  const client = useQueryClient();

  const onFinish = async (values: any) => {
    const response = await api.put(`/bot/${params.id}`, values);
    return response.data;
  };

  const { mutate: updateBotSettings, isLoading } = useMutation(onFinish, {
    onSuccess: () => {
      client.invalidateQueries(["getBotSettings", params.id]);
      setDirty(false);
      // Reload the preview so it picks up the saved settings.
      setPreviewKey((k) => k + 1);

      notification.success({
        message: "Bot updated successfully",
      });
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Something went wrong";
        notification.error({
          message,
        });
        return;
      }
      notification.error({
        message: "Something went wrong",
      });
    },
  });

  const navigate = useNavigate();

  const onDelete = async () => {
    const response = await api.delete(`/bot/${params.id}`);
    return response.data;
  };

  const onCopy = async () => {
    const response = await api.post(`/bot/${params.id}/copy`);
    return response.data;
  };
  const { mutate: deleteBot, isLoading: isDeleting } = useMutation(onDelete, {
    onSuccess: () => {
      client.invalidateQueries(["getAllBots"]);

      navigate("/");

      notification.success({
        message: "Bot deleted successfully",
      });
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Something went wrong";
        notification.error({
          message,
        });
        return;
      }

      notification.error({
        message: "Something went wrong",
      });
    },
  });

  const { mutate: copyBot, isLoading: isCopying } = useMutation(onCopy, {
    onSuccess: (data) => {
      client.invalidateQueries(["getAllBots"]);
      navigate(`/bot/${data.id}`);
      notification.success({
        message: "Bot copied successfully",
      });
    },
    onError: (error: any) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Something went wrong";
        notification.error({
          message,
        });
        return;
      }

      notification.error({
        message: "Something went wrong",
      });
    },
  });

  const currentModel = Form.useWatch("model", form);
  const temperature = Form.useWatch("temperature", form);

  const isStreamingSupported = (model: string) => {
    return chatModel.find((m) => m.value === model)?.stream === true;
  };

  React.useEffect(() => {
    if (!isStreamingSupported(currentModel) && currentModel) {
      form.setFieldsValue({
        streaming: false,
      });
      setDisableStreaming(true);
    } else {
      setDisableStreaming(false);
      form.setFieldsValue({
        streaming: true,
      });
    }
  }, [currentModel]);

  const panel = (key: TabKey) =>
    `flex flex-col gap-5 ${tab === key ? "" : "hidden"}`;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:flex-row">
      <div className="min-w-0 flex-1 px-4 pb-8 pt-6 sm:px-8 sm:pt-7">
        <div className="flex max-w-3xl flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 flex-1 text-2xl font-semibold tracking-tight text-fg">
              Settings
            </h1>
            {dirty && (
              <span className="text-[13px] text-fg-muted">Unsaved changes</span>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => form.submit()}
              className="ui-btn-primary"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Settings sections"
            className="flex flex-wrap gap-1 border-b border-line"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`ui-tab ${tab === t.key ? "ui-tab-active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Every tab stays mounted (just hidden) so the submit payload
              still contains every field, as before. */}
          <Form
            initialValues={{
              name: data.name,
              model: data.model,
              temperature: data.temperature,
              embedding: data.embedding,
              qaPrompt: data.qaPrompt,
              questionGeneratorPrompt: data.questionGeneratorPrompt,
              streaming: data.streaming,
              showRef: data.showRef,
              use_hybrid_search: data.use_hybrid_search,
              bot_protect: data.bot_protect,
              use_rag: data.use_rag,
              bot_model_api_key: data.bot_model_api_key,
              noOfDocumentsToRetrieve: data.noOfDocumentsToRetrieve,
              noOfChatHistoryInContext: data.noOfChatHistoryInContext,
              semanticSearchSimilarityScore: data.semanticSearchSimilarityScore,
              autoResetSession: data.autoResetSession,
              inactivityTimeout: data.inactivityTimeout,
              autoSyncDataSources: data.autoSyncDataSources,
              internetSearchEnabled: data.internetSearchEnabled,
            }}
            form={form}
            requiredMark={false}
            onFinish={updateBotSettings}
            onValuesChange={() => setDirty(true)}
            onFinishFailed={({ errorFields }) => {
              const first = errorFields?.[0]?.name?.[0];
              const target = first ? FIELD_TAB[String(first)] : undefined;
              if (target) setTab(target);
            }}
            layout="vertical"
            className="[&_.ant-form-item]:mb-0"
          >
            {/* Behavior */}
            <div role="tabpanel" className={panel("behavior")}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Project Name!",
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
                <Form.Item
                  name="model"
                  label="Model"
                  rules={[
                    {
                      required: true,
                      message: "Please select a model!",
                    },
                  ]}
                >
                  <Select
                    size="large"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label
                        ? option?.label?.toLowerCase()
                        : ""
                      ).includes(input?.toLowerCase())
                    }
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={chatModel}
                  />
                </Form.Item>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="settings-qaPrompt" className="ui-label">
                    Instructions
                  </label>
                  <Dropdown
                    trigger={["click"]}
                    placement="bottomRight"
                    menu={{
                      items: [
                        { key: "with", label: "Prompt with context" },
                        { key: "without", label: "Prompt without context" },
                      ],
                      onClick: ({ key }) => {
                        form.setFieldsValue({
                          qaPrompt:
                            key === "with"
                              ? HELPFUL_ASSISTANT_WITH_CONTEXT_PROMPT
                              : HELPFUL_ASSISTANT_WITHOUT_CONTEXT_PROMPT,
                        });
                        setDirty(true);
                      },
                    }}
                  >
                    <button
                      type="button"
                      className="border-0 bg-transparent p-0 text-[13px] text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                    >
                      Use template
                    </button>
                  </Dropdown>
                </div>
                <Form.Item
                  name="qaPrompt"
                  rules={[
                    {
                      required: true,
                      message: "Please input a prompt!",
                    },
                  ]}
                >
                  <Input.TextArea id="settings-qaPrompt" rows={7} />
                </Form.Item>
                <p className="ui-help m-0">
                  The system prompt your bot follows when it answers.
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[13px]">
                  <label htmlFor="settings-temperature" className="ui-label">
                    Creativity
                  </label>
                  <span className="tabular-nums text-fg-muted">
                    {typeof temperature === "number" ? temperature : ""}
                  </span>
                </div>
                <Form.Item
                  name="temperature"
                  rules={[
                    {
                      required: true,
                      message: "Please select a temperature!",
                    },
                  ]}
                >
                  <Slider
                    id="settings-temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    className="mx-1"
                  />
                </Form.Item>
                <div className="flex justify-between text-xs text-fg-subtle">
                  <span>Sticks to sources</span>
                  <span>More varied</span>
                </div>
              </div>

              <div className={TOGGLE_LIST}>
                <ToggleRow
                  first
                  label="Stream answers"
                  help={
                    disableStreaming
                      ? "Streaming is not supported for this model."
                      : "Show the answer as it is written."
                  }
                >
                  <Form.Item name="streaming" valuePropName="checked" noStyle>
                    <SwitchControl
                      label="Stream answers"
                      disabled={disableStreaming}
                    />
                  </Form.Item>
                </ToggleRow>
                <ToggleRow
                  label="Cite sources"
                  help="Show which sources an answer came from."
                >
                  <Form.Item name="showRef" valuePropName="checked" noStyle>
                    <SwitchControl label="Cite sources" />
                  </Form.Item>
                </ToggleRow>
                <ToggleRow
                  label="Search the internet"
                  help="Let it look beyond your sources. Experimental."
                >
                  <Form.Item
                    name="internetSearchEnabled"
                    valuePropName="checked"
                    noStyle
                  >
                    <SwitchControl label="Search the internet" />
                  </Form.Item>
                </ToggleRow>
              </div>
            </div>

            {/* Retrieval */}
            <div role="tabpanel" className={panel("retrieval")}>
              <Form.Item
                label="Embedding method"
                name="embedding"
                extra="If you change it, re-sync your data sources or pick a model with the same dimensions."
              >
                <Select
                  size="large"
                  placeholder="Select an embedding method"
                  options={embeddingModel}
                />
              </Form.Item>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Form.Item
                  name="noOfDocumentsToRetrieve"
                  label="Documents to retrieve"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please input a number of documents to retrieve!",
                    },
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter number of documents to retrieve"
                  />
                </Form.Item>
                <Form.Item
                  name="noOfChatHistoryInContext"
                  label="Chat history in context"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please input a number of chat history in context!",
                    },
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter number of chat history in context"
                  />
                </Form.Item>
              </div>
              <Form.Item
                label="Similarity threshold"
                name="semanticSearchSimilarityScore"
                rules={[
                  {
                    required: true,
                    message: "Please input a similarity score!",
                  },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Select a similarity score"
                  options={[
                    { label: "Consider all documents", value: "none" },
                    {
                      label: "Similarity Score >= 0.2",
                      value: "0.2",
                    },
                    {
                      label: "Similarity Score >= 0.5",
                      value: "0.5",
                    },
                    {
                      label: "Similarity Score >= 0.7",
                      value: "0.7",
                    },
                  ]}
                />
              </Form.Item>
              <div className={TOGGLE_LIST}>
                <ToggleRow
                  first
                  label="Hybrid search"
                  help="Mix keyword and semantic search when finding sources. Playground only."
                >
                  <Form.Item
                    name="use_hybrid_search"
                    valuePropName="checked"
                    noStyle
                  >
                    <SwitchControl label="Hybrid search" />
                  </Form.Item>
                </ToggleRow>
              </div>
            </div>

            {/* Access */}
            <div role="tabpanel" className={panel("access")}>
              <Form.Item
                name="bot_model_api_key"
                label="Chat model API key"
                extra="Use your own key for the chat model. OpenRouter keys work for all models. Leave blank to use the default."
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your API key here"
                />
              </Form.Item>
              <Form.Item
                name="inactivityTimeout"
                label="Inactivity timeout (seconds)"
                extra="After this long without a message, the chat session resets."
                rules={[
                  {
                    required: true,
                    message: "Please input an inactivity timeout!",
                  },
                ]}
              >
                <InputNumber
                  size="large"
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Enter inactivity timeout"
                />
              </Form.Item>
              <div className={TOGGLE_LIST}>
                <ToggleRow
                  first
                  label="Public bot protection"
                  help="Uses sessions to stop misuse of the public bot."
                >
                  <Form.Item
                    name="bot_protect"
                    valuePropName="checked"
                    noStyle
                  >
                    <SwitchControl label="Public bot protection" />
                  </Form.Item>
                </ToggleRow>
                <ToggleRow
                  label="Auto reset chat session"
                  help="Reset after the inactivity timeout. Useful for Telegram, WhatsApp and similar."
                >
                  <Form.Item
                    name="autoResetSession"
                    valuePropName="checked"
                    noStyle
                  >
                    <SwitchControl label="Auto reset chat session" />
                  </Form.Item>
                </ToggleRow>
              </div>
            </div>

            {/* Advanced */}
            <div role="tabpanel" className={panel("advanced")}>
              <Form.Item
                label="Question generator prompt"
                name="questionGeneratorPrompt"
                extra="Rewrites follow-up questions so they make sense on their own."
                rules={[
                  {
                    required: true,
                    message: "Please input a prompt!",
                  },
                ]}
              >
                <Input.TextArea rows={5} />
              </Form.Item>
              <div className={TOGGLE_LIST}>
                <ToggleRow
                  first
                  label="Auto sync data sources"
                  help="Re-fetch URL-based sources on a schedule."
                >
                  <Form.Item
                    name="autoSyncDataSources"
                    valuePropName="checked"
                    noStyle
                  >
                    <SwitchControl label="Auto sync data sources" />
                  </Form.Item>
                </ToggleRow>
              </div>
            </div>
          </Form>

          {tab === "access" && (
            <SettingsPwdP
              publicBotPwd={data.publicBotPwd}
              publicBotPwdProtected={data.publicBotPwdProtected}
            />
          )}

          {tab === "advanced" && (
            <>
              <section className="ui-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="m-0 text-sm font-medium text-fg">
                    Make a copy
                  </h2>
                  <p className="m-0 mt-0.5 text-[13px] text-fg-muted">
                    Creates a new bot with the same settings. Integrations need
                    to be set up again.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const confirm = window.confirm(
                      "Are you sure you want to make a copy of this bot?"
                    );
                    if (confirm) {
                      copyBot();
                    }
                  }}
                  className="ui-btn-secondary shrink-0 self-start sm:self-auto"
                >
                  <DocumentDuplicateIcon />
                  {isCopying ? "Copying..." : "Make a copy"}
                </button>
              </section>

              <section
                aria-label="Danger zone"
                className="flex flex-col gap-3 rounded-xl border border-red-200 px-4 py-4 dark:border-red-500/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h2 className="m-0 text-sm font-medium text-red-700 dark:text-red-300">
                    Delete this bot
                  </h2>
                  <p className="m-0 mt-0.5 text-[13px] text-fg-muted">
                    Permanently deletes the bot and all of its data. This
                    can't be undone.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const confirm = window.confirm(
                      "Are you sure you want to delete this bot?"
                    );
                    if (confirm) {
                      deleteBot();
                    }
                  }}
                  type="button"
                  className="ui-btn-danger-outline shrink-0 self-start sm:self-auto"
                >
                  <TrashIcon />
                  {isDeleting ? "Deleting..." : "Delete bot"}
                </button>
              </section>
            </>
          )}
        </div>
      </div>

      <aside
        aria-label="Live preview"
        className="flex flex-col gap-3 border-t border-line bg-app p-5 lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:w-[360px] lg:shrink-0 lg:border-l lg:border-t-0"
      >
        <div className="flex items-center gap-2">
          <h2 className="m-0 flex-1 text-[13px] font-semibold text-fg-muted">
            Preview
          </h2>
          <button
            type="button"
            onClick={() => setPreviewKey((k) => k + 1)}
            className="ui-btn-secondary h-[30px] px-2.5 text-xs font-normal"
          >
            Restart
          </button>
        </div>
        <div className="h-[560px] overflow-hidden rounded-[14px] border border-line bg-white lg:h-auto lg:flex-1">
          <PreviewIframe key={previewKey} public_id={data.public_id} fill />
        </div>
        <p className="m-0 text-xs text-fg-subtle">
          Uses your saved settings. Save to see changes here.
        </p>
      </aside>
    </div>
  );
};
