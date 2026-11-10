import React from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";
import { XMarkIcon } from "@heroicons/react/24/outline";
import api from "../../../services/api";

// "Allowed sites": only these domains (and their subdomains) can show the bot
// in an iframe. The server enforces it with a frame-ancestors header on the
// bot page. Empty means any site.
export const AllowedSites = () => {
  const { id } = useParams<{ id: string }>();
  const client = useQueryClient();
  const [draft, setDraft] = React.useState("");

  const { data, status } = useQuery(
    ["getAllowedDomains", id],
    async () => {
      const response = await api.get(`/bot/allowed-domains/${id}`);
      return response.data as { domains: string[] };
    },
    { enabled: !!id }
  );
  const domains = data?.domains || [];

  const { mutate, isLoading } = useMutation(
    async (next: string[]) => {
      const response = await api.put(`/bot/allowed-domains/${id}`, {
        domains: next,
      });
      return response.data as { domains: string[] };
    },
    {
      onSuccess: (result) => {
        client.setQueryData(["getAllowedDomains", id], result);
        setDraft("");
      },
      onError: (e: any) => {
        notification.error({
          message:
            e?.response?.data?.message || "Couldn't save the allowed sites",
        });
      },
    }
  );

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    mutate([...domains, value]);
  };

  return (
    <section className="ui-card flex flex-col gap-2.5 px-5 py-4">
      <h2 className="text-[15px] font-semibold text-fg">Allowed sites</h2>
      <p className="text-[13px] text-fg-muted">
        Only these domains can load the chat. Leave empty to allow any site.
        Share links still open for anyone.
      </p>
      {status === "loading" ? (
        <div className="skeleton h-8 w-64 rounded-full" />
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {domains.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 rounded-full border border-line py-1 pl-2.5 pr-1 text-[13px] text-fg"
            >
              {d}
              <button
                type="button"
                aria-label={`Remove ${d}`}
                disabled={isLoading}
                onClick={() => mutate(domains.filter((x) => x !== d))}
                className="flex h-5 w-5 items-center justify-center rounded-full text-fg-subtle hover:bg-surface-2 hover:text-fg"
              >
                <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              add();
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              aria-label="Add a domain"
              placeholder="Add a domain"
              value={draft}
              disabled={isLoading}
              onChange={(e) => setDraft(e.target.value)}
              className="h-[30px] w-44 rounded-full border border-dashed border-line-strong bg-surface px-3 text-[13px] text-fg placeholder:text-fg-subtle focus:border-indigo-500 focus:outline-none"
            />
            {draft.trim() && (
              <button
                type="submit"
                disabled={isLoading}
                className="ui-btn-secondary h-[30px] rounded-full px-3 text-[13px]"
              >
                Add
              </button>
            )}
          </form>
        </div>
      )}
    </section>
  );
};
