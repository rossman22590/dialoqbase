import { Form, Input, notification } from "antd";
import { Switch } from "@headlessui/react";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../services/api";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ClipboardIcon } from "@heroicons/react/24/outline";
// import Switch from antd as AntdSwitch
import { Switch as AntdSwitch } from "antd";
import { clipbardCopy } from "../../../utils/clipboard";

//@ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
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
        className="mt-5"
        onFinish={updateIntegration}
      >
        {data.fields.map((field, index) => {
          if (field.type === "webhook") {
            return (
              <Form.Item key={index} label={field.title} name={field.name}>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-grow focus-within:z-10">
                    <Input
                      size="large"
                      readOnly
                      value={`${hostUrl}/api/v1/bot/integration/${params.id}/whatsapp`}
                      type={field.inputType}
                      placeholder={field.help}
                    />
                  </div>
                  <div className="flex-shrink-0">
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
                      className="ui-btn-secondary h-10 w-10 px-0"
                    >
                      <ClipboardIcon />
                    </button>
                  </div>
                </div>
              </Form.Item>
            );
          } else if (field.inputType === "boolean") {
            return (
              <Form.Item
                key={index}
                label={field.title}
                name={field.name}
                valuePropName="checked"
              >
                <AntdSwitch />
              </Form.Item>
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

        <Form.Item className="mb-0">
          <button
            type="submit"
            disabled={isUpdating || isToggling}
            className="ui-btn-primary h-10 w-full"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </Form.Item>
      </Form>
      <div
        className={
          data?.connectBtn
            ? "mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/60 px-4 py-3"
            : "mt-5 rounded-xl border border-line bg-surface-2/60 px-4 py-3"
        }
      >
        <Switch.Group
          as="div"
          className="flex items-center justify-between gap-4"
        >
          <Switch.Label as="span" className="min-w-0">
            <span className="block text-sm font-medium text-fg">
              Enable integration
            </span>
            <span className="block text-xs text-fg-subtle">
              Pause or resume this channel without losing its settings.
            </span>
          </Switch.Label>
          <Switch
            disabled={
              data.status.toLowerCase() === "connect" ||
              isToggling ||
              isUpdating
            }
            checked={enabled}
            onChange={(e) => {
              setEnabled(e);
              toggleIntegration();
            }}
            className={classNames(
              enabled ? "bg-indigo-600" : "bg-surface-3 ring-1 ring-inset ring-line-strong",
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <span
              aria-hidden="true"
              className={classNames(
                enabled ? "translate-x-5" : "translate-x-0",
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              )}
            />
          </Switch>
        </Switch.Group>
        {data.connectBtn && (
          <Link to={data.connectBtn.link} target="_blank">
            <button type="button" className="ui-btn-secondary">
              {data.connectBtn.text}
            </button>
          </Link>
        )}
      </div>
    </>
  );
};
