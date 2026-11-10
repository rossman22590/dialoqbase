import { Form, Input, notification } from "antd";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { SwitchControl } from "./SettingsControls";

type Props = {
  publicBotPwdProtected: boolean;
  publicBotPwd: string;
};

export const SettingsPwdP: React.FC<Props> = ({
  publicBotPwd,
  publicBotPwdProtected,
}) => {
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const isEnabled = Form.useWatch("publicBotPwdProtected", form);
  const client = useQueryClient();
  const onFinish = async (values: any) => {
    const response = await api.put(`/bot/${params.id}/password`, values);
    return response.data;
  };

  const { mutate, isLoading } = useMutation(onFinish, {
    onSuccess: () => {
      client.invalidateQueries(["getBotSettings", params.id]);

      notification.success({
        message: "Bot settings updated successfully",
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
  return (
    <Form
      form={form}
      initialValues={{
        publicBotPwdProtected,
        publicBotPwd,
      }}
      layout="vertical"
      requiredMark={false}
      onFinish={mutate}
    >
      <section className="ui-card">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="m-0 flex items-center gap-2 text-sm font-medium text-fg">
              Password protection
              <span className="ui-badge ui-badge-brand">Preview</span>
            </h2>
            <p className="m-0 mt-0.5 text-[13px] text-fg-muted">
              Ask for a password before anyone can use the public bot. Web
              chat only for now.
            </p>
          </div>
          <Form.Item
            name="publicBotPwdProtected"
            valuePropName="checked"
            noStyle
          >
            <SwitchControl label="Password protection" />
          </Form.Item>
        </div>
        <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:flex-row sm:items-start">
          <Form.Item
            name="publicBotPwd"
            label="Password"
            className="mb-0 min-w-0 flex-1"
            rules={[
              {
                required: isEnabled,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password
              placeholder="Password"
              disabled={!isEnabled}
              size="large"
            />
          </Form.Item>
          <button
            type="submit"
            disabled={isLoading}
            className="ui-btn-secondary h-10 shrink-0 self-start sm:mt-[30px]"
          >
            {isLoading ? "Saving..." : "Save password"}
          </button>
        </div>
      </section>
    </Form>
  );
};
