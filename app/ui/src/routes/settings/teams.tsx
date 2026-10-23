import { Form, Input, Modal, Table, Tooltip, notification, Select, InputNumber } from "antd";
import React from "react";
import api from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SettingsLayout } from "../../Layout/SettingsLayout";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import {
  KeyIcon,
  TrashIcon,
  CurrencyDollarIcon,
  UsersIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
} from "../../components/ui";

const iconBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

export default function SettingsTeamsRoot() {
  const [newUser] = Form.useForm();
  const [resetPassword] = Form.useForm();
  const [creditForm] = Form.useForm();
  const navigate = useNavigate();

  const [resetPasswordModal, setResetPasswordModal] = React.useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = React.useState(0);

  const [newUserModal, setNewUserModal] = React.useState(false);
  const [deleteUserModal, setDeleteUserModal] = React.useState(false);
  const [deleteUserId, setDeleteUserId] = React.useState(0);

  const [creditModal, setCreditModal] = React.useState(false);
  const [creditUserId, setCreditUserId] = React.useState(0);

  const queryClient = useQueryClient();

  const { data, status } = useQuery(["fetchAllUsers"], async () => {
    const response = await api.get("/admin/users");
    return response.data as {
      user_id: number;
      username: string;
      email: string;
      bots: number;
      is_admin: boolean;
    }[];
  });

  React.useEffect(() => {
    if (status === "error") {
      navigate("/settings");
    }
  }, [status]);

  const onResetPassword = async (values: any) => {
    const response = await api.post("/admin/reset-user-password", {
      ...values,
      user_id: resetPasswordUserId,
    });
    return response.data;
  };

  const {
    mutateAsync: resetPasswordMutation,
    isLoading: resetPasswordLoading,
  } = useMutation(onResetPassword, {
    onSuccess: (data) => {
      setResetPasswordModal(false);
      resetPassword.resetFields();
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
  });

  const onCreateUser = async (values: any) => {
    const response = await api.post("/admin/register-user", values);
    return response.data;
  };

  const onDeleteUser = async (value: { user_id: number }) => {
    const response = await api.delete(`/admin/user/delete`, {
      data: {
        user_id: value.user_id,
      },
    });
    return response.data;
  };

  const { mutateAsync: createUser, isLoading: createUserLoading } = useMutation(
    onCreateUser,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["fetchAllUsers"]);
        setNewUserModal(false);
        newUser.resetFields();
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

  const { mutateAsync: deleteUser, isLoading: deleteUserLoading } = useMutation(
    {
      mutationFn: onDeleteUser,
      onSuccess: (data) => {
        queryClient.invalidateQueries(["fetchAllUsers"]);
        setDeleteUserModal(false);
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
      },
    }
  );

  const onUpdateCredits = async (values: any) => {
    const response = await api.post("/admin/user-credits", {
      ...values,
      user_id: creditUserId,
    });
    return response.data;
  };

  const { mutateAsync: updateCreditsMutation, isLoading: updateCreditsLoading } = useMutation(
    onUpdateCredits,
    {
      onSuccess: (data) => {
        setCreditModal(false);
        creditForm.resetFields();
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

  return (
    <SettingsLayout>
      <PageHeader
        eyebrow="Settings"
        title="Teams"
        description="Invite people, manage roles, credits and access."
      />
      {status === "success" && (
        <>
          <Card className="animate-fade-up overflow-hidden">
            <CardHeader
              icon={<UsersIcon />}
              title="All Users"
              description="Manage all users in your Dialoqbase Application"
              actions={
                <button
                  type="button"
                  onClick={() => setNewUserModal(true)}
                  className="ui-btn-primary"
                >
                  <UserPlusIcon />
                  <span className="hidden sm:inline">Add New User</span>
                  <span className="sm:hidden">Add</span>
                </button>
              }
            />

            <div className="overflow-x-auto">
              <Table
                columns={[
                  {
                    title: "Username",
                    dataIndex: "username",
                    key: "username",
                    render: (value) => (
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold uppercase text-indigo-700 ring-1 ring-inset ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20">
                          {String(value ?? "").charAt(0)}
                        </span>
                        <span className="font-medium text-fg">{value}</span>
                      </div>
                    ),
                  },
                  {
                    title: "Email",
                    dataIndex: "email",
                    render: (value) => (
                      <span className="text-fg-muted">{value}</span>
                    ),
                  },
                  {
                    title: "Total Bots",
                    dataIndex: "bots",
                    render: (value) => (
                      <span className="tabular-nums text-fg">{value}</span>
                    ),
                  },
                  {
                    title: "Role",
                    dataIndex: "is_admin",
                    render: (value) => (
                      <Badge tone={value ? "brand" : "neutral"}>
                        {value ? "Admin" : "User"}
                      </Badge>
                    ),
                  },
                  {
                    title: "Actions",
                    align: "right",
                    render: (_, user) => (
                      <div className="flex justify-end gap-1">
                        <Tooltip title="Reset Password">
                          <button
                            type="button"
                            onClick={() => {
                              setResetPasswordUserId(user.user_id);
                              setResetPasswordModal(true);
                            }}
                            aria-label="Reset Password"
                            className={`${iconBtn} hover:bg-surface-2 hover:text-fg`}
                          >
                            <KeyIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip title="Manage Credits">
                          <button
                            type="button"
                            onClick={() => {
                              setCreditUserId(user.user_id);
                              setCreditModal(true);
                            }}
                            aria-label="Manage Credits"
                            className={`${iconBtn} hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400`}
                          >
                            <CurrencyDollarIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        {!user.is_admin && (
                          <Tooltip title="Delete User">
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteUserId(user.user_id);
                                setDeleteUserModal(true);
                              }}
                              aria-label="Delete User"
                              className={`${iconBtn} hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400`}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    ),
                  },
                ]}
                dataSource={data}
                locale={{
                  emptyText: (
                    <EmptyState
                      icon={<UsersIcon />}
                      title="No users yet"
                      description="Add a user to give them access to this workspace."
                      className="py-10"
                    />
                  ),
                }}
              />
            </div>
          </Card>

          <Modal
            title="Reset Password"
            open={resetPasswordModal}
            onCancel={() => setResetPasswordModal(false)}
            footer={null}
          >
            <Form
              form={resetPassword}
              layout="vertical"
              onFinish={(values) => resetPasswordMutation(values)}
            >
              <Form.Item
                label="New Password"
                name="new_password"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                ]}
              >
                <Input.Password size="large" type="password" />
              </Form.Item>

              <div className="flex justify-end">
                <button
                  disabled={resetPasswordLoading}
                  type="submit"
                  className="ui-btn-primary"
                >
                  {resetPasswordLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </Form>
          </Modal>

          <Modal
            title="Add New User"
            open={newUserModal}
            onCancel={() => setNewUserModal(false)}
            footer={null}
          >
            <Form
              form={newUser}
              layout="vertical"
              onFinish={(values) => createUser(values)}
            >
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
                <Input size="large" />
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
                <Input size="large" type="email" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <div className="flex justify-end">
                <button
                  disabled={createUserLoading}
                  type="submit"
                  className="ui-btn-primary"
                >
                  {createUserLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </Form>
          </Modal>

          <Modal
            title="Delete User"
            open={deleteUserModal}
            onCancel={() => setDeleteUserModal(false)}
            footer={null}
          >
            <p className="text-sm leading-relaxed text-fg-muted">
              Are you sure you want to delete this user?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteUserModal(false)}
                className="ui-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser({ user_id: deleteUserId })}
                disabled={deleteUserLoading}
                className="ui-btn-danger"
              >
                {deleteUserLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Modal>

          <Modal
            title="Manage User Credits"
            open={creditModal}
            onCancel={() => setCreditModal(false)}
            footer={null}
          >
            <Form
              form={creditForm}
              layout="vertical"
              onFinish={(values) => updateCreditsMutation(values)}
              initialValues={{ type: "add", amount: 10 }}
            >
              <Form.Item
                label="Action"
                name="type"
                rules={[{ required: true, message: "Please select an action!" }]}
              >
                <Select>
                  <Select.Option value="add">Add Credits</Select.Option>
                  <Select.Option value="remove">Remove Credits</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Amount ($)"
                name="amount"
                rules={[{ required: true, message: "Please input the amount!" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0.0001} step={0.0001} precision={4} />
              </Form.Item>

              <div className="flex justify-end">
                <button
                  disabled={updateCreditsLoading}
                  type="submit"
                  className="ui-btn-primary"
                >
                  {updateCreditsLoading ? "Updating..." : "Update Credits"}
                </button>
              </div>
            </Form>
          </Modal>
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
