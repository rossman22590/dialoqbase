import React from "react";
import { Link, useParams } from "react-router-dom";
import { IntegrationCard, IntegrationData } from "./IntegrationCard";

type Props = {
  data: IntegrationData[];
};

export const IntegrationGrid: React.FC<Props> = ({ data }) => {
  const param = useParams<{ id: string }>();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-fg">
          Integrations
        </h1>
        <p className="m-0 mt-1.5 text-sm text-fg-muted">
          Let people talk to your bot where they already chat. Every answer
          uses your credits.
        </p>
      </div>

      {data.map((integration, index) => (
        <IntegrationCard
          key={integration.channel || index}
          data={integration}
        />
      ))}

      <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-dashed border-line-strong px-5 py-4 text-sm">
        <span className="flex-[1_1_240px] text-fg-muted">
          Want it on your own site or app instead?
        </span>
        <Link
          to={`/bot/${param.id}/embed`}
          className="font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          Embed on a site →
        </Link>
        <Link
          to={`/bot/${param.id}/integrations/api`}
          className="font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          Use the API →
        </Link>
      </section>
    </div>
  );
};
