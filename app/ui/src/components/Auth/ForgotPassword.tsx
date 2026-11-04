import React from "react";
import { Form, Input, notification } from "antd";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthShell, AuthSpinner } from "./Login";

interface ForgotPasswordResponse {
  message: string;
}

export const AuthForgotPassword = () => {
  const [submitted, setSubmitted] = React.useState(false);

  const onForgot = async (values: { email: string }) => {
    const response = await api.post("/user/forgot-password", values);
    return response.data as ForgotPasswordResponse;
  };

  const { mutateAsync: forgotMutation, isLoading } = useMutation(onForgot, {
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error) => {
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
      title="Forgot password"
      description="Enter your email and we'll send you a link to reset your password."
      footer={
        <p className="text-center text-sm text-fg-muted">
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Back to login
          </Link>
        </p>
      }
    >
      {submitted ? (
        <div className="rounded-xl border border-line bg-surface-2/60 px-4 py-5 text-center text-sm leading-relaxed text-fg-muted">
          If an account exists for that email, a password reset link is on its
          way. Check your inbox (and spam folder).
        </div>
      ) : (
        <Form layout="vertical" onFinish={forgotMutation} requiredMark={false}>
          <Form.Item
            name="email"
            label={"Email"}
            rules={[
              {
                required: true,
                message: "Please input your email!",
              },
              {
                type: "email",
                message: "Please enter a valid email!",
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
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="ui-btn-primary h-11 w-full text-[15px]"
            >
              {isLoading && <AuthSpinner />}
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </div>
        </Form>
      )}
    </AuthShell>
  );
};
