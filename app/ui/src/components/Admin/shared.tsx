import React from "react";
import dayjs from "dayjs";

// Balances and credit amounts are stored in dollars.
export const formatCredits = (
  value: number | null | undefined,
  opts?: { signed?: boolean }
) => {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  const digits = abs > 0 && abs < 0.01 ? 4 : 2;
  const body = `$${abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  })}`;
  if (n < 0) return `−${body}`;
  if (opts?.signed && n > 0) return `+${body}`;
  return body;
};

export const formatUsd = (value: number | null | undefined) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;

export const formatNumber = (value: number | null | undefined) =>
  Number(value || 0).toLocaleString();

export const formatTokens = (value: number | null | undefined) => {
  const n = Number(value || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
};

export const formatDate = (value?: string | number | null) =>
  value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "—";

export const formatWhen = (value?: string | number | null) => {
  if (!value) return "—";
  const d = dayjs(value);
  if (d.isSame(dayjs(), "day")) return d.format("HH:mm");
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Yesterday";
  if (d.isSame(dayjs(), "year")) return d.format("MMM D");
  return d.format("MMM D, YYYY");
};

export const formatAgo = (value?: string | number | null) => {
  if (!value) return "Never";
  const minutes = dayjs().diff(dayjs(value), "minute");
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const errorMessage = (e: any) =>
  e?.response?.data?.message || e?.message || "Something went wrong";

const DAY_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last year", value: 365 },
];

export const daysLabel = (days: number) =>
  DAY_OPTIONS.find((o) => o.value === days)?.label || `Last ${days} days`;

export const DaysPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: number) => void;
}) => (
  <select
    aria-label="Range"
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className="ui-input h-9 w-auto pr-8"
  >
    {DAY_OPTIONS.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

export const StatCard = ({
  title,
  value,
  hint,
}: {
  title: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) => (
  <div className="ui-card flex h-full flex-col gap-1.5 px-4 py-3.5">
    <span className="text-[13px] text-fg-muted">{title}</span>
    <span className="truncate text-2xl font-semibold tabular-nums text-fg">
      {value}
    </span>
    {hint && <span className="text-xs text-fg-subtle">{hint}</span>}
  </div>
);

export const StatGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
    {children}
  </div>
);

/* Toolbar pieces used above the admin tables. */

export const Toolbar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-2.5">{children}</div>
);

// Search box that commits on Enter (and when cleared), like antd's Input.Search.
export const SearchBox = ({
  placeholder,
  onSearch,
  label,
}: {
  placeholder: string;
  onSearch: (value: string) => void;
  label: string;
}) => {
  const [text, setText] = React.useState("");
  return (
    <form
      role="search"
      className="min-w-0 flex-[1_1_240px] sm:max-w-[340px]"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text.trim());
      }}
    >
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (!e.target.value) onSearch("");
        }}
        className="ui-input h-[38px] border-line"
      />
    </form>
  );
};

export const FilterChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      active
        ? "bg-fg text-canvas"
        : "border border-line bg-surface text-fg hover:bg-surface-2"
    }`}
  >
    {children}
  </button>
);

// A removable filter, e.g. "Owner: jlee ×".
export const RemovableChip = ({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) => (
  <span className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-full border border-line bg-surface-2 pl-3 pr-1 text-[13px] text-fg">
    {children}
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove filter"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-fg-subtle hover:bg-surface hover:text-fg"
    >
      ×
    </button>
  </span>
);

/* Tables */

export const TableCard = ({
  title,
  actions,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`ui-card overflow-hidden ${className}`}>
    {(title || actions) && (
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
        {title && (
          <h2 className="m-0 flex-1 text-[15px] font-semibold text-fg">
            {title}
          </h2>
        )}
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    )}
    <div className="overflow-x-auto">{children}</div>
  </section>
);

export const TableMessage = ({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) => (
  <tr>
    <td colSpan={colSpan} className="!py-10 text-center text-sm text-fg-subtle">
      {children}
    </td>
  </tr>
);

export const Pager = ({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) => {
  if (total <= pageSize && page === 1) {
    return total > 0 ? (
      <p className="text-[13px] text-fg-muted">
        Showing {formatNumber(total)} of {formatNumber(total)}
      </p>
    ) : null;
  }
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-fg-muted">
      <span>
        Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          className="ui-btn-secondary h-8 px-3 text-[13px] font-normal"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="ui-btn-secondary h-8 px-3 text-[13px] font-normal"
          disabled={to >= total}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const smallBtn =
  "ui-btn-secondary h-[30px] px-2.5 text-xs font-normal";
export const smallDangerBtn =
  "ui-btn-danger-outline h-[30px] px-2.5 text-xs font-normal";

export const ShareBar = ({ percent, height = 8 }: { percent: number; height?: number }) => (
  <span
    className="block overflow-hidden rounded-full bg-surface-2"
    style={{ height }}
  >
    <span
      className="block rounded-full bg-indigo-600 dark:bg-indigo-400"
      style={{ height, width: `${Math.max(0, Math.min(100, percent))}%` }}
    />
  </span>
);
