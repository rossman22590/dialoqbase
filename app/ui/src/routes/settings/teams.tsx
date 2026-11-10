import { Dropdown, Form, Input, InputNumber, Modal, notification } from "antd";
import React from "react";
import api from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SettingsLayout } from "../../Layout/SettingsLayout";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import {
  EllipsisHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { CreditTypeToggle } from "../../components/Admin/Users";
import { formatCredits } from "../../components/Admin/shared";

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
  const creditPanelRef = React.useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const { data, status } = useQuery(["fetchAllUsers"], async () => {
    const response = await api.get("/admin/users");
    return response.data as {
      user_id: number;
      username: string;
      email: string;
      bots: number;
      is_admin: boolean;
      balance?: number;
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
        queryClient.invalidateQueries(["fetchAllUsers"]);
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

  const creditUser = data?.find((u) => u.user_id === creditUserId);

  React.useEffect(() => {
    if (creditModal) {
      creditPanelRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [creditModal, creditUserId]);

  return (
    <SettingsLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-lg font-semibold text-fg">Team</h2>
          <p className="mt-1 text-sm text-fg-muted">
            People with an account here, and their credits.
          </p>
        </div>
        {status === "success" && (
          <button
            type="button"
            onClick={() => setNewUserModal(true)}
            className="ui-btn-primary"
          >
            Add person
          </button>
        )}
      </div>
      {status === "success" && (
        <>
          <div className="flex flex-wrap items-start gap-5">
            <section className="ui-card min-w-0 flex-[999_1_440px] overflow-x-auto">
              <table className="ui-table min-w-[600px]">
                <thead>
                  <tr>
                    <th scope="col">Person</th>
                    <th scope="col">Role</th>
                    <th scope="col" className="!text-right">
                      Credits
                    </th>
                    <th scope="col" className="!text-right">
                      Bots
                    </th>
                    <th scope="col" className="!text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(data || []).length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="!py-10 text-center text-sm text-fg-subtle"
                      >
                        No one here yet. Add a person to give them access.
                      </td>
                    </tr>
                  )}
                  {(data || []).map((user) => {
                    const selected =
                      creditModal && creditUserId === user.user_id;
                    return (
                      <tr
                        key={user.user_id}
                        className={
                          selected
                            ? "bg-indigo-50/60 dark:bg-indigo-500/10"
                            : undefined
                        }
                      >
                        <td>
                          <div className="font-medium text-fg">
                            {user.username}
                          </div>
                          <div className="text-fg-subtle">{user.email}</div>
                        </td>
                        <td className="text-fg-muted">
                          {user.is_admin ? "Admin" : "Member"}
                        </td>
                        <td
                          className={`text-right tabular-nums ${
                            (user.balance ?? 0) <= 0
                              ? "font-semibold text-red-700 dark:text-red-400"
                              : "text-fg"
                          }`}
                        >
                          {formatCredits(user.balance)}
                        </td>
                        <td className="text-right tabular-nums">
                          {user.bots}
                        </td>
                        <td className="text-right">
                          <Dropdown
                            trigger={["click"]}
                            placement="bottomRight"
                            menu={{
                              items: [
                                { key: "password", label: "Reset password" },
                                { key: "credits", label: "Manage credits" },
                                ...(!user.is_admin
                                  ? [
                                      { type: "divider" as const },
                                      {
                                        key: "delete",
                                        label: "Delete user",
                                        danger: true,
                                      },
                                    ]
                                  : []),
                              ],
                              onClick: ({ key }) => {
                                if (key === "password") {
                                  setResetPasswordUserId(user.user_id);
                                  setResetPasswordModal(true);
                                } else if (key === "credits") {
                                  setCreditUserId(user.user_id);
                                  setCreditModal(true);
                                } else if (key === "delete") {
                                  setDeleteUserId(user.user_id);
                                  setDeleteUserModal(true);
                                }
                              },
                            }}
                          >
                            <button
                              type="button"
                              aria-label={`Actions for ${user.username}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                              <EllipsisHorizontalIcon className="h-4 w-4" />
                            </button>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {creditModal && (
              <div
                ref={creditPanelRef}
                className="ui-card w-full px-5 py-[18px] sm:max-w-[320px] sm:flex-[1_1_260px]"
              >
                <Form
                  form={creditForm}
                  layout="vertical"
                  requiredMark={false}
                  onFinish={(values) => updateCreditsMutation(values)}
                  initialValues={{ type: "add", amount: 10 }}
                  aria-labelledby="adj-h"
                >
                  <div className="mb-3.5 flex items-start justify-between gap-2">
                    <h3
                      id="adj-h"
                      className="m-0 text-[15px] font-semibold text-fg"
                    >
                      Manage credits
                      {creditUser ? `: ${creditUser.username}` : ""}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCreditModal(false)}
                      aria-label="Close"
                      className="-mr-1.5 -mt-1 inline-flex h-7 w-7 items-center justify-center rounded-lg text-fg-subtle hover:bg-surface-2 hover:text-fg"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mb-3.5 text-[13px] text-fg-muted">
                    {creditUser && (
                      <>
                        Balance {formatCredits(creditUser.balance)}.{" "}
                        {(creditUser.balance ?? 0) <= 0 && creditUser.bots > 0
                          ? "Their bots that use credits have stopped answering. "
                          : ""}
                      </>
                    )}
                    Changes their balance in dollars. Bots stop answering when
                    it reaches $0.
                  </p>
                  <Form.Item
                    label="Action"
                    name="type"
                    className="!mb-3.5"
                    rules={[
                      { required: true, message: "Please select an action!" },
                    ]}
                  >
                    <CreditTypeToggle />
                  </Form.Item>

                  <Form.Item
                    label="Amount ($)"
                    name="amount"
                    className="!mb-4"
                    rules={[
                      { required: true, message: "Please input the amount!" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0.0001}
                      step={0.0001}
                      precision={4}
                      prefix="$"
                    />
                  </Form.Item>

                  <Form.Item noStyle shouldUpdate>
                    {() => (
                      <button
                        disabled={updateCreditsLoading}
                        type="submit"
                        className="ui-btn-primary h-10 w-full"
                      >
                        {updateCreditsLoading
                          ? "Updating..."
                          : creditForm.getFieldValue("type") === "remove"
                          ? "Remove credits"
                          : "Add credits"}
                      </button>
                    )}
                  </Form.Item>
                </Form>
              </div>
            )}
          </div>

          <Modal
            title="Reset password"
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
            title="Add person"
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
            title="Delete user"
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
