import { Segmented } from "antd";
import dayjs from "dayjs";

export const formatCredits = (value: number | null | undefined) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatUsd = (value: number | null | undefined) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;

export const formatNumber = (value: number | null | undefined) =>
  Number(value || 0).toLocaleString();

export const formatDate = (value?: string | number | null) =>
  value ? dayjs(value).format("YYYY-MM-DD HH:mm") : "—";

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

export const DaysPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: number) => void;
}) => (
  <Segmented
    value={value}
    onChange={(v) => onChange(Number(v))}
    options={[
      { label: "7 days", value: 7 },
      { label: "30 days", value: 30 },
      { label: "90 days", value: 90 },
      { label: "1 year", value: 365 },
    ]}
  />
);

export const StatCard = ({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="ui-card flex h-full flex-col p-4 sm:p-5">
    <div className="flex items-start justify-between gap-2">
      <p className="text-[13px] font-medium leading-snug text-fg-muted">
        {title}
      </p>
      {icon && <div className="ui-icon-tile">{icon}</div>}
    </div>
    <div className="mt-2 truncate text-xl font-semibold tabular-nums tracking-tight text-fg sm:text-2xl">
      {value}
    </div>
    {hint && (
      <div className="mt-1.5 text-xs leading-relaxed text-fg-subtle">
        {hint}
      </div>
    )}
  </div>
);

/* Presentation helpers shared by the admin tabs. */

export const SectionHeader = ({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h2 className="flex flex-wrap items-center gap-2 text-[15px] font-semibold tracking-tight text-fg">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">
          {description}
        </p>
      )}
    </div>
    {actions && (
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
);

export const TableCard = ({
  title,
  description,
  toolbar,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="ui-card overflow-hidden">
    {title && (
      <div className="border-b border-line px-4 py-3.5 sm:px-5">
        <h3 className="text-sm font-semibold tracking-tight text-fg">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-fg-subtle">
            {description}
          </p>
        )}
      </div>
    )}
    {toolbar && (
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2/40 px-4 py-3 sm:px-5">
        {toolbar}
      </div>
    )}
    <div className="[&_.ant-table-pagination]:px-4">{children}</div>
  </div>
);
