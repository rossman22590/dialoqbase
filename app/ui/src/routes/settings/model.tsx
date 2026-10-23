import { Table, Modal, notification, Tooltip, Radio } from "antd";
import React from "react";
import api from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SettingsLayout } from "../../Layout/SettingsLayout";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import { GetAllModelResponse } from "../../@types/settings";
import {
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { LLMForm } from "../../components/Settings/Model/LLMForm";
import { EMForm } from "../../components/Settings/Model/EMForm";
import { AiIcon } from "../../components/Icons/AiIcon";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
} from "../../components/ui";

const actionBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50";
const hideBtn = `${actionBtn} hover:bg-surface-2 hover:text-fg`;
const deleteBtn = `${actionBtn} hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400`;

export default function SettingsModelRoot() {
  const navigate = useNavigate();
  const [openAddModel, setOpenAddModel] = React.useState(false);
  const client = useQueryClient();

  const [openAddEmbeddingModel, setOpenAddEmbeddingModel] =
    React.useState(false);
  const [modelType, setModelType] = React.useState<"llm" | "embedding">("llm");

  const { data, status } = useQuery(["fetchAllModels"], async () => {
    const response = await api.get("/admin/models");
    return response.data as GetAllModelResponse;
  });

  React.useEffect(() => {
    if (status === "error") {
      navigate("/settings");
    }
  }, [status]);

  const hideModel = async (id: number) => {
    const response = await api.post(`/admin/models/hide`, {
      id,
    });
    return response.data;
  };

  const deleteModel = async (id: number) => {
    const response = await api.post(`/admin/models/delete`, {
      id,
    });
    return response.data;
  };

  const { mutate: hide, isLoading: isHide } = useMutation(hideModel, {
    onSuccess: () => {
      notification.success({
        message: "Model hidden successfully",
      });
      client.invalidateQueries(["fetchAllModels"]);
    },
    onError: (e: any) => {
      const message = e?.response?.data?.message || "Something went wrong";
      notification.error({
        message,
      });
    },
  });

  const { mutate: del, isLoading: isDelete } = useMutation(deleteModel, {
    onSuccess: () => {
      notification.success({
        message: "Model deleted successfully",
      });
      client.invalidateQueries(["fetchAllModels"]);
    },
    onError: (e: any) => {
      const message = e?.response?.data?.message || "Something went wrong";
      notification.error({
        message,
      });
    },
  });

  return (
    <SettingsLayout>
      <PageHeader
        eyebrow="Settings"
        title="Models"
        description="Chat and embedding models available to bots in this workspace."
      />
      {status === "loading" && <SkeletonLoading />}
      {status === "success" && (
        <>
          <Card className="animate-fade-up overflow-hidden">
            <CardHeader
              icon={<AiIcon />}
              title="All Models"
              description="Manage all the AI models in your organization."
              actions={
                <>
                  {modelType === "llm" && (
                    <button
                      type="button"
                      onClick={() => setOpenAddModel(true)}
                      className="ui-btn-primary"
                    >
                      <PlusIcon />
                      <span className="hidden sm:inline">
                        Add New Chat Model
                      </span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  )}
                  {modelType === "embedding" && (
                    <button
                      type="button"
                      onClick={() => setOpenAddEmbeddingModel(true)}
                      className="ui-btn-primary"
                    >
                      <PlusIcon />
                      <span className="hidden sm:inline">
                        Add New Embedding Model
                      </span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  )}
                </>
              }
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/40 px-5 py-3 sm:px-6">
              <Radio.Group
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
              >
                <Radio.Button value="llm">LLM</Radio.Button>
                <Radio.Button value="embedding">Embedding Model</Radio.Button>
              </Radio.Group>
              <span className="text-xs tabular-nums text-fg-subtle">
                {modelType === "llm"
                  ? `${data.data.length} chat models`
                  : `${data.embedding.length} embedding models`}
              </span>
            </div>

            <div className="overflow-x-auto">
              {modelType === "llm" && (
                <Table
                  // pagination={false}
                  dataSource={data.data}
                  locale={{
                    emptyText: (
                      <EmptyState
                        icon={<AiIcon />}
                        title="No chat models"
                        description="Add a chat model to make it available to your bots."
                        className="py-10"
                      />
                    ),
                  }}
                  columns={[
                    {
                      dataIndex: "name",
                      key: "name",
                      title: "Model Name",
                      render: (text) => (
                        <span className="font-medium text-fg">
                          {text || "Untitled Model"}
                        </span>
                      ),
                    },
                    {
                      dataIndex: "model_id",
                      title: "Model ID",
                      key: "model_id",
                      render: (text: string) => (
                        <span className="font-mono text-xs text-fg-muted">
                          {text
                            .replace("-dbase", "")
                            .replace(/_dialoqbase_[0-9]+$/, "")}
                        </span>
                      ),
                      className: "text-fg-muted",
                    },
                    {
                      dataIndex: "model_provider",
                      title: "Provider",
                      key: "model_provider",
                      render: (text) =>
                        text ? <Badge tone="neutral">{text}</Badge> : null,
                    },
                    {
                      dataIndex: "stream_available",
                      title: "Stream",
                      key: "stream_available",
                      render: (value) => (
                        <Badge tone={value ? "success" : "danger"}>
                          {value ? "Available" : "Unavailable"}
                        </Badge>
                      ),
                    },
                    {
                      title: "Action",
                      align: "right",
                      render: (record) =>
                        record.local_model ? (
                          <div className="flex flex-row justify-end gap-1">
                            <Tooltip title="Hide Model from Users">
                              <button
                                type="button"
                                disabled={isHide}
                                onClick={() => {
                                  hide(record.id);
                                }}
                                aria-label="Hide Model from Users"
                                className={hideBtn}
                              >
                                {record.hide ? (
                                  <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </button>
                            </Tooltip>
                            <Tooltip title="Delete Model">
                              <button
                                type="button"
                                disabled={isDelete}
                                onClick={() => {
                                  const confirm = window.confirm(
                                    "Are you sure you want to delete this model?"
                                  );

                                  if (confirm) {
                                    del(record.id);
                                  }
                                }}
                                aria-label="Delete Model"
                                className={deleteBtn}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        ) : (
                          <Tooltip title="Hide Model from Users">
                            <button
                              type="button"
                              disabled={isHide}
                              onClick={() => {
                                hide(record.id);
                              }}
                              aria-label="Hide Model from Users"
                              className={hideBtn}
                            >
                              {record.hide ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                          </Tooltip>
                        ),
                    },
                  ]}
                />
              )}
              {modelType === "embedding" && (
                <Table
                  // pagination={false}
                  dataSource={data.embedding}
                  locale={{
                    emptyText: (
                      <EmptyState
                        icon={<AiIcon />}
                        title="No embedding models"
                        description="Add an embedding model to use it for new data sources."
                        className="py-10"
                      />
                    ),
                  }}
                  columns={[
                    {
                      dataIndex: "name",
                      key: "name",
                      title: "Model Name",
                      render: (text) => (
                        <span className="font-medium text-fg">
                          {text || "Untitled Model"}
                        </span>
                      ),
                    },
                    {
                      dataIndex: "model_id",
                      title: "Model ID",
                      key: "model_id",
                      className: "text-fg-muted",
                      render: (text) => (
                        <span className="font-mono text-xs text-fg-muted">
                          {text
                            .replace("dialoqbase_eb_", "")
                            .replace(/_dialoqbase_[0-9]+$/, "")}
                        </span>
                      ),
                    },
                    {
                      dataIndex: "model_provider",
                      title: "Provider",
                      key: "model_provider",
                      render: (text) =>
                        text ? <Badge tone="neutral">{text}</Badge> : null,
                    },
                    {
                      title: "Action",
                      align: "right",
                      render: (record) =>
                        record.local_model ? (
                          <div className="flex flex-row justify-end gap-1">
                            <Tooltip title="Hide Model from Users">
                              <button
                                type="button"
                                disabled={isHide}
                                onClick={() => {
                                  hide(record.id);
                                }}
                                aria-label="Hide Model from Users"
                                className={hideBtn}
                              >
                                {record.hide ? (
                                  <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </button>
                            </Tooltip>
                            <Tooltip title="Delete Model">
                              <button
                                type="button"
                                disabled={isDelete}
                                onClick={() => {
                                  const confirm = window.confirm(
                                    "Are you sure you want to delete this model?"
                                  );

                                  if (confirm) {
                                    del(record.id);
                                  }
                                }}
                                aria-label="Delete Model"
                                className={deleteBtn}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        ) : (
                          <Tooltip title="Hide Model from Users">
                            <button
                              type="button"
                              disabled={isHide}
                              onClick={() => {
                                hide(record.id);
                              }}
                              aria-label="Hide Model from Users"
                              className={hideBtn}
                            >
                              {record.hide ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                          </Tooltip>
                        ),
                    },
                  ]}
                />
              )}
            </div>
          </Card>

          <Modal
            open={openAddModel}
            footer={null}
            title="Add New Model"
            onCancel={() => {
              setOpenAddModel(false);
            }}
          >
            <LLMForm setOpenAddModel={setOpenAddModel} />
          </Modal>

          <Modal
            open={openAddEmbeddingModel}
            footer={null}
            title="Add New Embedding Model"
            onCancel={() => {
              setOpenAddEmbeddingModel(false);
            }}
          >
            <EMForm setOpenAddEmbeddingModel={setOpenAddEmbeddingModel} />
          </Modal>
        </>
      )}
    </SettingsLayout>
  );
}
