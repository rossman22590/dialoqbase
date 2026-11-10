import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dropdown, Form, InputNumber, Modal, notification } from "antd";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FilterChip,
  Pager,
  SearchBox,
  TableCard,
  TableMessage,
  Toolbar,
  errorMessage,
  formatAgo,
  formatCredits,
  formatDate,
  formatNumber,
  smallBtn,
  smallDangerBtn,
} from "./shared";
import { Badge } from "../ui";

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

type UserCounts = {
  all: number;
  zero_balance: number;
  suspended: number;
  admin: number;
};

// "zero" is sent as zero_balance=true; the others as status=<value>.
const STATUS_FILTERS: {
  value: string | undefined;
  label: string;
  count: keyof UserCounts;
}[] = [
  { value: undefined, label: "All", count: "all" },
  { value: "zero", label: "At $0 credits", count: "zero_balance" },
  { value: "suspended", label: "Suspended", count: "suspended" },
  { value: "admin", label: "Admins", count: "admin" },
];

const UserStatus = ({ u }: { u: AdminUser }) => {
  if (u.is_suspended) return <Badge tone="neutral">Suspended</Badge>;
  if (u.balance <= 0) return <Badge tone="warning">Bots paused</Badge>;
  return <Badge tone="success">Active</Badge>;
};

export const AdminUsers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>();
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(25);
  const [creditUser, setCreditUser] = React.useState<AdminUser | null>(null);
  const [creditForm] = Form.useForm();

  const { data, isFetching, status: queryStatus } = useQuery(
    ["adminUsers", search, status, page, pageSize],
    async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(status === "zero"
          ? { zero_balance: "true" }
          : status
          ? { status }
          : {}),
      });
      const response = await api.get(`/admin/oversight/users?${params}`);
      return response.data as {
        total: number;
        counts?: UserCounts;
        data: AdminUser[];
      };
    },
    { keepPreviousData: true }
  );

  const refresh = () => {
    queryClient.invalidateQueries(["adminUsers"]);
    queryClient.invalidateQueries(["adminOverview"]);
  };

  const action = useMutation(
    async ({
      url,
      body,
      method = "post",
    }: {
      url: string;
      body: any;
      method?: "post" | "delete";
    }) => {
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

  const openCredits = (u: AdminUser) => {
    creditForm.resetFields();
    setCreditUser(u);
  };

  const toggleSuspend = (u: AdminUser) =>
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

  const rows = data?.data || [];

  return (
    <div className="flex flex-col gap-5">
      <Toolbar>
        <SearchBox
          label="Search people"
          placeholder="Search by name or email"
          onSearch={(v) => {
            setPage(1);
            setSearch(v);
          }}
        />
        <div role="group" aria-label="Status filter" className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.label}
              active={status === f.value}
              onClick={() => {
                setPage(1);
                setStatus(f.value);
              }}
            >
              {f.label}
              {data?.counts && (
                <span className="tabular-nums opacity-70">
                  {formatNumber(data.counts[f.count])}
                </span>
              )}
            </FilterChip>
          ))}
        </div>
      </Toolbar>

      <TableCard>
        <table
          className={`ui-table min-w-[860px] transition-opacity ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <thead>
            <tr>
              <th scope="col">Person</th>
              <th scope="col">Status</th>
              <th scope="col">Role</th>
              <th scope="col" className="!text-right">
                Credits
              </th>
              <th scope="col" className="!text-right">
                Spent (30d)
              </th>
              <th scope="col" className="!text-right">
                Bots
              </th>
              <th scope="col">Last active</th>
              <th scope="col" className="!text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {queryStatus === "loading" && (
              <TableMessage colSpan={8}>Loading people…</TableMessage>
            )}
            {queryStatus === "error" && (
              <TableMessage colSpan={8}>Could not load people.</TableMessage>
            )}
            {data && rows.length === 0 && (
              <TableMessage colSpan={8}>
                No one matches. Try a different search or filter.
              </TableMessage>
            )}
            {rows.map((u) => (
              <tr key={u.user_id}>
                <td>
                  <div className="font-medium text-fg">{u.username}</div>
                  <div className="text-fg-subtle">{u.email || "No email"}</div>
                </td>
                <td>
                  <UserStatus u={u} />
                </td>
                <td className="text-fg-muted">
                  {u.is_admin ? "Admin" : "Member"}
                </td>
                <td
                  className={`text-right tabular-nums ${
                    u.balance <= 0
                      ? "font-semibold text-red-700 dark:text-red-400"
                      : "text-fg"
                  }`}
                >
                  {formatCredits(u.balance)}
                </td>
                <td
                  className="text-right tabular-nums text-fg-muted"
                  title={`${formatNumber(u.messages_30d)} answers in 30 days · ${formatCredits(
                    u.credits_used_total
                  )} all time`}
                >
                  {formatCredits(u.credits_used_30d)}
                </td>
                <td className="text-right tabular-nums">{formatNumber(u.bots)}</td>
                <td
                  className="whitespace-nowrap text-fg-muted"
                  title={`Last active ${formatDate(u.last_active)} · joined ${formatDate(
                    u.createdAt
                  )}`}
                >
                  {formatAgo(u.last_active)}
                </td>
                <td className="whitespace-nowrap text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      className={smallBtn}
                      onClick={() => openCredits(u)}
                    >
                      Credits
                    </button>
                    <button
                      type="button"
                      className={u.is_suspended ? smallBtn : smallDangerBtn}
                      onClick={() => toggleSuspend(u)}
                    >
                      {u.is_suspended ? "Reactivate" : "Suspend"}
                    </button>
                    <Dropdown
                      trigger={["click"]}
                      placement="bottomRight"
                      menu={{
                        items: [
                          { key: "bots", label: "View bots" },
                          { key: "transactions", label: "View transactions" },
                          { type: "divider" },
                          {
                            key: "admin",
                            label: u.is_admin ? "Remove admin" : "Make admin",
                          },
                          { type: "divider" },
                          {
                            key: "delete",
                            label: "Delete user",
                            danger: true,
                            disabled: u.is_admin,
                          },
                        ],
                        onClick: ({ key }) => {
                          if (key === "bots") {
                            navigate(
                              `/admin/bots?user_id=${u.user_id}&user=${encodeURIComponent(
                                u.username
                              )}`
                            );
                          } else if (key === "transactions") {
                            navigate(
                              `/admin/transactions?user_id=${u.user_id}&user=${encodeURIComponent(
                                u.username
                              )}`
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
                      <button
                        type="button"
                        aria-label={`More actions for ${u.username}`}
                        className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <EllipsisHorizontalIcon className="h-4 w-4" />
                      </button>
                    </Dropdown>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <Pager
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onChange={setPage}
      />

      <Modal
        title={`Adjust credits for ${creditUser?.username}`}
        open={Boolean(creditUser)}
        onCancel={() => setCreditUser(null)}
        onOk={() => creditForm.submit()}
        okText="Save"
        confirmLoading={action.isLoading}
      >
        <p className="mb-4 mt-2 text-sm leading-relaxed text-fg-muted">
          Balance {formatCredits(creditUser?.balance)}. The change is logged as
          an admin adjustment.
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
            <CreditTypeToggle />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount ($)"
            rules={[{ required: true, message: "Enter an amount" }]}
          >
            <InputNumber min={0.01} step={1} prefix="$" className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Add / Remove picker used by antd Form.Item (value + onChange).
export const CreditTypeToggle = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) => (
  <div role="radiogroup" aria-label="Action" className="flex gap-2">
    {[
      { v: "add", label: "Add" },
      { v: "remove", label: "Remove" },
    ].map((o) => {
      const checked = value === o.v;
      return (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={checked}
          onClick={() => onChange?.(o.v)}
          className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            checked
              ? "border-[1.5px] border-indigo-600 font-medium text-fg dark:border-indigo-400"
              : "border border-line text-fg-muted hover:bg-surface-2"
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);
