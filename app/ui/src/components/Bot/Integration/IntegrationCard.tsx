import React from "react";
import { IntegrationForm } from "./IntegrationForm";

export type IntegrationData = {
  name: string;
  channel: string;
  logo: string;
  description: string;
  link: string;
  fields: {
    name: string;
    type: string;
    title: string;
    description: string;
    help: string;
    inputType: string;
    requiredMessage: string;
    value: string;
  }[];
  isPaused: boolean;
  status: string;
  color: string;
  textColor: string;
  connectBtn?: {
    text: string;
    link: string;
  } | null;
};

// Presentation only: maps the server's integration status to a badge.
const statusBadge = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "CONNECTED":
      return { className: "ui-badge-success", label: "Running", connected: true };
    case "PAUSED":
      return { className: "ui-badge-warning", label: "Paused", connected: true };
    default:
      return { className: "ui-badge-neutral", label: "Not set up", connected: false };
  }
};

// Channel names come from the server with a test-tube emoji for beta
// channels; show that as a "Beta" badge instead.
const cleanName = (name: string) => {
  const beta = /\u{1F9EA}/u.test(name);
  return {
    name: name.replace(/\s*\(\s*\u{1F9EA}\s*\)\s*/u, "").trim(),
    beta,
  };
};

// One row card per channel, with its settings expanding underneath.
export const IntegrationCard: React.FC<{ data: IntegrationData }> = ({
  data,
}) => {
  const [open, setOpen] = React.useState(false);
  const badge = statusBadge(data.status);
  const { name, beta } = cleanName(data.name);
  const panelId = `integration-${data.channel}`;

  return (
    <section
      aria-labelledby={`${panelId}-h`}
      className="ui-card"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-line bg-white p-1.5"
        >
          <img src={data.logo} alt="" className="h-full w-full object-contain" />
        </span>
        <div className="min-w-0 flex-[1_1_200px]">
          <h2
            id={`${panelId}-h`}
            className="m-0 flex items-center gap-2 text-[15px] font-semibold text-fg"
          >
            {name}
            {beta && <span className="ui-badge ui-badge-neutral">Beta</span>}
          </h2>
          <p className="m-0 mt-0.5 text-[13px] text-fg-muted">
            {data.description}
          </p>
        </div>
        <span className={`ui-badge ${badge.className}`}>{badge.label}</span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="ui-btn-secondary h-[34px] px-3 text-[13px] font-normal"
        >
          {open ? "Hide settings" : badge.connected ? "Manage" : "Connect"}
        </button>
      </div>
      {open && (
        <div id={panelId} className="border-t border-line px-5 pb-5 pt-4">
          <IntegrationForm onClose={() => setOpen(false)} data={data} />
        </div>
      )}
    </section>
  );
};
