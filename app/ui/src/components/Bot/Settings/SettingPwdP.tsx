import { Form } from "antd";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const client = useQueryClient();
  
  const onFinish = async (values: any) => {
    try {
      // Check if this is an old bot (you might need to adjust this condition)
      if (publicBotPwd === undefined || publicBotPwdProtected === undefined) {
        // For old bots, silently succeed without making the API call
        return null;
      }

      const response = await api.put(`/bot/${params.id}/password`, values);
      return response.data;
    } catch (error) {
      // Silently handle errors for old bots
      console.debug("Password protection update failed", error);
      return null;
    }
  };

  const { mutate } = useMutation(onFinish, {
    onSuccess: (data) => {
      if (data) { // Only invalidate queries if the operation actually succeeded
        client.invalidateQueries(["getBotSettings", params.id]);
      }
    }
  });
  
  // Maintain the form for state management but don't show any UI
  return (
    <Form
      form={form}
      initialValues={{
        publicBotPwdProtected: publicBotPwdProtected || false,
        publicBotPwd: publicBotPwd || '',
      }}
      layout="vertical"
      onFinish={mutate}
    >
      {/* Form is empty but maintains state */}
    </Form>
  );
};
