import { Form, Input, notification } from "antd";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell, AuthSpinner } from "./Login";

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
      title="Reset password"
      description="Choose a new password for your account."
      footer={
        <p className="text-center text-sm text-fg-muted">
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Back to login
          </Link>
        </p>
      }
    >
      {!token ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-center text-sm leading-relaxed text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          This reset link is invalid or incomplete. Please request a new one.
        </div>
      ) : (
        <Form layout="vertical" onFinish={resetMutation} requiredMark={false}>
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
            hasFeedback
          >
            <Input.Password
              size="large"
              autoComplete="new-password"
              placeholder="New password"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={"Confirm password"}
            dependencies={["newPassword"]}
            hasFeedback
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
                  return Promise.reject(
                    new Error("The two passwords do not match!"),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              autoComplete="new-password"
              placeholder="Confirm password"
            />
          </Form.Item>
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="ui-btn-primary h-11 w-full text-[15px]"
            >
              {isLoading && <AuthSpinner />}
              {isLoading ? "Saving..." : "Reset password"}
            </button>
          </div>
        </Form>
      )}
    </AuthShell>
  );
};
