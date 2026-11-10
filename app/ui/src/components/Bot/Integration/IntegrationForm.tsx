import { Form, Input, notification } from "antd";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { SwitchControl } from "../Settings/SettingsControls";
import { clipbardCopy } from "../../../utils/clipboard";

type Props = {
  onClose: () => void;
  data: {
    name: string;
    channel: string;
    logo: string;
    description: string;
    link: string;
    fields: {
      name: string;
      type: string;
      title: string;
      description: string;
      inputType: string;
      help: string;
      requiredMessage: string;
      value: string;
    }[];
    isPaused: boolean;
    status: string;
    color: string;
    textColor: string;
    connectBtn?: {
      text: string;
      link: string;
    } | null;
  };
};

export const IntegrationForm: React.FC<Props> = ({ onClose, data }) => {
  const [enabled, setEnabled] = React.useState(!data.isPaused);
  const params = useParams<{ id: string }>();

  const onSubmit = async (value: any) => {
    const response = await api.post(`/bot/integration/${params.id}`, {
      provider: data.channel,
      value,
    });
    return response.data;
  };

  const client = useQueryClient();

  const { mutate: updateIntegration, isLoading: isUpdating } = useMutation(
    onSubmit,
    {
      onSuccess: () => {
        client.invalidateQueries(["getBotEIntegration", params.id]);
        notification.success({
          message: "Success",
          description: "Integration updated successfully",
        });
        onClose();
      },
      onError: (e: any) => {
        if (axios.isAxiosError(e)) {
          const message =
            e.response?.data?.message ||
            e?.response?.data?.error ||
            e.message ||
            "Something went wrong";
          notification.error({
            message: "Error",
            description: message,
          });
          return;
        }

        notification.error({
          message: "Error",
          description: e.message || "Something went wrong",
        });
      },
    }
  );

  const [hostUrl] = React.useState<string>(
    () =>
      import.meta.env.VITE_HOST_URL ||
      window.location.protocol + "//" + window.location.host
  );
  const { mutate: toggleIntegration, isLoading: isToggling } = useMutation(
    async () => {
      const response = await api.post(`/bot/integration/${params.id}/toggle`, {
        provider: data.channel,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        client.invalidateQueries(["getBotEIntegration", params.id]);
        notification.success({
          message: "Success",
          description: "Integration toggled successfully",
        });
        onClose();
      },
      onError: (e: any) => {
        if (axios.isAxiosError(e)) {
          const message =
            e.response?.data?.message ||
            e?.response?.data?.error ||
            e.message ||
            "Something went wrong";
          notification.error({
            message: "Error",
            description: message,
          });
          return;
        }

        notification.error({
          message: "Error",
          description: e.message || "Something went wrong",
        });
      },
    }
  );

  return (
    <>
      <Form
        initialValues={{
          ...data.fields.reduce((acc, field) => {
            //@ts-ignore
            acc[field.name] = field.value;
            return acc;
          }, {}),
        }}
        layout="vertical"
        requiredMark={false}
        className="flex flex-col gap-4 [&_.ant-form-item]:mb-0"
        onFinish={updateIntegration}
      >
        {data.fields.map((field, index) => {
          if (field.type === "webhook") {
            return (
              <Form.Item
                key={index}
                label={field.title}
                name={field.name}
              >
                <div className="flex gap-2">
                  <div className="min-w-0 flex-grow">
                    <Input
                      size="large"
                      readOnly
                      value={`${hostUrl}/api/v1/bot/integration/${params.id}/whatsapp`}
                      type={field.inputType}
                      placeholder={field.help}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Copy webhook URL"
                    onClick={async () => {
                      await clipbardCopy(
                        `${hostUrl}/api/v1/bot/integration/${params.id}/whatsapp`
                      );
                      notification.success({
                        message: "Copied!",
                        placement: "bottomRight",
                      });
                    }}
                    className="ui-btn-secondary h-10 shrink-0 px-3.5 text-[13px] font-normal"
                  >
                    <ClipboardIcon />
                    Copy
                  </button>
                </div>
              </Form.Item>
            );
          } else if (field.inputType === "boolean") {
            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl border border-line px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm font-medium text-fg">
                    {field.title}
                  </p>
                  {field.description && field.description !== field.title && (
                    <p className="m-0 mt-0.5 text-[13px] text-fg-muted">
                      {field.description}
                    </p>
                  )}
                </div>
                <Form.Item name={field.name} valuePropName="checked" noStyle>
                  <SwitchControl label={field.title} />
                </Form.Item>
              </div>
            );
          }

          return (
            <Form.Item
              key={index}
              label={field.title}
              name={field.name}
              rules={[{ required: true, message: field.requiredMessage }]}
            >
              <Input
                size="large"
                type={field.inputType}
                placeholder={field.help}
              />
            </Form.Item>
          );
        })}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {data.connectBtn && (
            <Link to={data.connectBtn.link} target="_blank">
              <button type="button" className="ui-btn-secondary">
                {data.connectBtn.text}
              </button>
            </Link>
          )}
          <button
            type="submit"
            disabled={isUpdating || isToggling}
            className="ui-btn-primary"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </div>
      </Form>
      <div className="mt-4 flex items-center gap-4 border-t border-line pt-4">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-medium text-fg">Running</p>
          <p className="m-0 mt-0.5 text-[13px] text-fg-muted">
            Pause or resume this channel without losing its settings.
          </p>
        </div>
        <SwitchControl
          label="Enable integration"
          disabled={
            data.status.toLowerCase() === "connect" || isToggling || isUpdating
          }
          checked={enabled}
          onChange={(e) => {
            setEnabled(e);
            toggleIntegration();
          }}
        />
      </div>
    </>
  );
};
