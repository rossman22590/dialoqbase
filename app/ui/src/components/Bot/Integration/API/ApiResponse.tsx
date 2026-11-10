import React from "react";

type Props = {
  status: string;
  data: string;
};

export const ApiResponse: React.FC<Props> = ({ status, data }) => {
  const ok = String(status).startsWith("2");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-fg-muted">
        <span
          className={`rounded-md px-1.5 py-px font-mono font-semibold ${
            ok
              ? "bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300"
              : "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300"
          }`}
        >
          {status}
        </span>
        <span>Response</span>
      </div>
      <pre className="m-0 max-h-[420px] overflow-auto rounded-lg border border-line bg-app p-3 text-xs leading-relaxed text-fg">
        {data}
      </pre>
    </div>
  );
};
