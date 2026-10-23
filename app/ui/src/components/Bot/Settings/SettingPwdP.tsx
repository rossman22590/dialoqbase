import { Form, Switch, Input, notification } from "antd";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { Card, CardBody, CardFooter, CardHeader } from "../../ui";

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
      onFinish={mutate}
    >
      <Card>
        <CardHeader
          icon={<LockClosedIcon />}
          title="Password Protection"
          description="Protect your bot's public access with a password."
        />
        <CardBody>
          <div className="rounded-xl border border-line bg-surface-2/40 px-4 pt-3 [&_.ant-form-item]:mb-3">
            <Form.Item
              name="publicBotPwdProtected"
              valuePropName="checked"
              label="Enable Password Protection"
            >
              <Switch />
            </Form.Item>
          </div>

          <Form.Item
            name="publicBotPwd"
            label="Password"
            className="mt-6"
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

          <div className="flex items-start gap-2 rounded-xl bg-surface-2/60 px-3 py-2.5 text-xs leading-relaxed text-fg-muted">
            <span className="ui-badge ui-badge-brand shrink-0">Preview</span>
            <span>
              This feature is in preview and only works with web interface for
              now
            </span>
          </div>
        </CardBody>
        <CardFooter>
          <button type="submit" className="ui-btn-primary">
            {isLoading ? "Saving..." : "Save"}
          </button>
        </CardFooter>
      </Card>
    </Form>
  );
};
