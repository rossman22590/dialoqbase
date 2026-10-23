import {
  Form,
  Input,
  InputNumber,
  notification,
  Select,
  Slider,
  Switch,
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
import { Card, CardBody, CardFooter, CardHeader, PageHeader } from "../../ui";
import {
  ChatBubbleBottomCenterTextIcon,
  CpuChipIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Bordered tile that frames a single switch setting.
const TOGGLE_TILE =
  "rounded-xl border border-line bg-surface-2/40 px-4 pt-3 [&_.ant-form-item]:mb-3";

export const SettingsBody: React.FC<BotSettings> = ({
  data,
  chatModel,
  embeddingModel,
}) => {
  const [form] = Form.useForm();
  const [disableStreaming, setDisableStreaming] = React.useState(false);
  const params = useParams<{ id: string }>();

  const client = useQueryClient();

  const onFinish = async (values: any) => {
    const response = await api.put(`/bot/${params.id}`, values);
    return response.data;
  };

  const { mutate: updateBotSettings, isLoading } = useMutation(onFinish, {
    onSuccess: () => {
      client.invalidateQueries(["getBotSettings", params.id]);

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

  const saveButton = (
    <button type="submit" className="ui-btn-primary">
      {isLoading ? "Saving..." : "Save"}
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure the model, retrieval and prompts behind your bot, plus who can reach it."
      />
      <div className="mt-8 space-y-6">
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
          layout="vertical"
          className="space-y-6"
        >
          <Card>
            <CardHeader
              icon={<CpuChipIcon />}
              title="General"
              description="Bot name, chat model and how it generates answers."
            />
            <CardBody>
              <Form.Item
                name="name"
                label="Project Name"
                rules={[
                  {
                    required: true,
                    message: "Please input your Project Name!",
                  },
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
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
                <Form.Item
                  label={"Embedding Method"}
                  name="embedding"
                  help={
                    <>
                      <p className="text-xs leading-relaxed text-fg-subtle">
                        If you change the embedding method, make sure to
                        re-fetch the data source or choose a model with the same
                        dimensions
                      </p>
                    </>
                  }
                >
                  <Select
                    placeholder="Select an embedding method"
                    options={embeddingModel}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="temperature"
                label="Temperature"
                className="mt-6"
                rules={[
                  {
                    required: true,
                    message: "Please select a temperature!",
                  },
                ]}
              >
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-1 block w-full"
                />
              </Form.Item>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className={TOGGLE_TILE}>
                  <Form.Item
                    hasFeedback={!isStreamingSupported(currentModel)}
                    help={
                      !isStreamingSupported(currentModel) &&
                      "Streaming is not supported for this model."
                    }
                    name="streaming"
                    label="Streaming"
                    valuePropName="checked"
                  >
                    <Switch disabled={disableStreaming} />
                  </Form.Item>
                </div>

                <div className={TOGGLE_TILE}>
                  <Form.Item
                    name="showRef"
                    label="Cite sources in the chat"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<MagnifyingGlassIcon />}
              title="Retrieval"
              description="How much context your bot pulls in before it answers."
            />
            <CardBody>
              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                <Form.Item
                  name="noOfDocumentsToRetrieve"
                  label="Number of documents to retrieve"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please input a number of documents to retrieve!",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter number of documents to retrieve"
                  />
                </Form.Item>
                <Form.Item
                  name="noOfChatHistoryInContext"
                  label="Number of chat histories in context"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please input a number of chat history in context!",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter number of chat history in context"
                  />
                </Form.Item>
              </div>
              <Form.Item
                label={"Semantic Search Similarity Score"}
                name="semanticSearchSimilarityScore"
                rules={[
                  {
                    required: true,
                    message: "Please input a similarity score!",
                  },
                ]}
              >
                <Select
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className={TOGGLE_TILE}>
                  <Form.Item
                    name="internetSearchEnabled"
                    label="Enable internet search"
                    valuePropName="checked"
                    help="This is experimental and may not work as expected."
                  >
                    <Switch />
                  </Form.Item>
                </div>
                <div className={TOGGLE_TILE}>
                  <Form.Item
                    name="use_hybrid_search"
                    label="Use Hybrid Search Retrieval"
                    valuePropName="checked"
                    tooltip="This will use the hybrid search retrieval method instead of the default semantic search retrieval method. Only work on playground ui."
                  >
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<ChatBubbleBottomCenterTextIcon />}
              title="Prompts"
              description="The instructions your bot follows when answering and rephrasing questions."
            />
            <CardBody>
              <Form.Item
                label={"Question Answering Prompt (System Prompt)"}
                name="qaPrompt"
                className="mb-3"
                rules={[
                  {
                    required: true,
                    message: "Please input a prompt!",
                  },
                ]}
              >
                <Input.TextArea size="large" rows={5} placeholder="" />
              </Form.Item>

              <div className="mb-6 flex flex-row flex-wrap items-center justify-start gap-2">
                <span className="text-xs text-fg-subtle">Use a preset:</span>
                <button
                  type="button"
                  onClick={() => {
                    form.setFieldsValue({
                      qaPrompt: HELPFUL_ASSISTANT_WITH_CONTEXT_PROMPT,
                    });
                  }}
                  className="ui-btn-secondary h-8 rounded-lg px-2.5 text-xs"
                >
                  Prompt with context
                </button>
                <button
                  type="button"
                  onClick={() => {
                    form.setFieldsValue({
                      qaPrompt: HELPFUL_ASSISTANT_WITHOUT_CONTEXT_PROMPT,
                    });
                  }}
                  className="ui-btn-secondary h-8 rounded-lg px-2.5 text-xs"
                >
                  Prompt without context
                </button>
              </div>

              <Form.Item
                label={"Question Generator Prompt"}
                name="questionGeneratorPrompt"
                rules={[
                  {
                    required: true,
                    message: "Please input a prompt!",
                  },
                ]}
              >
                <Input.TextArea size="large" rows={5} />
              </Form.Item>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<ShieldCheckIcon />}
              title="Access & sessions"
              description="Protection, your own model key, and how chat sessions are kept fresh."
            />
            <CardBody>
              <Form.Item
                name="bot_model_api_key"
                label="Chat Model API Key"
                help="Enter your API key here. If you don't have one, you can leave this field blank."
                tooltip="Enter your API key to use your own chat model. OpenRouter API keys are supported for all models."
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your API key here"
                />
              </Form.Item>

              <Form.Item
                name="inactivityTimeout"
                label="Inactivity Timeout"
                className="mt-6"
                help="Enter the time in seconds after which the chat session will be reset."
                rules={[
                  {
                    required: true,
                    message: "Please input an inactivity timeout!",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Enter inactivity timeout"
                />
              </Form.Item>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className={TOGGLE_TILE}>
                  <Form.Item
                    name="bot_protect"
                    label="Activate Public Bot Protection"
                    valuePropName="checked"
                    tooltip="This will activate the public bot protection using session to avoid misuse of the bot"
                  >
                    <Switch />
                  </Form.Item>
                </div>
                <div className={TOGGLE_TILE}>
                  <Form.Item
                    name="autoResetSession"
                    label="Auto Reset Chat Session"
                    tooltip="This will reset the chat session after a certain period of inactivity. Useful for platforms like Telegram, WhatsApp, etc."
                  >
                    <Switch />
                  </Form.Item>
                </div>
                <div className={TOGGLE_TILE}>
                  <Form.Item
                    name="autoSyncDataSources"
                    label="Auto Sync Data Source(s)"
                    tooltip="This will automatically re-fetch the URL-based data sources at a certain interval."
                  >
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* One save for the whole form: every section above is a single submit. */}
          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-float backdrop-blur sm:px-5">
            <p className="text-sm text-fg-muted">
              Changes apply to all sections above.
            </p>
            {saveButton}
          </div>
        </Form>

        <SettingsPwdP
          publicBotPwd={data.publicBotPwd}
          publicBotPwdProtected={data.publicBotPwdProtected}
        />

        <Card>
          <CardHeader
            icon={<DocumentDuplicateIcon />}
            title="Make a copy of your bot"
            description="This action will create a new bot with the same settings as this bot, except for the Integration settings that need to be reconfigured."
          />
          <CardFooter className="justify-start sm:justify-end">
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
              className="ui-btn-secondary"
            >
              <DocumentDuplicateIcon />
              {isCopying ? "Copying..." : "Make a copy"}
            </button>
          </CardFooter>
        </Card>

        <section
          aria-label="Danger zone"
          className="rounded-2xl border border-red-200 bg-red-50/60 shadow-soft dark:border-red-500/25 dark:bg-red-500/[0.06]"
        >
          <div className="flex items-start gap-3 border-b border-red-200/80 px-5 py-4 dark:border-red-500/20 sm:px-6">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 ring-1 ring-inset ring-red-200 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/20">
              <ExclamationTriangleIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-red-700 dark:text-red-300">
                Danger zone
              </h2>
              <p className="mt-0.5 text-sm leading-relaxed text-red-700/80 dark:text-red-300/70">
                Irreversible actions. Proceed with care.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-fg">Delete your bot</h3>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-fg-muted">
                This action cannot be undone. This will permanently delete your
                bot and all of its data.
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
              className="ui-btn-danger shrink-0 self-start sm:self-auto"
            >
              <TrashIcon />
              {isDeleting ? "Deleting..." : "Delete bot"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
