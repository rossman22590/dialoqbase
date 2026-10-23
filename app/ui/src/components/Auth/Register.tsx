import { Form, Input, notification } from "antd";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../hooks/useSettings";
import { AuthShell, AuthSpinner } from "./Login";
interface User {
  user_id: number;
  username: string;
  email: string;
}

interface RegisterResponse {
  message: string;
  token: string;
  user: User;
  to: string;
}

export const AuthRegister = () => {
  const navigate = useNavigate();
  const onRegister = async (values: any) => {
    const response = await api.post("/user/register", values);
    return response.data as RegisterResponse;
  };

  const { login } = useAuth();

  const { data: info } = useSettings();

  const { mutateAsync: registerMutation, isLoading } = useMutation(onRegister, {
    onSuccess: (data) => {
      notification.success({
        message: "Success",
        description: data.message,
        placement: "bottomRight",
      });
      login(data.token, data.user);
      navigate(data.to);
    },
    onError: (error) => {
      // is axios
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        notification.error({
          message: "Error",
          description: message,
          placement: "bottomRight",
        });
        return;
      }

      notification.error({
        message: "Error",
        description: "Something went wrong",
      });
    },
  });
  return (
    <AuthShell
      title="Create an account"
      description="Set up your workspace and start building bots in minutes."
      footer={
        <p className="text-center text-sm text-fg-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Login
          </Link>
        </p>
      }
    >
      <Form
        layout="vertical"
        onFinish={registerMutation}
        requiredMark={false}
      >
        {" "}
        <Form.Item
          name="username"
          label={"Username"}
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input
            size="large"
            autoComplete="username"
            placeholder="Username"
          />
        </Form.Item>
        <Form.Item
          name="email"
          label={"Email"}
          rules={[
            {
              required: true,
              message: "Please input your email",
            },
          ]}
        >
          <Input
            size="large"
            type="email"
            autoComplete="email"
            placeholder="Email"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={"Password"}
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password
            size="large"
            autoComplete="current-password"
            placeholder="Password"
          />
        </Form.Item>
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading || !info?.isRegistrationAllowed}
            className="ui-btn-primary h-11 w-full text-[15px]"
          >
            {isLoading && <AuthSpinner />}
            {isLoading ? "Loading..." : "Register"}
          </button>
        </div>
      </Form>
    </AuthShell>
  );
};
