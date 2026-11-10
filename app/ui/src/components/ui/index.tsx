// Shared presentation primitives built on the design tokens in index.css.
// Plain markup can use the matching CSS classes (ui-card, ui-btn, ...).
import React from "react";

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export const PageHeader = ({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cx(
      "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
      className
    )}
  >
    <div className="min-w-0">
      {eyebrow && (
        <p className="mb-1 text-xs font-medium text-fg-subtle">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-muted">
          {description}
        </p>
      )}
    </div>
    {actions && (
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
);

export const Card = ({
  children,
  className,
  as: Tag = "div",
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
}) => (
  <Tag className={cx("ui-card", className)} {...rest}>
    {children}
  </Tag>
);

export const CardHeader = ({
  title,
  description,
  actions,
  icon,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cx(
      "flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6",
      className
    )}
  >
    {icon && <div className="ui-icon-tile mt-0.5">{icon}</div>}
    <div className="min-w-0 flex-1">
      <h2 className="text-[15px] font-semibold tracking-tight text-fg">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cx("px-5 py-5 sm:px-6", className)}>{children}</div>;

export const CardFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cx(
      "flex items-center justify-end gap-2 rounded-b-2xl border-t border-line bg-surface-2/50 px-5 py-3 sm:px-6",
      className
    )}
  >
    {children}
  </div>
);

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cx(
      "animate-fade-up flex flex-col items-center justify-center px-6 py-14 text-center",
      className
    )}
  >
    {icon && (
      <div className="relative mb-4">
        <div
          aria-hidden="true"
          className="hidden"
        />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 [&_svg]:h-6 [&_svg]:w-6">
          {icon}
        </div>
      </div>
    )}
    <h3 className="text-base font-semibold tracking-tight text-fg">{title}</h3>
    {description && (
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-fg-muted">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Badge = ({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
  className?: string;
}) => (
  <span className={cx("ui-badge", `ui-badge-${tone}`, className)}>
    {children}
  </span>
);

export const StatTile = ({
  label,
  value,
  hint,
  icon,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="ui-card h-full px-4 py-3.5">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[13px] font-medium text-fg-muted">{label}</p>
      {icon && <div className="ui-icon-tile">{icon}</div>}
    </div>
    <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-fg">
      {value}
    </div>
    {hint && <div className="mt-1 text-xs text-fg-subtle">{hint}</div>}
  </div>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <div aria-hidden="true" className={cx("skeleton rounded-lg", className)} />
);
