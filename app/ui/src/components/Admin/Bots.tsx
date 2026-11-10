import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import {
  FilterChip,
  Pager,
  RemovableChip,
  SearchBox,
  TableCard,
  TableMessage,
  Toolbar,
  formatAgo,
  formatCredits,
  formatDate,
  formatNumber,
  smallBtn,
} from "./shared";
import { Badge } from "../ui";

type AdminBot = {
  id: string;
  publicId: string;
  name: string;
  model: string;
  embedding: string;
  createdAt: string;
  owner: {
    user_id: number;
    username: string;
    email: string | null;
    isSuspended: boolean;
    balance: number;
  } | null;
  sources: number;
  uses_own_key: boolean;
  answer_status: "answering" | "paused" | "owner_suspended";
  messages_30d: number;
  credits_used_30d: number;
  messages_total: number;
  credits_used_total: number;
  last_used: string | null;
};

type BotCounts = { all: number; paused: number; own_key: number };

const STATUS_FILTERS: {
  value: string | undefined;
  label: string;
  count: keyof BotCounts;
}[] = [
  { value: undefined, label: "All", count: "all" },
  { value: "paused", label: "Paused", count: "paused" },
  { value: "own_key", label: "Own API key", count: "own_key" },
];

// Mirrors checkCanAnswer on the server, which sets answer_status.
const BotStatus = ({ b }: { b: AdminBot }) => {
  if (b.answer_status === "owner_suspended")
    return <Badge tone="neutral">Owner suspended</Badge>;
  if (b.answer_status === "paused")
    return <Badge tone="warning">Paused: owner at $0</Badge>;
  return <Badge tone="success">Answering</Badge>;
};

export const AdminBots = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const userId = params.get("user_id") || undefined;
  const userName = params.get("user") || userId;
  const [search, setSearch] = React.useState("");
  const [botStatus, setBotStatus] = React.useState<string | undefined>();
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(25);

  const { data, isFetching, status } = useQuery(
    ["adminBots", search, userId, page, pageSize, botStatus],
    async () => {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
        ...(userId ? { user_id: userId } : {}),
        ...(botStatus ? { status: botStatus } : {}),
      });
      const response = await api.get(`/admin/oversight/bots?${query}`);
      return response.data as {
        total: number;
        counts?: BotCounts;
        data: AdminBot[];
      };
    },
    { keepPreviousData: true }
  );

  const rows = data?.data || [];

  return (
    <div className="flex flex-col gap-5">
      <Toolbar>
        <SearchBox
          label="Search bots"
          placeholder="Search bots or owners"
          onSearch={(v) => {
            setPage(1);
            setSearch(v);
          }}
        />
        <div role="group" aria-label="Status filter" className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <FilterChip
              key={f.label}
              active={botStatus === f.value}
              onClick={() => {
                setPage(1);
                setBotStatus(f.value);
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
        {userId && (
          <RemovableChip
            onRemove={() => {
              setPage(1);
              setParams({});
            }}
          >
            Owner: {userName}
          </RemovableChip>
        )}
      </Toolbar>

      <TableCard>
        <table
          className={`ui-table min-w-[1080px] transition-opacity ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <thead>
            <tr>
              <th scope="col">Bot</th>
              <th scope="col">Owner</th>
              <th scope="col">Model</th>
              <th scope="col">Billing</th>
              <th scope="col">Status</th>
              <th scope="col" className="!text-right">
                Sources
              </th>
              <th scope="col" className="!text-right">
                Answers (30d)
              </th>
              <th scope="col" className="!text-right">
                Credits (30d)
              </th>
              <th scope="col">Last used</th>
              <th scope="col" className="!text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" && (
              <TableMessage colSpan={10}>Loading bots…</TableMessage>
            )}
            {status === "error" && (
              <TableMessage colSpan={10}>Could not load bots.</TableMessage>
            )}
            {data && rows.length === 0 && (
              <TableMessage colSpan={10}>
                No bots match. Try a different search or filter.
              </TableMessage>
            )}
            {rows.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link
                    to={`/bot/${b.id}`}
                    className="font-medium text-fg hover:text-indigo-700 hover:underline dark:hover:text-indigo-300"
                  >
                    {b.name}
                  </Link>
                  <div
                    className="text-fg-subtle"
                    title={`Created ${formatDate(b.createdAt)}`}
                  >
                    <span className="font-mono text-[11px]">{b.id}</span>
                  </div>
                </td>
                <td className="text-fg-muted">
                  {b.owner ? (
                    b.owner.username
                  ) : (
                    <span className="text-fg-subtle">None</span>
                  )}
                </td>
                <td className="text-fg-muted">{b.model}</td>
                <td className="text-fg-muted">
                  {b.uses_own_key ? "Own API key" : "Credits"}
                </td>
                <td className="whitespace-nowrap">
                  <BotStatus b={b} />
                </td>
                <td className="text-right tabular-nums">
                  {formatNumber(b.sources)}
                </td>
                <td
                  className="text-right tabular-nums"
                  title={`${formatNumber(b.messages_total)} all time`}
                >
                  {formatNumber(b.messages_30d)}
                </td>
                <td
                  className="text-right tabular-nums"
                  title={`${formatCredits(b.credits_used_total)} all time`}
                >
                  {b.uses_own_key && !b.credits_used_30d
                    ? "—"
                    : formatCredits(b.credits_used_30d)}
                </td>
                <td
                  className="whitespace-nowrap text-fg-muted"
                  title={formatDate(b.last_used)}
                >
                  {formatAgo(b.last_used)}
                </td>
                <td className="whitespace-nowrap text-right">
                  <div className="inline-flex gap-1.5">
                    <button
                      type="button"
                      className={smallBtn}
                      onClick={() => navigate(`/bot/${b.id}`)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className={smallBtn}
                      onClick={() =>
                        navigate(
                          `/admin/transactions?bot_id=${b.id}&bot=${encodeURIComponent(
                            b.name
                          )}`
                        )
                      }
                    >
                      Transactions
                    </button>
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
    </div>
  );
};
