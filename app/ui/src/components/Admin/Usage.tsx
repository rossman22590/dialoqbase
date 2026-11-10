import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  DaysPicker,
  ShareBar,
  StatCard,
  StatGrid,
  TableCard,
  TableMessage,
  daysLabel,
  formatCredits,
  formatNumber,
  formatTokens,
  formatUsd,
} from "./shared";
import { Skeleton } from "../ui";

type UsageRow = {
  messages: number;
  credits_used: number;
  provider_cost_usd: number;
  input_tokens: number;
  output_tokens: number;
  [key: string]: any;
};

type Usage = {
  days: number;
  by_user: UsageRow[];
  by_bot: UsageRow[];
  by_model: UsageRow[];
  by_source: UsageRow[];
};

const PREVIEW_ROWS = 10;

const UsageTable = ({
  id,
  title,
  firstHeader,
  rows,
  rowKey,
  renderFirst,
  totalCredits,
}: {
  id: string;
  title: string;
  firstHeader: string;
  rows: UsageRow[];
  rowKey: (r: UsageRow, i: number) => string;
  renderFirst: (r: UsageRow) => React.ReactNode;
  totalCredits: number;
}) => {
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? rows : rows.slice(0, PREVIEW_ROWS);
  return (
    <TableCard
      title={<span id={id}>{title}</span>}
      actions={
        rows.length > PREVIEW_ROWS ? (
          <button
            type="button"
            className="ui-btn-ghost h-8 px-2.5 text-[13px] font-normal"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show top 10" : `Show all ${rows.length}`}
          </button>
        ) : undefined
      }
    >
      <table className="ui-table min-w-[860px]" aria-labelledby={id}>
        <thead>
          <tr>
            <th scope="col">{firstHeader}</th>
            <th scope="col" className="!text-right">
              Answers
            </th>
            <th scope="col" className="!text-right">
              Tokens in
            </th>
            <th scope="col" className="!text-right">
              Tokens out
            </th>
            <th scope="col" className="!text-right">
              Provider cost
            </th>
            <th scope="col">Share of credits</th>
            <th scope="col" className="!text-right">
              Credits
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <TableMessage colSpan={7}>No usage in this period.</TableMessage>
          )}
          {visible.map((r, i) => (
            <tr key={rowKey(r, i)}>
              <td className="font-medium text-fg">{renderFirst(r)}</td>
              <td className="text-right tabular-nums">
                {formatNumber(r.messages)}
              </td>
              <td
                className="text-right tabular-nums text-fg-muted"
                title={formatNumber(r.input_tokens)}
              >
                {formatTokens(r.input_tokens)}
              </td>
              <td
                className="text-right tabular-nums text-fg-muted"
                title={formatNumber(r.output_tokens)}
              >
                {formatTokens(r.output_tokens)}
              </td>
              <td className="text-right tabular-nums text-fg-muted">
                {formatUsd(r.provider_cost_usd)}
              </td>
              <td className="min-w-[140px]">
                <ShareBar
                  percent={
                    totalCredits > 0 ? (r.credits_used / totalCredits) * 100 : 0
                  }
                />
              </td>
              <td className="text-right tabular-nums">
                {formatCredits(r.credits_used)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
};

export const AdminUsage = () => {
  const [days, setDays] = React.useState(30);
  const { data, status } = useQuery(["adminUsage", days], async () => {
    const response = await api.get(`/admin/oversight/usage?days=${days}`);
    return response.data as Usage;
  });

  // by_model is not capped server-side, so it gives exact totals.
  const totals = React.useMemo(() => {
    const rows = data?.by_model || [];
    return rows.reduce(
      (acc, r) => ({
        messages: acc.messages + r.messages,
        credits: acc.credits + r.credits_used,
        cost: acc.cost + r.provider_cost_usd,
      }),
      { messages: 0, credits: 0, cost: 0 }
    );
  }, [data]);

  const maxChannel = Math.max(
    0,
    ...(data?.by_source || []).map((r) => r.credits_used)
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="m-0 flex-1 text-base font-semibold text-fg">
          {daysLabel(days)}
        </h2>
        <DaysPicker value={days} onChange={setDays} />
      </div>

      {status === "loading" && (
        <>
          <StatGrid>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[84px] rounded-xl" />
            ))}
          </StatGrid>
          <Skeleton className="h-64 rounded-xl" />
        </>
      )}
      {status === "error" && (
        <div className="ui-card px-5 py-10 text-center text-sm text-fg-muted">
          Could not load usage. Try again in a moment.
        </div>
      )}

      {data && (
        <>
          <StatGrid>
            <StatCard title="Answers" value={formatNumber(totals.messages)} />
            <StatCard
              title="Credits billed"
              value={formatCredits(totals.credits)}
            />
            <StatCard
              title="Provider cost"
              value={formatUsd(totals.cost)}
              hint="Recorded for answers billed since cost tracking was added"
            />
          </StatGrid>

          <UsageTable
            id="bm-h"
            title="By model"
            firstHeader="Model"
            rows={data.by_model}
            rowKey={(r) => String(r.model)}
            renderFirst={(r) => r.model}
            totalCredits={totals.credits}
          />

          <section
            aria-labelledby="bc-h"
            className="ui-card flex flex-col gap-3 px-5 pb-5 pt-4"
          >
            <h2 id="bc-h" className="m-0 text-[15px] font-semibold text-fg">
              By channel{" "}
              <span className="font-normal text-fg-subtle">· credits</span>
            </h2>
            {data.by_source.length === 0 && (
              <p className="text-[13px] text-fg-subtle">
                No usage in this period.
              </p>
            )}
            {data.by_source.map((r) => (
              <div
                key={r.source}
                className="grid grid-cols-[minmax(90px,130px)_minmax(0,1fr)_auto] items-center gap-3 text-[13px]"
                title={`${formatNumber(r.messages)} answers · ${formatUsd(
                  r.provider_cost_usd
                )} provider cost`}
              >
                <span className="truncate capitalize text-fg-muted">
                  {r.source}
                </span>
                <ShareBar
                  height={10}
                  percent={
                    maxChannel > 0 ? (r.credits_used / maxChannel) * 100 : 0
                  }
                />
                <span className="min-w-[64px] text-right tabular-nums text-fg">
                  {formatCredits(r.credits_used)}
                </span>
              </div>
            ))}
          </section>

          <UsageTable
            id="bu-h"
            title="By person"
            firstHeader="Person"
            rows={data.by_user}
            rowKey={(r) => String(r.user_id)}
            renderFirst={(r) => (
              <Link
                to={`/admin/transactions?user_id=${r.user_id}&user=${encodeURIComponent(
                  r.username
                )}`}
                className="text-fg hover:text-indigo-700 hover:underline dark:hover:text-indigo-300"
              >
                {r.username}
              </Link>
            )}
            totalCredits={totals.credits}
          />

          <UsageTable
            id="bb-h"
            title="By bot"
            firstHeader="Bot"
            rows={data.by_bot}
            rowKey={(r, i) => String(r.bot_id ?? `unknown-${i}`)}
            renderFirst={(r) =>
              r.bot_name ? (
                <div>
                  <Link
                    to={`/bot/${r.bot_id}`}
                    className="text-fg hover:text-indigo-700 hover:underline dark:hover:text-indigo-300"
                  >
                    {r.bot_name}
                  </Link>
                  {r.owner && (
                    <div className="font-normal text-fg-subtle">{r.owner}</div>
                  )}
                </div>
              ) : (
                <span className="font-normal text-fg-subtle">
                  {r.bot_id || "Unknown"} (deleted)
                </span>
              )
            }
            totalCredits={totals.credits}
          />
        </>
      )}
    </div>
  );
};
