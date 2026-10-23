import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vsDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type Props = {
  status: string;
  data: string;
};

export const ApiResponse: React.FC<Props> = ({ status, data }) => {
  return (
    <div>
      <div className="mb-3 flex flex-row items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-subtle">
          Response
        </span>
        <span
          className={`ui-badge font-mono ${
            String(status).startsWith("2")
              ? "ui-badge-success"
              : "ui-badge-danger"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="flex flex-row overflow-hidden rounded-xl border border-zinc-900/10 bg-zinc-950 shadow-raised ring-1 ring-inset ring-white/[0.06] dark:border-white/10 [&>*]:min-w-0 [&>*]:flex-1">
        <SyntaxHighlighter
          language="json"
          style={vsDark}
          customStyle={{
            margin: 0,
            padding: "1rem 1.25rem",
            background: "transparent",
            fontSize: "1rem",
            lineHeight: "1.5rem",
          }}
          codeTagProps={{
            className: "text-sm",
          }}
        >
          {data}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
