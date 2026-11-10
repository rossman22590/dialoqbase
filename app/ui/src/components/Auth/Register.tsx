import { Form, notification } from "antd";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../hooks/useSettings";
import {
  AuthInput,
  AuthShell,
  AuthSpinner,
  authFormClass,
  authLinkClass,
} from "./Login";
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

// Rough client-side strength guide. Display only, not a validation rule.
const passwordStrength = (password?: string) => {
  if (!password) return null;
  const long = password.length >= 8;
  const digit = /\d/.test(password);
  const mixed = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const extra = /[^A-Za-z0-9]/.test(password) || password.length >= 12;
  const score = Math.max(1, [long, digit, mixed, extra].filter(Boolean).length);
  const label = ["Weak", "Weak", "Fair", "Good", "Strong"][score];
  let hint: string;
  if (score === 4) hint = "Strong password.";
  else if (!long) hint = `${label}. Use 8 or more characters.`;
  else if (!digit) hint = `${label}. Add a number.`;
  else hint = `${label}. 8+ characters with a number.`;
  const color =
    score <= 1 ? "bg-red-600" : score === 2 ? "bg-amber-500" : "bg-green-700";
  return { score, hint, color };
};

const StrengthMeter = ({ password }: { password?: string }) => {
  const strength = passwordStrength(password);
  if (!strength) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div aria-hidden="true" className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-1 rounded-full ${
              i <= strength.score ? strength.color : "bg-surface-3"
            }`}
          />
        ))}
      </div>
      <p aria-live="polite" className="text-xs text-fg-muted">
        {strength.hint}
      </p>
    </div>
  );
};

export const AuthRegister = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const password = Form.useWatch("password", form);
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
        <p className="text-sm text-fg-muted">
          Already have an account?{" "}
          <Link to="/login" className={authLinkClass}>
            Log in
          </Link>
        </p>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={registerMutation}
        requiredMark={false}
        className={authFormClass}
      >
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
          <AuthInput type="text" autoComplete="username" />
        </Form.Item>
        <Form.Item
          name="email"
          label={"Email"}
          extra="Used to reset your password."
          rules={[
            {
              required: true,
              message: "Please input your email",
            },
          ]}
        >
          <AuthInput type="email" autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label={"Password"}
          extra={<StrengthMeter password={password} />}
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <AuthInput type="password" autoComplete="new-password" />
        </Form.Item>
        <button
          type="submit"
          disabled={isLoading || !info?.isRegistrationAllowed}
          className="ui-btn-primary h-11 w-full"
        >
          {isLoading && <AuthSpinner />}
          {isLoading ? "Creating account..." : "Create account"}
        </button>
        <p className="mt-[18px] text-center text-xs text-fg-subtle">
          {info && !info.isRegistrationAllowed
            ? "Registration is turned off. Ask an admin for an account."
            : "New accounts start with free credits to try things out."}
        </p>
      </Form>
    </AuthShell>
  );
};
