import React from "react";
import { Form, notification } from "antd";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../hooks/useSettings";
interface User {
  user_id: number;
  username: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
  to: string;
}
export const AuthLogin = () => {
  const navigate = useNavigate();
  const onLogin = async (values: any) => {
    const response = await api.post("/user/login", values);
    return response.data as LoginResponse;
  };

  const { login } = useAuth();

  const { data: info } = useSettings();

  const { mutateAsync: loginMutation, isLoading } = useMutation(onLogin, {
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
      title="Welcome back"
      description="Log in to your account to continue."
      footer={
        info?.isRegistrationAllowed ? (
          <p className="text-sm text-fg-muted">
            New here?{" "}
            <Link to="/register" className={authLinkClass}>
              Create an account
            </Link>
          </p>
        ) : (
          <p className="text-sm text-fg-subtle">
            Registration is turned off. Ask an admin for an account.
          </p>
        )
      }
    >
      <Form
        layout="vertical"
        onFinish={loginMutation}
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
          name="password"
          label={
            <span className="flex w-full items-baseline justify-between gap-3">
              Password
              <Link
                to="/forgot-password"
                className={`text-[13px] font-normal ${authLinkClass}`}
              >
                Forgot password?
              </Link>
            </span>
          }
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <AuthInput type="password" autoComplete="current-password" />
        </Form.Item>
        <button
          type="submit"
          disabled={isLoading}
          className="ui-btn-primary h-11 w-full"
        >
          {isLoading && <AuthSpinner />}
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </Form>
    </AuthShell>
  );
};


export const AuthSpinner = () => (
  <span
    aria-hidden="true"
    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
  />
);

// Text link colour used across the auth screens.
export const authLinkClass =
  "font-medium text-indigo-700 no-underline hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200";

// Makes antd's vertical Form match the mock: 13px labels, 6px label gap,
// 18px between fields, small error and help text.
export const authFormClass = [
  "[&_.ant-form-item]:!mb-[18px]",
  "[&_.ant-form-item-label]:!pb-1.5",
  "[&_.ant-form-item-label>label]:!h-auto",
  "[&_.ant-form-item-label>label]:!w-full",
  "[&_.ant-form-item-label>label]:!text-[13px]",
  "[&_.ant-form-item-label>label]:!font-medium",
  "[&_.ant-form-item-label>label]:!text-fg",
  "[&_.ant-form-item-explain]:!mt-1.5",
  "[&_.ant-form-item-explain]:!text-xs",
  "[&_.ant-form-item-extra]:!mt-1.5",
  "[&_.ant-form-item-extra]:!min-h-0",
  "[&_.ant-form-item-extra]:!text-xs",
  "[&_.ant-form-item-extra]:!text-fg-subtle",
].join(" ");

// Plain input styled like the mock. Form.Item injects value/onChange.
export const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", value, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    value={value ?? ""}
    className={`ui-input aria-[invalid=true]:border-red-600 aria-[invalid=true]:focus:ring-red-500/10 [.ant-form-item-has-error_&]:border-red-600 ${className}`}
  />
));
AuthInput.displayName = "AuthInput";

// Shared centred layout for the auth screens: brand, one card, footer line.
// Renders outside any app layout, so it owns its own background and height.
export const AuthShell = ({
  title,
  description,
  children,
  footer,
  compact = false,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  compact?: boolean;
}) => (
  <div className="flex min-h-screen w-full flex-1 flex-col items-center justify-center gap-6 bg-app px-4 py-12 text-fg">
    <div className="flex items-center gap-2 text-base font-semibold">
      <img
        className="h-7 w-7 rounded-[7px] object-contain"
        src="/logo.png"
        alt=""
      />
      Botcraft Pro
    </div>

    <div
      className={`flex w-full flex-col gap-[18px] rounded-xl border border-line bg-surface ${
        compact ? "max-w-[360px] p-7" : "max-w-[400px] p-6 sm:p-8"
      }`}
    >
      {title && (
        <div>
          <h1
            className={`font-semibold tracking-[-0.01em] text-fg ${
              compact ? "text-xl" : "text-[22px]"
            }`}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-fg-muted">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>

    {footer && <div className="text-center">{footer}</div>}
  </div>
);
