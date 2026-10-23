import { Card, Segmented, Statistic } from "antd";
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
}: {
  title: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) => (
  <Card size="small" className="h-full">
    <Statistic title={title} valueRender={() => value} />
    {hint && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</div>}
  </Card>
);
