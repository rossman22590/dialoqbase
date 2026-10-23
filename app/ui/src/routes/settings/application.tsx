import { Form, InputNumber, Switch, notification, Select, Input } from "antd";
import React from "react";
import api from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SettingsLayout } from "../../Layout/SettingsLayout";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import { ApplicationCard } from "../../components/Settings/Application/ApplicationCard";
import { useCreateConfig } from "../../hooks/useCreateConfig";
import {
  AdjustmentsHorizontalIcon,
  CpuChipIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { CardBody, CardFooter, PageHeader } from "../../components/ui";

export default function SettingsApplicationRoot() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { data: models, status: modeStatus } = useCreateConfig();
  const queryClient = useQueryClient();

  const { data, status } = useQuery(["fetchApplicationSettings"], async () => {
    const response = await api.get("/admin/dialoqbase-settings");
    return response.data as {
      noOfBotsPerUser: number;
      allowUserToCreateBots: boolean;
      allowUserToRegister: boolean;
      defaultChunkSize: number;
      defaultChunkOverlap: number;
      defaultChatModel: string;
      defaultEmbeddingModel: string;
      hideDefaultModels: boolean;
      dynamicallyFetchOllamaModels: boolean;
      ollamaURL: string;
      fileUploadSizeLimit: number;
      refetchDatasource: boolean;
      internalSearchEnabled: boolean;
    };
  });

  React.useEffect(() => {
    if (status === "error") {
      navigate("/settings");
    }
  }, [status]);

  const onUpdateApplicatoon = async (values: any) => {
    const response = await api.post("/admin/dialoqbase-settings", values);
    return response.data;
  };

  const onRagApplicationUpdate = async (values: any) => {
    const response = await api.post("/admin/rag-settings", values);
    return response.data;
  };

  const { mutateAsync: updateApplicationSettings, isLoading } = useMutation(
    onUpdateApplicatoon,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["fetchBotCreateConfig"]);
        notification.success({
          message: "Success",
          description: data.message,
        });
      },
      onError: (error: any) => {
        notification.error({
          message: "Error",
          description: error?.response?.data?.message || "Something went wrong",
        });
      },
    }
  );

  const { mutateAsync: updateModelSettings, isLoading: isModelLoading } =
    useMutation(onUpdateApplicatoon, {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["fetchBotCreateConfig"]);
        notification.success({
          message: "Success",
          description: data.message,
        });
      },
      onError: (error: any) => {
        notification.error({
          message: "Error",
          description: error?.response?.data?.message || "Something went wrong",
        });
      },
    });
  const { mutateAsync: updateRagSettings, isLoading: isRagLoading } =
    useMutation(onRagApplicationUpdate, {
      onSuccess: (data) => {
        notification.success({
          message: "Success",
          description: data.message,
        });
      },
      onError: (error: any) => {
        notification.error({
          message: "Error",
          description: error?.response?.data?.message || "Something went wrong",
        });
      },
    });

  return (
    <SettingsLayout>
      <PageHeader
        eyebrow="Settings"
        title="Application"
        description="Instance-wide defaults for users, models and retrieval."
      />
      {status === "success" && (
        <div className="space-y-6">
          <ApplicationCard
            title="Application Settings"
            description="Configure your application settings"
            icon={<AdjustmentsHorizontalIcon />}
            className="animate-fade-up"
          >
            <Form
              form={form}
              initialValues={{
                ...data,
              }}
              layout="vertical"
              onFinish={updateApplicationSettings}
            >
              <div>
                <CardBody className="pb-1">
                  <Form.Item
                    label="No of bots per user"
                    name="noOfBotsPerUser"
                    rules={[
                      {
                        required: true,
                        message: "Please input no of bots per user!",
                      },
                    ]}
                  >
                    <InputNumber size="large" style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    label="Allow user to create bots"
                    name="allowUserToCreateBots"
                    rules={[
                      {
                        required: true,
                        message: "Please input allow user to create bots!",
                      },
                    ]}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="Allow user to register"
                    name="allowUserToRegister"
                    rules={[
                      {
                        required: true,
                        message: "Please input allow user to register!",
                      },
                    ]}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="Enhanced Website loader"
                    name="usePuppeteerFetch"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="Number of files per upload"
                    name="fileUploadSizeLimit"
                    rules={[
                      {
                        required: true,
                        message: "Please input the number of files per upload!",
                      },
                    ]}
                    tooltip="Default is 10"
                  >
                    <InputNumber size="large" style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    label="Refetch Data Source"
                    name="refetchDatasource"
                    valuePropName="checked"
                    help="This will refetch the data source at a specific interval."
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    name="internalSearchEnabled"
                    label="Enable internal search"
                    valuePropName="checked"
                    help="This is experimental and may not work as expected."
                  >
                    <Switch />
                  </Form.Item>
                </CardBody>
                <CardFooter>
                  <button
                    disabled={isLoading}
                    type="submit"
                    className="ui-btn-primary"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </CardFooter>
              </div>
            </Form>
          </ApplicationCard>

          <ApplicationCard
            title="Models Settings"
            description="Configure your models settings"
            icon={<CpuChipIcon />}
            className="animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            <Form
              initialValues={{
                ...data,
              }}
              layout="vertical"
              onFinish={updateModelSettings}
            >
              <div>
                <CardBody className="pb-1">
                  <Form.Item
                    label="Default Chat Model"
                    name="defaultChatModel"
                    rules={[
                      {
                        required: true,
                        message: "Please select default chat model!",
                      },
                    ]}
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
                      options={models?.chatModel || []}
                      loading={modeStatus === "loading"}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Default Embedding Model"
                    name="defaultEmbeddingModel"
                    rules={[
                      {
                        required: true,
                        message: "Please select default embedding model!",
                      },
                    ]}
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
                      placeholder="Select a Embedding Model"
                      options={models?.embeddingModel || []}
                      loading={modeStatus === "loading"}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Ollama URL"
                    name="ollamaURL"
                    rules={[
                      {
                        required: true,
                        message: "Please input ollama url!",
                      },
                    ]}
                  >
                    <Input size="large" placeholder="Enter ollama url" />
                  </Form.Item>

                  <Form.Item
                    label="Hide Default Models"
                    name="hideDefaultModels"
                    valuePropName="checked"
                    help="This will hide all the default models and only show the models that are locally added or from ollama."
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="Dynamically Fetch Ollama Models"
                    name="dynamicallyFetchOllamaModels"
                    valuePropName="checked"
                    help="This will dynamically fetch the models from ollama. You don't need to manually add the models."
                  >
                    <Switch />
                  </Form.Item>
                </CardBody>
                <CardFooter>
                  <button
                    disabled={isModelLoading}
                    type="submit"
                    className="ui-btn-primary"
                  >
                    {isModelLoading ? "Saving..." : "Save"}
                  </button>
                </CardFooter>
              </div>
            </Form>
          </ApplicationCard>

          <ApplicationCard
            title="RAG Settings"
            description="Configure your RAG settings"
            icon={<Square3Stack3DIcon />}
            className="animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            <div>
              <Form
                initialValues={{
                  defaultChunkSize: data.defaultChunkSize,
                  defaultChunkOverlap: data.defaultChunkOverlap,
                }}
                layout="vertical"
                onFinish={updateRagSettings}
              >
                <CardBody className="pb-1">
                  <Form.Item
                    label="Default Chunk Size"
                    name="defaultChunkSize"
                    rules={[
                      {
                        required: true,
                        message: "Please input default chunk size!",
                      },
                    ]}
                  >
                    <InputNumber size="large" style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    label="Default Chunk Overlap"
                    name="defaultChunkOverlap"
                    rules={[
                      {
                        required: true,
                        message: "Please input default chunk overlap!",
                      },
                    ]}
                  >
                    <InputNumber size="large" style={{ width: "100%" }} />
                  </Form.Item>
                </CardBody>
                <CardFooter>
                  <button
                    disabled={isRagLoading}
                    type="submit"
                    className="ui-btn-primary"
                  >
                    {isRagLoading ? "Saving..." : "Save"}
                  </button>
                </CardFooter>
              </Form>
            </div>
          </ApplicationCard>
        </div>
      )}
      {status === "loading" && <SkeletonLoading />}

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          Something went wrong
        </div>
      )}
    </SettingsLayout>
  );
}
