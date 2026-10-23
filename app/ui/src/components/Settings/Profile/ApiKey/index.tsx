import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../services/api";
import { Form, Input, Modal, Table, Tooltip, notification } from "antd";
import {
  CodeBracketIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import React from "react";
import { CopyBtn } from "../../../Common/CopyBtn";
import { Card, CardHeader, EmptyState } from "../../../ui";

export const UserApiKey = () => {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [openApiKey, setOpenApiKey] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["fetchUserApiKey"],
    queryFn: async () => {
      const res = await api.get("/user/api-key");
      const data = res.data["data"] as {
        id: number;
        api_key: string;
        name: string;
        createdAt: string;
      }[];
      return data;
    },
  });

  const onDeleteApiKey = async (id: number) => {
    await api.delete(`/user/api-key/${id}`);
  };

  const { mutate: deleteApiKey, isLoading: isDeleting } = useMutation(
    onDeleteApiKey,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["fetchUserApiKey"],
        });
        notification.success({
          message: "Success",
          description: "API Key deleted",
        });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;
          notification.error({
            message: "Error",
            description: message,
          });
          return;
        }

        notification.error({
          message: "Error",
          description: "Something went wrong",
        });
      },
    }
  );

  const onCreateApiKey = async (values: any) => {
    const response = await api.post("/user/api-key", values);

    return response.data as {
      data: {
        api_key: string;
      };
    };
  };

  const { mutate: createApiKey, isLoading: isCreating } = useMutation(
    onCreateApiKey,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ["fetchUserApiKey"],
        });
        setApiKey(data.data.api_key);
        setOpenApiKey(true);
        setOpenModal(false);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;
          notification.error({
            message: "Error",
            description: message,
          });
          return;
        }

        notification.error({
          message: "Error",
          description: "Something went wrong",
        });
      },
    }
  );

  return (
    <Card
      className="animate-fade-up overflow-hidden"
      style={{ animationDelay: "120ms" }}
    >
      <CardHeader
        icon={<CodeBracketIcon />}
        title="API Key"
        description="Manage your Botcraft Pro API key"
        actions={
          <button onClick={() => setOpenModal(true)} className="ui-btn-primary">
            <PlusIcon />
            <span className="hidden sm:inline">Generate New API Key</span>
            <span className="sm:hidden">New key</span>
          </button>
        }
      />
      <div className="overflow-x-auto">
        <Table
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render: (text) => (
                <span className="font-medium text-fg">{text}</span>
              ),
            },
            {
              title: "API Key",
              dataIndex: "api_key",
              key: "api_key",
              render: (text) => (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-surface-2 px-2 py-1 font-mono text-xs text-fg-muted">
                  <KeyIcon className="h-3.5 w-3.5 text-fg-subtle" />
                  {text}
                </span>
              ),
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (text) => (
                <span className="whitespace-nowrap text-sm tabular-nums text-fg-muted">
                  {new Date(text).toLocaleString()}
                </span>
              ),
            },
            {
              title: "Action",
              key: "action",
              align: "right",
              render: (_, record) => (
                <Tooltip title="Delete API Key">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      const confirm = window.confirm(
                        "Are you sure you want to delete this API Key?"
                      );

                      if (confirm) {
                        deleteApiKey(record.id);
                      }
                    }}
                    aria-label="Delete API Key"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </Tooltip>
              ),
            },
          ]}
          loading={isLoading}
          dataSource={data || []}
          locale={{
            emptyText: (
              <EmptyState
                icon={<KeyIcon />}
                title="No API keys yet"
                description="Generate a key to call the Botcraft Pro API from your own apps."
                className="py-10"
              />
            ),
          }}
        />
      </div>

      <Modal
        title="Generate New API Key"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            createApiKey(values);
          }}
          className="mt-4"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input your name!",
              },
            ]}
          >
            <Input size="large" type="text" placeholder="Name" />
          </Form.Item>
          <div className="flex justify-end">
            <button type="submit" className="ui-btn-primary">
              {isCreating ? "Generating..." : "Generate"}
            </button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="API Key Generated Successfully"
        open={openApiKey}
        onCancel={() => setOpenApiKey(false)}
        footer={null}
      >
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            Your API Key has been generated successfully. Please copy the API
            Key and save it in a safe place. You will not be able to see this
            API Key again.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-surface-2 p-1.5 pl-3">
          <Input
            size="large"
            type="text"
            value={apiKey}
            readOnly
            variant="borderless"
            className="w-full min-w-0 px-0 font-mono text-sm"
          />

          <CopyBtn
            value={apiKey}
            iconSize="h-4 w-4"
            className="shrink-0 rounded-lg border border-line bg-surface px-3 text-sm shadow-soft hover:bg-surface-3"
          />
        </div>
      </Modal>
    </Card>
  );
};
