import React from "react";
import { BotIntegrationAPI } from "../../../../@types/bot";
import { Form, Input, Select, notification } from "antd";
import { ArrowPathIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { CopyTextButton } from "../../Embed/EmbedBoardCard";
import { SwitchControl } from "../../Settings/SettingsControls";
import APICodeGenerator from "./APICodeGenerator";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "./ApiResponse";
import api from "../../../../services/api";
import { useParams } from "react-router-dom";
const ApiPlaygroundComponent: React.FC<BotIntegrationAPI> = ({ data }) => {
  const [form] = Form.useForm();

  const message = Form.useWatch("message", form);

  const history = Form.useWatch("history", form);

  const stream = Form.useWatch("stream", form);

  const client = useQueryClient();

  const param = useParams<{ id: string }>();

  const [hostUrl] = React.useState<string>(
    () =>
      import.meta.env.VITE_HOST_URL ||
      window.location.protocol + "//" + window.location.host
  );
  const { mutate: regenerateAPIKey, isLoading: isGeneratingAPIKey } =
    useMutation(
      async () => {
        const response = await api.put(`/bot/integration/${param.id}/api`);
        return response.data;
      },
      {
        onSuccess: () => {
          notification.success({
            message: "Success",
            description: "API key re-generated successfully.",
          });
          client.invalidateQueries(["getBotIntegrationAPI"]);
        },
        onError: (e) => {
          console.log(e);
          notification.error({
            message: "Error",
            description:
              "Something went wrong while re-generating the API key.",
          });
        },
      }
    );

  const [apiResponse, setApiResponse] = React.useState<any>(null);

  const handleSubmit = async (values: any) => {
    try {
      const res = await axios.post(
        `${hostUrl}/bot/${data.public_url}/api`,
        values,
        {
          headers: {
            "content-type": "application/json",
            "x-api-key": `${data.api_key}`,
          },
        }
      );
      return {
        data: res.data,
        status: res.status,
      };
    } catch (err: any) {
      return {
        data: err?.response?.data,
        status: err?.response?.status || 500,
      };
    }
  };

  const { mutate: showResponse, isLoading } = useMutation(handleSubmit, {
    onSuccess: (data) => {
      setApiResponse(data);
    },
  });

  const fieldLabel = (name: string, type: string) => (
    <span className="flex items-baseline gap-2">
      <span className="font-mono text-[13px] font-medium text-fg">{name}</span>
      <span className="font-mono text-[11px] font-normal text-fg-subtle">
        {type}
      </span>
    </span>
  );

  const endpoint = `${hostUrl}/bot/${data.public_url}/api`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-line px-3 py-2.5 font-mono text-[13px] text-fg">
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300">
            POST
          </span>
          <span className="min-w-0 flex-[1_1_260px] [overflow-wrap:anywhere]">
            {endpoint}
          </span>
          <CopyTextButton value={endpoint} />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-line px-3 py-2.5 font-mono text-[13px] text-fg">
          <span className="rounded-md bg-surface-2 px-2 py-0.5 font-semibold text-fg-muted">
            x-api-key
          </span>
          <span className="min-w-0 flex-[1_1_260px] [overflow-wrap:anywhere]">
            {data.api_key || ""}
          </span>
          <div className="flex gap-2">
            <CopyTextButton value={data.api_key || ""} />
            <button
              type="button"
              onClick={() => !isGeneratingAPIKey && regenerateAPIKey()}
              className="ui-btn-secondary h-[30px] px-2.5 text-xs font-normal"
            >
              <ArrowPathIcon
                className={isGeneratingAPIKey ? "animate-spin" : ""}
              />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-5">
        <APICodeGenerator
          api={endpoint}
          xApiKey={data.api_key || ""}
          body={JSON.stringify(
            {
              message,
              history,
              stream,
            },
            null,
            2
          )}
        />

        <section
          aria-labelledby="api-try-h"
          className="ui-card flex min-w-0 flex-[1_1_320px] flex-col gap-3 p-4"
        >
          <h2 id="api-try-h" className="m-0 text-[15px] font-semibold text-fg">
            Try it
          </h2>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={showResponse}
            className="flex flex-col gap-3 [&_.ant-form-item]:mb-0"
            initialValues={{
              stream: true,
              history: [],
              message: "",
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="api-message">
                {fieldLabel("message", "string")}
              </label>
              <div className="flex items-start gap-2">
                <Form.Item
                  className="min-w-0 flex-1"
                  rules={[
                    {
                      required: true,
                      message: "field 'message' is required by the API",
                    },
                  ]}
                  name="message"
                >
                  <Input
                    id="api-message"
                    size="large"
                    type="text"
                    placeholder="Enter your message here"
                  />
                </Form.Item>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ui-btn-primary h-10 shrink-0"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>

            <Form.List name="history">
              {(fields, { add, remove }) => (
                <div className="flex flex-col gap-2 rounded-lg border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    {fieldLabel("history", "array")}
                    <button
                      type="button"
                      onClick={() =>
                        add({
                          role: "",
                          text: "",
                        })
                      }
                      className="ui-btn-ghost h-7 px-2 text-xs"
                    >
                      <PlusIcon />
                      Add
                    </button>
                  </div>
                  {fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 rounded-lg bg-surface-2 p-2.5 sm:flex-row sm:items-start"
                    >
                      <Form.Item
                        required={true}
                        key={field.key}
                        name={[field.name, "role"]}
                        className="sm:w-28"
                      >
                        <Select
                          aria-label="role"
                          placeholder="role"
                          options={[
                            {
                              label: "human",
                              value: "human",
                            },
                            {
                              label: "ai",
                              value: "ai",
                            },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item
                        required={true}
                        key={`${field.key}-text`}
                        name={[field.name, "text"]}
                        className="min-w-0 flex-1"
                      >
                        <Input aria-label="text" placeholder="text" />
                      </Form.Item>
                      <button
                        type="button"
                        aria-label="Remove history item"
                        onClick={() => remove(field.name)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-lg text-fg-subtle hover:bg-surface hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:text-red-400 sm:self-auto"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="m-0 text-xs text-fg-subtle">
                      Earlier turns of the chat, each with a role (human or
                      ai) and text.
                    </p>
                  )}
                </div>
              )}
            </Form.List>

            <div className="flex items-center gap-3">
              <div className="flex-1">{fieldLabel("stream", "boolean")}</div>
              <Form.Item name="stream" valuePropName="checked" noStyle>
                <SwitchControl label="stream" />
              </Form.Item>
            </div>
          </Form>

          {apiResponse && (
            <ApiResponse
              status={apiResponse.status}
              data={JSON.stringify(apiResponse.data, null, 2)}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default ApiPlaygroundComponent;
