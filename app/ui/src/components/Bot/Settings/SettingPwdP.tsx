import { Form, Switch, Input, notification } from "antd";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type Props = {
  publicBotPwdProtected: boolean;
  publicBotPwd: string;
};

export const SettingsPwdP: React.FC<Props> = ({
  publicBotPwd,
  publicBotPwdProtected,
}) => {
  // Early return for older bots
  if (!publicBotPwd && !publicBotPwdProtected) {
    return null;
  }

  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const isEnabled = Form.useWatch("publicBotPwdProtected", form);
  const client = useQueryClient();

  const onFinish = async (values: any) => {
    try {
      // Add validation check before making the API call
      if (!params.id || !values) {
        throw new Error("Invalid parameters");
      }

      const response = await api.put(`/bot/${params.id}/password`, values);
      
      // Validate response
      if (!response || !response.data) {
        throw new Error("Invalid response");
      }

      return response.data;
    } catch (error) {
      // Handle older bot authentication errors silently
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.debug("Bot password protection not supported for this bot");
        return null;
      }
      throw error; // Re-throw other errors to be handled by mutation
    }
  };

  const { mutate } = useMutation(onFinish, {
    onSuccess: (data) => {
      // Only update queries and show notification if operation was successful
      if (data) {
        client.invalidateQueries(["getBotSettings", params.id]);
        notification.success({
          message: "Bot settings updated successfully",
        });
      }
    },
    onError: (error: any) => {
      // Only show error notifications for new bots
      if (publicBotPwd || publicBotPwdProtected) {
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
      }
    },
  });

  // Only render form for supported bots
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
      <div className="hidden">
        <Form.Item
          name="publicBotPwdProtected"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="publicBotPwd"
          rules={[
            {
              required: isEnabled,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password
            disabled={!isEnabled}
          />
        </Form.Item>
      </div>
    </Form>
  );
};
