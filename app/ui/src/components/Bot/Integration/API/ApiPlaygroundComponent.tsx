import React from "react";
import { BotIntegrationAPI } from "../../../../@types/bot";
import { CopyBtn } from "../../../Common/CopyBtn";
import { Form, Input, Select, Switch, Tooltip, notification } from "antd";
import {
  ArrowPathIcon,
  BeakerIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  MinusIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import APICodeGenerator from "./APICodeGenerator";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "./ApiResponse";
import api from "../../../../services/api";
import { useParams } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../../../ui";
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
      <span className="font-mono text-[13px] font-semibold text-fg">
        {name}
      </span>
      <span className="font-mono text-[11px] font-normal text-fg-subtle">
        {type}
      </span>
    </span>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          icon={<GlobeAltIcon />}
          title="Endpoint"
          description="Send a POST request with your API key in the x-api-key header."
        />
        <CardBody>
          <div className="flex items-center gap-2">
            <span className="ui-badge ui-badge-success shrink-0 font-mono">
              POST
            </span>
            <div className="min-w-0 flex-1">
              <Input
                size="large"
                type="text"
                readOnly
                className="font-mono text-[13px]"
                value={`${hostUrl}/bot/${data.public_url}/api`}
                // className="block w-full rounded-md border-line focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-gray-50"
              />
            </div>
            <div className="flex flex-row gap-2">
              <CopyBtn
                showText={false}
                iconSize="h-4 w-4"
                className="ui-btn-secondary h-10 w-10 rounded-xl px-0"
                value={`${hostUrl}/bot/${data.public_url}/api`}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader
            icon={<BeakerIcon />}
            title="Try it"
            description="Fill in the body and send a live request."
          />
          <CardBody className="space-y-6">
            <div>
              <h6 className="ui-label mb-2">API key</h6>
              <div className="flex flex-row items-center gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    size="large"
                    type="text"
                    readOnly
                    className="font-mono text-[13px]"
                    value={data.api_key || ""}
                  />
                </div>
                <CopyBtn
                  showText={false}
                  iconSize="h-4 w-4"
                  className="ui-btn-secondary h-10 w-10 rounded-xl px-0"
                  value={data.api_key || ""}
                />
                <Tooltip title="Regenerate API Key">
                  <button
                    aria-label="Regenerate API key"
                    onClick={() => !isGeneratingAPIKey && regenerateAPIKey()}
                    className="ui-btn-secondary h-10 w-10 rounded-xl px-0"
                  >
                    <ArrowPathIcon
                      className={`text-fg-muted ${
                        isGeneratingAPIKey ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div>
              <h6 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-fg-subtle">
                Body params
              </h6>

              <Form
                form={form}
                layout="vertical"
                onFinish={showResponse}
                initialValues={{
                  stream: true,
                  history: [],
                  message: "",
                }}
              >
                <Form.Item
                  label={fieldLabel("message", "string")}
                  rules={[
                    {
                      required: true,
                      message: "field 'message' is required by the API",
                    },
                  ]}
                  name="message"
                >
                  <Input
                    size="large"
                    type="text"
                    placeholder="Enter your message here"
                  />
                </Form.Item>

                <Form.List name="history">
                  {(fields, { add, remove }) => (
                    <div className="mb-6 rounded-xl border border-line bg-surface-2/60 p-3 sm:p-4">
                      <div className="mb-3">{fieldLabel("history", "array")}</div>
                      {fields.map((field, index) => (
                        <div
                          key={index}
                          className="mb-3 rounded-xl border border-line bg-surface p-3 shadow-soft"
                        >
                          <div className="mb-2 flex flex-row items-center justify-between">
                            <div>
                              <span className="font-mono text-xs font-medium text-fg-muted">
                                {"Object"}
                              </span>
                            </div>
                            <div>
                              <button
                                type="button"
                                aria-label="Remove history item"
                                onClick={() => remove(field.name)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <Form.Item
                            label={fieldLabel("role", "string")}
                            required={true}
                            key={field.key}
                            name={[field.name, "role"]}
                            help="The role of the messages author. One of ai or human."
                          >
                            <Select
                              placeholder="Select a type"
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
                            label={fieldLabel("text", "string")}
                            required={true}
                            key={field.key}
                            name={[field.name, "text"]}
                            help="The text of the message. text is required for all messages."
                          >
                            <Input
                              size="large"
                              placeholder="Enter your message here"
                            />
                          </Form.Item>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          add({
                            role: "",
                            text: "",
                          })
                        }
                        className="ui-btn-ghost h-8 px-2.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <PlusIcon />
                        Add history
                      </button>
                    </div>
                  )}
                </Form.List>

                <Form.Item
                  label={fieldLabel("stream", "boolean")}
                  name="stream"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <div className="-mx-5 -mb-5 flex flex-row justify-end rounded-b-2xl border-t border-line bg-surface-2/50 px-5 py-3 sm:-mx-6 sm:px-6">
                  <button type="submit" className="ui-btn-primary">
                    <PaperAirplaneIcon />
                    {isLoading ? "Loading..." : "Test API"}
                  </button>
                </div>
              </Form>
            </div>
          </CardBody>
        </Card>

        <Card className="min-w-0">
          <CardHeader
            icon={<CodeBracketIcon />}
            title="Code"
            description="Snippets update as you edit the request."
          />
          <CardBody className="space-y-5">
            <APICodeGenerator
              api={`${hostUrl}/bot/${data.public_url}/api`}
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

            {apiResponse && (
              <div className="border-t border-line pt-5">
                <ApiResponse
                  status={apiResponse.status}
                  data={JSON.stringify(apiResponse.data, null, 2)}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ApiPlaygroundComponent;
