import React from "react";
import { Form, notification } from "antd";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  AuthInput,
  AuthShell,
  AuthSpinner,
  authFormClass,
  authLinkClass,
} from "./Login";

interface ForgotPasswordResponse {
  message: string;
}

export const AuthForgotPassword = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [sentTo, setSentTo] = React.useState("");
  const [resent, setResent] = React.useState(false);

  const onForgot = async (values: { email: string }) => {
    const response = await api.post("/user/forgot-password", values);
    return response.data as ForgotPasswordResponse;
  };

  const { mutateAsync: forgotMutation, isLoading } = useMutation(onForgot, {
    onSuccess: (_data, variables) => {
      if (submitted) setResent(true);
      setSentTo(variables.email);
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

  const backLink = (
    <Link to="/login" className={`text-center text-[13px] ${authLinkClass}`}>
      Back to log in
    </Link>
  );

  if (submitted) {
    return (
      <AuthShell compact>
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </span>
        <div role="status">
          <h1 className="text-xl font-semibold text-fg">Check your email</h1>
          <p className="mt-1.5 text-sm text-fg-muted">
            If an account uses{" "}
            <span className="font-medium text-fg">{sentTo}</span>, a reset link
            is on its way. It works for 1 hour.
          </p>
        </div>
        <p className="text-[13px] text-fg-muted">
          {resent ? (
            "Sent again. Check spam if it still hasn't arrived."
          ) : (
            <>
              Nothing arrived? Check spam, or{" "}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => forgotMutation({ email: sentTo })}
                className={`p-0 disabled:opacity-60 ${authLinkClass}`}
              >
                {isLoading ? "sending..." : "send it again"}
              </button>
              .
            </>
          )}
        </p>
        {backLink}
      </AuthShell>
    );
  }

  return (
    <AuthShell
      compact
      title="Forgot password"
      description="Enter your email and we'll send you a link to reset your password."
    >
      <Form
        layout="vertical"
        onFinish={forgotMutation}
        requiredMark={false}
        className={authFormClass}
      >
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
          <AuthInput type="email" autoComplete="email" />
        </Form.Item>
        <button
          type="submit"
          disabled={isLoading}
          className="ui-btn-primary h-11 w-full"
        >
          {isLoading && <AuthSpinner />}
          {isLoading ? "Sending..." : "Send reset link"}
        </button>
      </Form>
      {backLink}
    </AuthShell>
  );
};
