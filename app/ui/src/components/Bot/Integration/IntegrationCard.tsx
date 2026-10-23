import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

type Prosp = {
  href?: string;
  onClick?: () => void;
  logo: string;
  name: string;
  color: string;
  textColor: string;
  status?: string;
  description: string;
};

// Presentation only: maps the server's integration status to a badge.
const statusBadge = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "CONNECTED":
      return { className: "ui-badge-success", label: "Connected" };
    case "PAUSED":
      return { className: "ui-badge-warning", label: "Paused" };
    default:
      return { className: "ui-badge-neutral", label: "Not connected" };
  }
};

const TILE =
  "group relative flex h-full w-full flex-col rounded-2xl border border-line bg-surface p-5 text-left shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-app";

const Logo = ({ logo, name }: { logo: string; name: string }) => (
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white p-2 shadow-soft">
    <img className="h-full w-full object-contain" src={logo} alt={name} />
  </div>
);

const Body = ({ name, description }: { name: string; description: string }) => (
  <div className="mt-4 min-w-0">
    <h3 className="text-[15px] font-semibold tracking-tight text-fg">
      {name}
    </h3>
    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-fg-muted">
      {description}
    </p>
  </div>
);

export const IntegrationCard: React.FC<Prosp> = ({
  href,
  onClick,
  logo,
  name,
  status,
  description,
}) => {
  const badge = statusBadge(status);

  return !href ? (
    <button type="button" onClick={onClick} className={TILE}>
      <div className="flex items-start justify-between gap-3">
        <Logo logo={logo} name={name} />
        <span className={`ui-badge ${badge.className}`}>
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-current"
          />
          {badge.label}
        </span>
      </div>
      <Body name={name} description={description} />
      <span className="mt-auto pt-4 text-[13px] font-medium text-indigo-600 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:text-indigo-400 [@media(hover:none)]:opacity-100">
        Configure
      </span>
    </button>
  ) : (
    <Link to={href} className={TILE}>
      <div className="flex items-start justify-between gap-3">
        <Logo logo={logo} name={name} />
        <ArrowUpRightIcon className="h-4 w-4 text-fg-subtle transition-all duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>
      <Body name={name} description={description} />
      <span className="mt-auto pt-4 text-[13px] font-medium text-indigo-600 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:text-indigo-400 [@media(hover:none)]:opacity-100">
        Open
      </span>
    </Link>
  );
};
