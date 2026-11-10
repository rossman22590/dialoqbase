import { Modal, notification } from "antd";
import React from "react";
import api from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SettingsLayout } from "../../Layout/SettingsLayout";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import { GetAllModelResponse, ModelPrices } from "../../@types/settings";
import { formatTokens, formatUsd } from "../../components/Admin/shared";
import { LLMForm } from "../../components/Settings/Model/LLMForm";
import { EMForm } from "../../components/Settings/Model/EMForm";

const formatPrice = (value?: number | null) =>
  value === null || value === undefined ? "—" : formatUsd(value);

// Long-prompt tiers and per-call fees, shown as a tooltip on the price cells.
const priceNotes = (m: ModelPrices) =>
  [
    ...(m.price_tiers || []).map(
      (t) =>
        `Prompts of ${formatTokens(t.min_prompt_tokens)}+ tokens: ${formatUsd(
          t.input_price_per_1m
        )} in, ${formatUsd(t.output_price_per_1m)} out`
    ),
    ...(m.request_price ? [`Plus ${formatUsd(m.request_price)} per request`] : []),
  ].join(". ") || undefined;

export default function SettingsModelRoot() {
  const navigate = useNavigate();
  const [openAddModel, setOpenAddModel] = React.useState(false);
  const client = useQueryClient();

  const [openAddEmbeddingModel, setOpenAddEmbeddingModel] =
    React.useState(false);
  const [modelType, setModelType] = React.useState<"llm" | "embedding">("llm");
  const [search, setSearch] = React.useState("");

  const { data, status } = useQuery(["fetchAllModels"], async () => {
    const response = await api.get("/admin/models");
    return response.data as GetAllModelResponse;
  });

  React.useEffect(() => {
    if (status === "error") {
      navigate("/settings");
    }
  }, [status]);

  const hideModel = async (id: number) => {
    const response = await api.post(`/admin/models/hide`, {
      id,
    });
    return response.data;
  };

  const deleteModel = async (id: number) => {
    const response = await api.post(`/admin/models/delete`, {
      id,
    });
    return response.data;
  };

  const { mutate: hide, isLoading: isHide } = useMutation(hideModel, {
    onSuccess: () => {
      notification.success({
        message: "Model hidden successfully",
      });
      client.invalidateQueries(["fetchAllModels"]);
    },
    onError: (e: any) => {
      const message = e?.response?.data?.message || "Something went wrong";
      notification.error({
        message,
      });
    },
  });

  const { mutate: del, isLoading: isDelete } = useMutation(deleteModel, {
    onSuccess: () => {
      notification.success({
        message: "Model deleted successfully",
      });
      client.invalidateQueries(["fetchAllModels"]);
    },
    onError: (e: any) => {
      const message = e?.response?.data?.message || "Something went wrong";
      notification.error({
        message,
      });
    },
  });

  const rows = React.useMemo(() => {
    const list = (modelType === "llm" ? data?.data : data?.embedding) || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((m) =>
      [m.name, m.model_id, m.model_provider]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, modelType, search]);

  const cleanId = (id: string) =>
    modelType === "llm"
      ? id.replace("-dbase", "").replace(/_dialoqbase_[0-9]+$/, "")
      : id.replace("dialoqbase_eb_", "").replace(/_dialoqbase_[0-9]+$/, "");

  const tabs: { key: "llm" | "embedding"; label: string; count: number }[] = [
    { key: "llm", label: "Chat", count: data?.data.length || 0 },
    {
      key: "embedding",
      label: "Embedding",
      count: data?.embedding.length || 0,
    },
  ];

  const colCount = modelType === "llm" ? 7 : 5;
  const markup = data?.price_markup ?? 1.5;

  return (
    <SettingsLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="m-0 text-lg font-semibold text-fg">Models</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Which models people can pick for their bots, and what each costs
            in credits.
          </p>
        </div>
        {status === "success" && (
          <button
            type="button"
            onClick={() =>
              modelType === "llm"
                ? setOpenAddModel(true)
                : setOpenAddEmbeddingModel(true)
            }
            className="ui-btn-primary"
          >
            {modelType === "llm" ? "Add chat model" : "Add embedding model"}
          </button>
        )}
      </div>
      {status === "loading" && <SkeletonLoading />}
      {status === "success" && (
        <>
          <section className="ui-card">
            <div className="flex flex-wrap items-center gap-x-1 border-b border-line px-4">
              <div
                role="tablist"
                aria-label="Model kind"
                className="flex gap-1"
              >
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={modelType === t.key}
                    onClick={() => setModelType(t.key)}
                    className={`ui-tab min-h-[44px] ${
                      modelType === t.key ? "ui-tab-active" : ""
                    }`}
                  >
                    {t.label}
                    <span className="font-normal tabular-nums text-fg-subtle">
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
              <span className="flex-1" />
              <input
                type="search"
                aria-label="Search models"
                placeholder="Search models"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ui-input my-2 h-8 w-full border-line px-2.5 text-[13px] sm:w-[180px]"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="ui-table min-w-[760px]">
                <thead>
                  <tr>
                    <th scope="col">Model</th>
                    <th scope="col">Provider</th>
                    <th scope="col" className="!text-right">
                      Input / 1M tokens
                    </th>
                    {modelType === "llm" && (
                      <th scope="col" className="!text-right">
                        Output / 1M tokens
                      </th>
                    )}
                    {modelType === "llm" && <th scope="col">Streaming</th>}
                    <th scope="col">Shown to users</th>
                    <th scope="col" className="!text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={colCount}
                        className="!py-10 text-center text-sm text-fg-subtle"
                      >
                        {search
                          ? "No models match your search."
                          : modelType === "llm"
                          ? "No chat models yet. Add one to make it available to bots."
                          : "No embedding models yet. Add one to use it for new data sources."}
                      </td>
                    </tr>
                  )}
                  {rows.map((record) => {
                    const label = record.name || cleanId(record.model_id);
                    return (
                      <tr key={record.id}>
                        <td>
                          <div className="font-medium text-fg">
                            {record.name || "Untitled model"}
                          </div>
                          <div className="font-mono text-xs text-fg-subtle">
                            {cleanId(record.model_id)}
                          </div>
                        </td>
                        <td className="text-fg-muted">
                          {record.model_provider || "—"}
                        </td>
                        <td
                          className="whitespace-nowrap text-right tabular-nums"
                          title={priceNotes(record)}
                        >
                          {formatPrice(record.input_price_per_1m)}
                        </td>
                        {modelType === "llm" && (
                          <td
                            className="whitespace-nowrap text-right tabular-nums"
                            title={priceNotes(record)}
                          >
                            {formatPrice(record.output_price_per_1m)}
                          </td>
                        )}
                        {modelType === "llm" && (
                          <td className="text-fg-muted">
                            {record.stream_available ? "Yes" : "No"}
                          </td>
                        )}
                        <td>
                          <span className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={!record.hide}
                              aria-label={`Show ${label} to users`}
                              disabled={isHide}
                              onClick={() => {
                                hide(record.id);
                              }}
                              className="ui-switch disabled:cursor-wait disabled:opacity-60"
                            >
                              <span />
                            </button>
                            <span className="text-fg-muted">
                              {record.hide ? "Hidden" : "Shown"}
                            </span>
                          </span>
                        </td>
                        <td className="text-right">
                          {record.local_model ? (
                            <button
                              type="button"
                              disabled={isDelete}
                              onClick={() => {
                                const confirm = window.confirm(
                                  "Are you sure you want to delete this model?"
                                );

                                if (confirm) {
                                  del(record.id);
                                }
                              }}
                              aria-label={`Delete ${label}`}
                              className="ui-btn-danger-outline h-[30px] px-2.5 text-[13px] font-normal"
                            >
                              Delete
                            </button>
                          ) : (
                            <span className="text-xs text-fg-subtle">
                              Built-in
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
          <p className="m-0 text-xs text-fg-subtle">
            Prices include the {markup}× markup on the provider's cost.
            Built-in models can be hidden but not deleted.
          </p>

          <Modal
            open={openAddModel}
            footer={null}
            title="Add chat model"
            onCancel={() => {
              setOpenAddModel(false);
            }}
          >
            <LLMForm setOpenAddModel={setOpenAddModel} />
          </Modal>

          <Modal
            open={openAddEmbeddingModel}
            footer={null}
            title="Add embedding model"
            onCancel={() => {
              setOpenAddEmbeddingModel(false);
            }}
          >
            <EMForm setOpenAddEmbeddingModel={setOpenAddEmbeddingModel} />
          </Modal>
        </>
      )}
    </SettingsLayout>
  );
}
