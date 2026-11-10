import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../services/api";
import { Form, Input, Modal, notification } from "antd";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import React from "react";
import { CopyBtn } from "../../../Common/CopyBtn";

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
    <section className="ui-card flex flex-col gap-4 px-6 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-[1_1_260px]">
          <h2 className="m-0 text-base font-semibold text-fg">API keys</h2>
          <p className="mt-1 text-sm text-fg-muted">
            For calling your bots from your own code. API calls use your
            credits.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="ui-btn-secondary"
        >
          New key
        </button>
      </div>

      {isLoading && (
        <div className="skeleton h-10 rounded-lg" aria-hidden="true" />
      )}

      {!isLoading && (data || []).length === 0 && (
        <p className="rounded-lg border border-dashed border-line-strong px-4 py-5 text-center text-sm text-fg-muted">
          No API keys yet. Create one to call the Botcraft Pro API from your
          own apps.
        </p>
      )}

      {(data || []).length > 0 && (
        <ul role="list" className="flex flex-col gap-3">
          {(data || []).map((key) => (
            <li
              key={key.id}
              className="flex flex-wrap items-center gap-2 gap-y-1.5"
            >
              <div className="w-full text-[13px] sm:w-40 sm:flex-none">
                <div className="truncate font-medium text-fg">{key.name}</div>
                <div className="text-xs text-fg-subtle">
                  Created {new Date(key.createdAt).toLocaleDateString()}
                </div>
              </div>
              <code className="flex h-10 min-w-0 flex-[1_1_220px] items-center overflow-hidden whitespace-nowrap rounded-lg border border-line bg-app px-3 font-mono text-[13px] text-fg-muted">
                {key.api_key}
              </code>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  const confirm = window.confirm(
                    "Are you sure you want to delete this API Key?"
                  );

                  if (confirm) {
                    deleteApiKey(key.id);
                  }
                }}
                aria-label={`Delete API key ${key.name}`}
                className="ui-btn-danger-outline h-10"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="m-0 text-xs text-fg-subtle">
        A new key is shown once, so copy it when you create it. Deleting a key
        stops it straight away.
      </p>

      <Modal
        title="New API key"
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
            <Input size="large" type="text" placeholder="e.g. Course site" />
          </Form.Item>
          <div className="flex justify-end">
            <button type="submit" className="ui-btn-primary">
              {isCreating ? "Creating..." : "Create key"}
            </button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Your new API key"
        open={openApiKey}
        onCancel={() => setOpenApiKey(false)}
        footer={null}
      >
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            Your API Key has been generated successfully. Please copy the API
            Key and save it in a safe place. You will not be able to see this
            API Key again.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-app p-1.5 pl-3">
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
            className="shrink-0 rounded-lg border border-line bg-surface px-3 text-sm hover:bg-surface-2"
          />
        </div>
      </Modal>
    </section>
  );
};
