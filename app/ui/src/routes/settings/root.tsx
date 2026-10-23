import { Form, Input, notification } from "antd";
import React from "react";
import api from "../../services/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { KeyIcon, UserCircleIcon } from "@heroicons/react/24/outline";

import { SettingsLayout } from "../../Layout/SettingsLayout";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import { UserApiKey } from "../../components/Settings/Profile/ApiKey";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  PageHeader,
} from "../../components/ui";

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
    const response = await api.post("/user/update-password", values);
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
      <PageHeader
        eyebrow="Settings"
        title="General"
        description="Manage your profile, password and personal API keys."
      />
      {status === "success" && (
        <div className="space-y-6">
          <Card className="animate-fade-up">
            <CardHeader
              icon={<UserCircleIcon />}
              title="Profile"
              description="Update your profile details."
            />
            <Form
              form={form}
              initialValues={{
                ...data,
              }}
              layout="vertical"
              onFinish={updateProfile}
            >
              <CardBody className="pb-1">
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Please input your username!",
                    },
                  ]}
                >
                  <Input size="large" type="text" />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please input your email!",
                    },
                  ]}
                >
                  <Input size="large" type="email" className="w-full" />
                </Form.Item>
              </CardBody>
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
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <CardHeader
              icon={<KeyIcon />}
              title="Password"
              description="Update your password."
            />
            <Form layout="vertical" onFinish={updatePassowrd}>
              <CardBody className="pb-1">
                <Form.Item
                  label="Current Password"
                  name="oldPassword"
                  rules={[
                    {
                      required: true,
                      message: "Please input your current password!",
                    },
                  ]}
                >
                  <Input.Password size="large" type="password" />
                </Form.Item>
                <Form.Item
                  label="New Password"
                  name="newPassword"
                  rules={[
                    {
                      required: true,
                      message: "Please input your new password!",
                    },
                  ]}
                >
                  <Input.Password size="large" />
                </Form.Item>
              </CardBody>
              <CardFooter>
                <button
                  disabled={isPasswordLoading}
                  type="submit"
                  className="ui-btn-primary"
                >
                  {isPasswordLoading ? "Saving..." : "Save"}
                </button>
              </CardFooter>
            </Form>
          </Card>

          <UserApiKey />
        </div>
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
