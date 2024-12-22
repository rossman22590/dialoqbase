import { Form } from "antd";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Keep the props type to maintain compatibility
type Props = {
  publicBotPwd: string;
  publicBotPwdProtected: boolean;
};

export const SettingsPwdP: React.FC<Props> = ({
  publicBotPwd,
  publicBotPwdProtected,
}) => {
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const client = useQueryClient();
  
  const onFinish = async (values: any) => {
    const response = await api.put(`/bot/${params.id}/password`, values);
    return response.data;
  };

  const { mutate } = useMutation(onFinish, {
    onSuccess: () => {
      client.invalidateQueries(["getBotSettings", params.id]);
    }
  });

  return (
    <Form
      form={form}
      initialValues={{
        publicBotPwd,
        publicBotPwdProtected,
      }}
      layout="vertical"
      onFinish={mutate}
    >
      <div className="px-4 py-5 bg-white border sm:rounded-lg sm:p-6 dark:bg-[#1e1e1e] dark:border-gray-700">
      </div>
    </Form>
  );
};
