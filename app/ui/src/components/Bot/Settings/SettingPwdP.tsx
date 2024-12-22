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
        publicBotPwdProtected,
        publicBotPwd,
      }}
      layout="vertical"
      onFinish={mutate}
    >
    </Form>
  );
};
