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
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const isEnabled = Form.useWatch("publicBotPwdProtected", form);
  const client = useQueryClient();
  const onFinish = async (values: any) => {
    const response = await api.put(`/bot/${params.id}/password`, values);
    return response.data;
  };

  const { mutate } = useMutation(onFinish, {  // Removed isLoading from destructuring
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
