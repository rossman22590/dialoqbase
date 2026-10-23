import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  notification,
} from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { errorMessage, formatAgo, formatCredits, formatDate, formatNumber } from "./shared";

type AdminUser = {
  user_id: number;
  username: string;
  email: string | null;
  is_admin: boolean;
  is_suspended: boolean;
  createdAt: string;
  bots: number;
  balance: number;
  messages_30d: number;
  credits_used_30d: number;
  credits_used_total: number;
  last_active: string | null;
};

export const AdminUsers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [creditUser, setCreditUser] = React.useState<AdminUser | null>(null);
  const [creditForm] = Form.useForm();

  const { data, isFetching } = useQuery(
    ["adminUsers", search, status, page, pageSize],
    async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
      });
      const response = await api.get(`/admin/oversight/users?${params}`);
      return response.data as { total: number; data: AdminUser[] };
    },
    { keepPreviousData: true }
  );

  const refresh = () => {
    queryClient.invalidateQueries(["adminUsers"]);
    queryClient.invalidateQueries(["adminOverview"]);
  };

  const action = useMutation(
    async ({ url, body, method = "post" }: { url: string; body: any; method?: "post" | "delete" }) => {
      const response =
        method === "delete"
          ? await api.delete(url, { data: body })
          : await api.post(url, body);
      return response.data;
    },
    {
      onSuccess: (data) => {
        notification.success({ message: data?.message || "Done" });
        refresh();
      },
      onError: (e) => notification.error({ message: errorMessage(e) }),
    }
  );

  const confirm = (title: string, run: () => void, danger = false) =>
    Modal.confirm({ title, okButtonProps: { danger }, onOk: run });

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_: any, u: AdminUser) => (
        <div>
          <div className="font-medium">{u.username}</div>
          <div className="text-xs text-gray-500">{u.email || "no email"}</div>
          <div className="mt-1 flex gap-1">
            {u.is_admin && <Tag color="purple">Admin</Tag>}
            {u.is_suspended && <Tag color="red">Suspended</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (v: number) => (
        <span className={v < 0 ? "text-red-600" : ""}>{formatCredits(v)}</span>
      ),
    },
    { title: "Bots", dataIndex: "bots", key: "bots" },
    {
      title: "Messages (30d)",
      dataIndex: "messages_30d",
      key: "messages_30d",
      render: formatNumber,
    },
    {
      title: "Credits used (30d / all)",
      key: "credits",
      render: (_: any, u: AdminUser) =>
        `${formatCredits(u.credits_used_30d)} / ${formatCredits(u.credits_used_total)}`,
    },
    {
      title: "Last active",
      dataIndex: "last_active",
      key: "last_active",
      render: (v: string | null) => <span title={formatDate(v)}>{formatAgo(v)}</span>,
    },
    { title: "Joined", dataIndex: "createdAt", key: "createdAt", render: formatDate },
    {
      title: "",
      key: "actions",
      render: (_: any, u: AdminUser) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "credits", label: "Adjust credits" },
              { key: "bots", label: "View bots" },
              { key: "transactions", label: "View transactions" },
              { type: "divider" },
              {
                key: "suspend",
                label: u.is_suspended ? "Reactivate" : "Suspend",
                danger: !u.is_suspended,
              },
              { key: "admin", label: u.is_admin ? "Remove admin" : "Make admin" },
              { type: "divider" },
              { key: "delete", label: "Delete user", danger: true, disabled: u.is_admin },
            ],
            onClick: ({ key }) => {
              if (key === "credits") {
                creditForm.resetFields();
                setCreditUser(u);
              } else if (key === "bots") {
                navigate(`/admin/bots?user_id=${u.user_id}&user=${encodeURIComponent(u.username)}`);
              } else if (key === "transactions") {
                navigate(`/admin/transactions?user_id=${u.user_id}&user=${encodeURIComponent(u.username)}`);
              } else if (key === "suspend") {
                confirm(
                  u.is_suspended
                    ? `Reactivate ${u.username}?`
                    : `Suspend ${u.username}? They will be signed out of the API and their bots will stop answering.`,
                  () =>
                    action.mutate({
                      url: "/admin/oversight/users/suspend",
                      body: { user_id: u.user_id, suspended: !u.is_suspended },
                    }),
                  !u.is_suspended
                );
              } else if (key === "admin") {
                confirm(
                  u.is_admin
                    ? `Remove admin access from ${u.username}?`
                    : `Give ${u.username} full admin access?`,
                  () =>
                    action.mutate({
                      url: "/admin/oversight/users/admin",
                      body: { user_id: u.user_id, is_admin: !u.is_admin },
                    })
                );
              } else if (key === "delete") {
                confirm(
                  `Delete ${u.username} and all of their bots? This cannot be undone.`,
                  () =>
                    action.mutate({
                      url: "/admin/user/delete",
                      body: { user_id: u.user_id },
                      method: "delete",
                    }),
                  true
                );
              }
            },
          }}
        >
          <Button size="small">Manage</Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input.Search
          allowClear
          placeholder="Search username or email"
          onSearch={(v) => {
            setPage(1);
            setSearch(v.trim());
          }}
          style={{ maxWidth: 320 }}
        />
        <Select
          allowClear
          placeholder="All users"
          value={status}
          onChange={(v) => {
            setPage(1);
            setStatus(v);
          }}
          style={{ width: 160 }}
          options={[
            { label: "Admins", value: "admin" },
            { label: "Suspended", value: "suspended" },
          ]}
        />
      </div>

      <Table
        rowKey="user_id"
        size="small"
        loading={isFetching}
        dataSource={data?.data || []}
        columns={columns as any}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
        }}
      />

      <Modal
        title={`Adjust credits for ${creditUser?.username}`}
        open={Boolean(creditUser)}
        onCancel={() => setCreditUser(null)}
        onOk={() => creditForm.submit()}
        confirmLoading={action.isLoading}
      >
        <p className="mb-4 text-sm text-gray-500">
          Current balance: {formatCredits(creditUser?.balance)}. The change is logged as an
          admin adjustment.
        </p>
        <Form
          form={creditForm}
          layout="vertical"
          initialValues={{ type: "add" }}
          onFinish={(values) =>
            action.mutate(
              {
                url: "/admin/user-credits",
                body: { ...values, user_id: creditUser!.user_id },
              },
              { onSuccess: () => setCreditUser(null) }
            )
          }
        >
          <Form.Item name="type" label="Action">
            <Select
              options={[
                { label: "Add credits", value: "add" },
                { label: "Remove credits", value: "remove" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Enter an amount" }]}
          >
            <InputNumber min={0.01} step={1} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
