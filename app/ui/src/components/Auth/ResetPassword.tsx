import { Form, notification } from "antd";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AuthInput,
  AuthShell,
  AuthSpinner,
  authFormClass,
  authLinkClass,
} from "./Login";

interface ResetPasswordResponse {
  message: string;
}

export const AuthResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const onReset = async (values: { newPassword: string }) => {
    const response = await api.post("/user/reset-password", {
      token,
      newPassword: values.newPassword,
    });
    return response.data as ResetPasswordResponse;
  };

  const { mutateAsync: resetMutation, isLoading } = useMutation(onReset, {
    onSuccess: (data) => {
      notification.success({
        message: "Success",
        description: data.message,
        placement: "bottomRight",
      });
      navigate("/login");
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
      compact
      title="Reset password"
      description="Choose a new password for your account."
    >
      {!token ? (
        <>
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
          >
            This reset link is invalid or incomplete. Please request a new one.
          </div>
          <Link
            to="/forgot-password"
            className="ui-btn-primary h-11 w-full no-underline hover:text-white"
          >
            Request a new link
          </Link>
          <Link
            to="/login"
            className={`text-center text-[13px] ${authLinkClass}`}
          >
            Back to log in
          </Link>
        </>
      ) : (
        <Form
          layout="vertical"
          onFinish={resetMutation}
          requiredMark={false}
          className={authFormClass}
        >
          <Form.Item
            name="newPassword"
            label={"New password"}
            rules={[
              {
                required: true,
                message: "Please input your new password!",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters.",
              },
            ]}
          >
            <AuthInput type="password" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={"Confirm password"}
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Please confirm your new password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords don't match."));
                },
              }),
            ]}
          >
            <AuthInput type="password" autoComplete="new-password" />
          </Form.Item>
          <button
            type="submit"
            disabled={isLoading}
            className="ui-btn-primary h-11 w-full"
          >
            {isLoading && <AuthSpinner />}
            {isLoading ? "Saving..." : "Save password"}
          </button>
        </Form>
      )}
    </AuthShell>
  );
};
