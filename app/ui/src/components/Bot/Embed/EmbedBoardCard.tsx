import React from "react";
import { LinkIcon } from "@heroicons/react/24/outline";
import { CopyBtn } from "../../Common/CopyBtn";
import { Card, CardBody, CardHeader } from "../../ui";

// Layered dark panel used for every embed snippet. The copy button keeps
// CopyBtn's own copy + "Copied" feedback logic.
export function EmbedCodePanel({
  label,
  copyValue,
  children,
}: {
  label: string;
  copyValue: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-900/10 bg-zinc-950 shadow-raised ring-1 ring-inset ring-white/[0.06] dark:border-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] bg-white/[0.03] py-1.5 pl-4 pr-1.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </span>
          <span className="truncate font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-400">
            {label}
          </span>
        </div>
        <CopyBtn
          value={copyValue}
          iconSize="h-4 w-4"
          className="h-8 shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-white/10"
        />
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function EmbedBoardCard({
  content,
  title,
  description,
}: {
  content: string;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader icon={<LinkIcon />} title={title} description={description} />
      <CardBody>
        <EmbedCodePanel label={title} copyValue={content}>
          <div className="whitespace-pre px-4 py-3.5 font-mono text-[13px] leading-relaxed text-zinc-200 selection:bg-indigo-500/40">
            {content}
          </div>
        </EmbedCodePanel>
      </CardBody>
    </Card>
  );
}
