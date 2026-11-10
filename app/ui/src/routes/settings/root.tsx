import { Form, Input, notification } from "antd";
import React from "react";
import api from "../../services/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

import { SettingsLayout } from "../../Layout/SettingsLayout";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import { UserApiKey } from "../../components/Settings/Profile/ApiKey";

const CardTitle = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div>
    <h2 className="m-0 text-base font-semibold text-fg">{title}</h2>
    <p className="mt-1 text-sm text-fg-muted">{description}</p>
  </div>
);

const CardFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end rounded-b-xl border-t border-line bg-app px-6 py-3">
    {children}
  </div>
);

export default function SettingsRoot() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { data, status } = useQuery(["fetchMe"], async () => {
    const response = await api.get("/user/me");
    return response.data as {
      username: string;
      email: string;
    };
  });

  React.useEffect(() => {
    if (status === "error") {
      navigate("/login");
    }
  }, [status]);

  const onUpdateProfile = async (values: any) => {
    const response = await api.post("/user/me", values);
    return response.data;
  };

  const { mutateAsync: updateProfile, isLoading } = useMutation(
    onUpdateProfile,
    {
      onSuccess: (data) => {
        notification.success({
          message: "Success",
          description: data.message,
        });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;
          notification.error({
            message: "Error",
            description: message,
          });
          return;
        }

        notification.error({
          message: "Error",
          description: "Something went wrong",
        });
      },
    }
  );

  const onUpdatePassword = async (values: any) => {
    // confirmPassword is only checked here; the API takes the new password.
    const { confirmPassword: _confirm, ...payload } = values || {};
    const response = await api.post("/user/update-password", payload);
    return response.data;
  };

  const { mutateAsync: updatePassowrd, isLoading: isPasswordLoading } =
    useMutation(onUpdatePassword, {
      onSuccess: () => {
        notification.success({
          message: "Success",
          description: "Password updated",
        });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message;
          notification.error({
            message: "Error",
            description: message,
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
    <SettingsLayout>
      {status === "success" && (
        <>
          <Form
            form={form}
            initialValues={{
              ...data,
            }}
            layout="vertical"
            requiredMark={false}
            onFinish={updateProfile}
            className="ui-card"
          >
            <div className="flex flex-col gap-4 px-6 py-5">
              <CardTitle
                title="Profile"
                description="How you log in and where we send password resets."
              />
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Form.Item
                  label="Username"
                  name="username"
                  className="!mb-4"
                  rules={[
                    {
                      required: true,
                      message: "Please input your username!",
                    },
                  ]}
                >
                  <Input size="large" type="text" autoComplete="username" />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  className="!mb-4"
                  rules={[
                    {
                      required: true,
                      message: "Please input your email!",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    type="email"
                    autoComplete="email"
                    className="w-full"
                  />
                </Form.Item>
              </div>
            </div>
            <CardFooter>
              <button
                disabled={isLoading}
                type="submit"
                className="ui-btn-primary"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </CardFooter>
          </Form>

          <Form
            layout="vertical"
            requiredMark={false}
            onFinish={updatePassowrd}
            className="ui-card"
          >
            <div className="flex flex-col gap-4 px-6 py-5">
              <CardTitle
                title="Password"
                description="Forgot your current one? Set a new one here, or use the reset email from the login page."
              />
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Form.Item
                  label="New password"
                  name="newPassword"
                  className="!mb-4"
                  rules={[
                    {
                      required: true,
                      message: "Please input your new password!",
                    },
                  ]}
                >
                  <Input.Password size="large" autoComplete="new-password" />
                </Form.Item>
                <Form.Item
                  label="Confirm password"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  className="!mb-4"
                  rules={[
                    { required: true, message: "Please confirm your new password!" },
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
                  <Input.Password size="large" autoComplete="new-password" />
                </Form.Item>
              </div>
            </div>
            <CardFooter>
              <button
                disabled={isPasswordLoading}
                type="submit"
                className="ui-btn-secondary"
              >
                {isPasswordLoading ? "Saving..." : "Update password"}
              </button>
            </CardFooter>
          </Form>

          <UserApiKey />
        </>
      )}
      {status === "loading" && <SkeletonLoading />}

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          Something went wrong
        </div>
      )}
    </SettingsLayout>
  );
}
