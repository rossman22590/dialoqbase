import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import {
  Pager,
  RemovableChip,
  SearchBox,
  TableCard,
  TableMessage,
  Toolbar,
  formatCredits,
  formatDate,
  formatNumber,
  formatUsd,
  formatWhen,
} from "./shared";
import { Badge } from "../ui";

type AdminTransaction = {
  id: string;
  user_id: number;
  username: string;
  email: string | null;
  amount: number;
  type: string;
  description: string | null;
  metadata: any;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  usage: "Answer",
  admin_adjustment: "Admin adjustment",
  monthly_allowance: "Monthly allowance",
};

const typeLabel = (type: string) =>
  TYPE_LABELS[type] ||
  type.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

const parseMetadata = (metadata: any) => {
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }
  return metadata || {};
};

export const AdminTransactions = () => {
  const [params, setParams] = useSearchParams();
  const userId = params.get("user_id") || undefined;
  const botId = params.get("bot_id") || undefined;
  const [type, setType] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(50);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const { data, isFetching, status } = useQuery(
    ["adminTransactions", userId, botId, type, search, page, pageSize],
    async () => {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(userId ? { user_id: userId } : {}),
        ...(botId ? { bot_id: botId } : {}),
        ...(type ? { type } : {}),
        ...(search ? { search } : {}),
      });
      const response = await api.get(`/admin/oversight/transactions?${query}`);
      return response.data as {
        total: number;
        types: string[];
        data: AdminTransaction[];
      };
    },
    { keepPreviousData: true }
  );

  const clearFilter = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    next.delete(key === "user_id" ? "user" : "bot");
    setPage(1);
    setParams(next);
  };

  const rows = data?.data || [];
  const COLS = 8;

  return (
    <div className="flex flex-col gap-5">
      <Toolbar>
        <SearchBox
          label="Search transactions"
          placeholder="Search person or note"
          onSearch={(v) => {
            setPage(1);
            setSearch(v);
          }}
        />
        <select
          aria-label="Type"
          value={type || ""}
          onChange={(e) => {
            setPage(1);
            setType(e.target.value || undefined);
          }}
          className="ui-input h-[38px] w-auto border-line pr-8 text-[13px]"
        >
          <option value="">All types</option>
          {(data?.types || []).map((t) => (
            <option key={t} value={t}>
              {typeLabel(t)}
            </option>
          ))}
        </select>
        {userId && (
          <RemovableChip onRemove={() => clearFilter("user_id")}>
            Person: {params.get("user") || userId}
          </RemovableChip>
        )}
        {botId && (
          <RemovableChip onRemove={() => clearFilter("bot_id")}>
            Bot: {params.get("bot") || botId}
          </RemovableChip>
        )}
      </Toolbar>

      <TableCard>
        <table
          className={`ui-table min-w-[960px] transition-opacity ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">Person</th>
              <th scope="col">What</th>
              <th scope="col">Channel</th>
              <th scope="col">Model</th>
              <th scope="col" className="!text-right">
                Provider cost
              </th>
              <th scope="col" className="!text-right">
                Credits
              </th>
              <th scope="col">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {status === "loading" && (
              <TableMessage colSpan={COLS}>Loading transactions…</TableMessage>
            )}
            {status === "error" && (
              <TableMessage colSpan={COLS}>
                Could not load transactions.
              </TableMessage>
            )}
            {data && rows.length === 0 && (
              <TableMessage colSpan={COLS}>
                No transactions match. Try a different search, type or filter.
              </TableMessage>
            )}
            {rows.map((t) => {
              const m = parseMetadata(t.metadata);
              const open = expanded === t.id;
              return (
                <React.Fragment key={t.id}>
                  <tr>
                    <td
                      className="whitespace-nowrap text-fg-muted"
                      title={formatDate(t.createdAt)}
                    >
                      {formatWhen(t.createdAt)}
                    </td>
                    <td>
                      <div className="font-medium text-fg">{t.username}</div>
                      {t.email && (
                        <div className="text-fg-subtle">{t.email}</div>
                      )}
                    </td>
                    <td className="max-w-[320px]">
                      <div className="text-fg">
                        {t.description || typeLabel(t.type)}
                      </div>
                      {t.description && (
                        <div className="text-fg-subtle">{typeLabel(t.type)}</div>
                      )}
                    </td>
                    <td className="text-fg-muted">{m.source || "—"}</td>
                    <td className="text-fg-muted">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {m.model || "—"}
                        {m.used_own_key && <Badge tone="brand">Own key</Badge>}
                      </div>
                      {m.input_tokens !== undefined && (
                        <div className="text-fg-subtle tabular-nums">
                          {formatNumber(m.input_tokens)} in ·{" "}
                          {formatNumber(m.output_tokens)} out
                        </div>
                      )}
                    </td>
                    <td className="text-right tabular-nums text-fg-muted">
                      {m.provider_cost_usd !== undefined
                        ? formatUsd(m.provider_cost_usd)
                        : "—"}
                    </td>
                    <td
                      className={`whitespace-nowrap text-right tabular-nums ${
                        t.amount > 0
                          ? "font-medium text-green-700 dark:text-green-400"
                          : "text-fg"
                      }`}
                    >
                      {formatCredits(t.amount, { signed: true })}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setExpanded(open ? null : t.id)}
                        className="ui-btn-ghost h-[30px] px-2.5 text-xs font-normal"
                      >
                        {open ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={COLS} className="bg-app">
                        <pre className="m-0 whitespace-pre-wrap rounded-lg border border-line bg-surface p-3 font-mono text-xs text-fg-muted">
                          {JSON.stringify(m, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      <Pager
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        onChange={(p) => {
          setExpanded(null);
          setPage(p);
        }}
      />
    </div>
  );
};
