import { Form, InputNumber, notification, Select, Input } from "antd";
import type { Rule } from "antd/es/form";
import React from "react";
import api from "../../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SettingsLayout } from "../../Layout/SettingsLayout";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import { ApplicationCard } from "../../components/Settings/Application/ApplicationCard";
import { useCreateConfig } from "../../hooks/useCreateConfig";

type ApplicationSettings = {
  noOfBotsPerUser: number;
  allowUserToCreateBots: boolean;
  allowUserToRegister: boolean;
  defaultChunkSize: number;
  defaultChunkOverlap: number;
  defaultChatModel: string;
  defaultEmbeddingModel: string;
  hideDefaultModels: boolean;
  dynamicallyFetchOllamaModels: boolean;
  ollamaURL: string;
  fileUploadSizeLimit: number;
  refetchDatasource: boolean;
  internalSearchEnabled: boolean;
};

// Each group is still saved with exactly the payload its old form sent.
const APPLICATION_FIELDS = [
  "noOfBotsPerUser",
  "allowUserToCreateBots",
  "allowUserToRegister",
  "usePuppeteerFetch",
  "fileUploadSizeLimit",
  "refetchDatasource",
  "internalSearchEnabled",
];
const MODEL_FIELDS = [
  "defaultChatModel",
  "defaultEmbeddingModel",
  "ollamaURL",
  "hideDefaultModels",
  "dynamicallyFetchOllamaModels",
];
const RAG_FIELDS = ["defaultChunkSize", "defaultChunkOverlap"];
const ALL_FIELDS = [...APPLICATION_FIELDS, ...MODEL_FIELDS, ...RAG_FIELDS];

const pick = (values: Record<string, any>, fields: string[]) =>
  Object.fromEntries(fields.map((f) => [f, values[f]]));

const modelFilter = (input: string, option: any) =>
  (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase()) ||
  (option?.value?.toLowerCase() ?? "").includes(input?.toLowerCase());

const modelSort = (optionA: any, optionB: any) =>
  (optionA?.label ?? "")
    .toLowerCase()
    .localeCompare((optionB?.label ?? "").toLowerCase());

// ui-switch wired for antd Form.Item (valuePropName="checked").
const SwitchControl = ({
  id,
  checked,
  onChange,
  label,
}: {
  id?: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
}) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={Boolean(checked)}
    aria-label={label}
    onClick={() => onChange?.(!checked)}
    className="ui-switch"
  >
    <span />
  </button>
);

const SettingRow = ({
  name,
  label,
  help,
  rules,
  isSwitch,
  controlClassName = "",
  children,
}: {
  name: string;
  label: string;
  help: string;
  rules?: Rule[];
  isSwitch?: boolean;
  controlClassName?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-5 py-3.5">
    <div className="min-w-0 flex-[1_1_260px]">
      <label htmlFor={name} className="m-0 block text-sm font-medium text-fg">
        {label}
      </label>
      <p className="mt-0.5 text-[13px] text-fg-muted">{help}</p>
    </div>
    <Form.Item
      name={name}
      rules={rules}
      valuePropName={isSwitch ? "checked" : undefined}
      className={`!m-0 ${isSwitch ? "flex-none" : "w-full sm:w-auto"} ${controlClassName}`}
    >
      {children}
    </Form.Item>
  </div>
);

export default function SettingsApplicationRoot() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { data: models, status: modeStatus } = useCreateConfig();
  const queryClient = useQueryClient();
  const [baseline, setBaseline] = React.useState<Record<string, any> | null>(
    null
  );
  const [dirtyCount, setDirtyCount] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const { data, status } = useQuery(["fetchApplicationSettings"], async () => {
    const response = await api.get("/admin/dialoqbase-settings");
    return response.data as ApplicationSettings;
  });

  React.useEffect(() => {
    if (status === "error") {
      navigate("/settings");
    }
  }, [status]);

  React.useEffect(() => {
    if (data && !baseline) {
      setBaseline({ ...data });
    }
  }, [data]);

  const onUpdateApplicatoon = async (values: any) => {
    const response = await api.post("/admin/dialoqbase-settings", values);
    return response.data;
  };

  const onRagApplicationUpdate = async (values: any) => {
    const response = await api.post("/admin/rag-settings", values);
    return response.data;
  };

  const { mutateAsync: updateApplicationSettings } = useMutation(
    onUpdateApplicatoon,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["fetchBotCreateConfig"]);
        notification.success({
          message: "Success",
          description: data.message,
        });
      },
      onError: (error: any) => {
        notification.error({
          message: "Error",
          description: error?.response?.data?.message || "Something went wrong",
        });
      },
    }
  );

  const { mutateAsync: updateModelSettings } = useMutation(
    onUpdateApplicatoon,
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["fetchBotCreateConfig"]);
        notification.success({
          message: "Success",
          description: data.message,
        });
      },
      onError: (error: any) => {
        notification.error({
          message: "Error",
          description: error?.response?.data?.message || "Something went wrong",
        });
      },
    }
  );
  const { mutateAsync: updateRagSettings } = useMutation(
    onRagApplicationUpdate,
    {
      onSuccess: (data) => {
        notification.success({
          message: "Success",
          description: data.message,
        });
      },
      onError: (error: any) => {
        notification.error({
          message: "Error",
          description: error?.response?.data?.message || "Something went wrong",
        });
      },
    }
  );

  const countDirty = (base: Record<string, any> | null) => {
    if (!base) return 0;
    const values = form.getFieldsValue(ALL_FIELDS);
    return ALL_FIELDS.filter(
      (f) => (values[f] ?? null) !== (base[f] ?? null)
    ).length;
  };

  const onDiscard = () => {
    form.resetFields();
    setDirtyCount(0);
  };

  const onSave = async () => {
    if (!baseline) return;
    let values: Record<string, any>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const changed = (fields: string[]) =>
      fields.some((f) => (values[f] ?? null) !== (baseline[f] ?? null));
    const groups: [string[], (v: any) => Promise<any>][] = [
      [APPLICATION_FIELDS, updateApplicationSettings],
      [MODEL_FIELDS, updateModelSettings],
      [RAG_FIELDS, updateRagSettings],
    ];

    setSaving(true);
    let next = { ...baseline };
    for (const [fields, save] of groups) {
      if (!changed(fields)) continue;
      try {
        await save(pick(values, fields));
        next = { ...next, ...pick(values, fields) };
      } catch {
        // onError already showed a notification; keep these fields dirty.
      }
    }
    setSaving(false);
    setBaseline(next);
    setDirtyCount(countDirty(next));
  };

  const modelSelect = (
    options: any[] | undefined,
    placeholder: string,
    label: string
  ) => (
    <Select
      showSearch
      aria-label={label}
      filterOption={modelFilter}
      filterSort={modelSort}
      placeholder={placeholder}
      options={options || []}
      loading={modeStatus === "loading"}
      className="!w-full sm:!w-[260px]"
    />
  );

  return (
    <SettingsLayout>
      <div>
        <h2 className="m-0 text-lg font-semibold text-fg">Application</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Rules that apply to everyone on this Botcraft Pro.
        </p>
      </div>
      {status === "success" && baseline && (
        <Form
          form={form}
          initialValues={baseline}
          layout="vertical"
          requiredMark={false}
          onValuesChange={() => setDirtyCount(countDirty(baseline))}
          onFinish={onSave}
          className="flex flex-col gap-5"
        >
          <ApplicationCard title="People">
            <SettingRow
              name="allowUserToRegister"
              label="Allow sign-ups"
              help="Anyone with the link can create an account."
              isSwitch
              rules={[
                {
                  required: true,
                  message: "Please input allow user to register!",
                },
              ]}
            >
              <SwitchControl label="Allow sign-ups" />
            </SettingRow>
            <SettingRow
              name="allowUserToCreateBots"
              label="Let users create bots"
              help="Off means only admins can create bots."
              isSwitch
              rules={[
                {
                  required: true,
                  message: "Please input allow user to create bots!",
                },
              ]}
            >
              <SwitchControl label="Let users create bots" />
            </SettingRow>
            <SettingRow
              name="noOfBotsPerUser"
              label="Bots per user"
              help="Most bots one person can own."
              rules={[
                {
                  required: true,
                  message: "Please input no of bots per user!",
                },
              ]}
            >
              <InputNumber className="!w-full sm:!w-[120px]" />
            </SettingRow>
          </ApplicationCard>

          <ApplicationCard title="Data sources">
            <SettingRow
              name="usePuppeteerFetch"
              label="Enhanced website loader"
              help="Renders JavaScript pages before reading them. Slower."
              isSwitch
            >
              <SwitchControl label="Enhanced website loader" />
            </SettingRow>
            <SettingRow
              name="fileUploadSizeLimit"
              label="Files per upload"
              help="Most files in one upload. Default is 10."
              rules={[
                {
                  required: true,
                  message: "Please input the number of files per upload!",
                },
              ]}
            >
              <InputNumber className="!w-full sm:!w-[120px]" />
            </SettingRow>
            <SettingRow
              name="refetchDatasource"
              label="Re-sync data sources"
              help="Fetches sources again at a set interval."
              isSwitch
            >
              <SwitchControl label="Re-sync data sources" />
            </SettingRow>
            <SettingRow
              name="internalSearchEnabled"
              label="Internal search"
              help="Lets bots use the Search tab. Experimental, so it may not work as expected."
              isSwitch
            >
              <SwitchControl label="Internal search" />
            </SettingRow>
          </ApplicationCard>

          <ApplicationCard title="Defaults for new bots">
            <SettingRow
              name="defaultChatModel"
              label="Chat model"
              help="Used when someone creates a bot."
              rules={[
                {
                  required: true,
                  message: "Please select default chat model!",
                },
              ]}
            >
              {modelSelect(
                models?.chatModel,
                "Select a Chat Model",
                "Chat model"
              )}
            </SettingRow>
            <SettingRow
              name="defaultEmbeddingModel"
              label="Embedding model"
              help="Used to index sources."
              rules={[
                {
                  required: true,
                  message: "Please select default embedding model!",
                },
              ]}
            >
              {modelSelect(
                models?.embeddingModel,
                "Select a Embedding Model",
                "Embedding model"
              )}
            </SettingRow>
            <SettingRow
              name="defaultChunkSize"
              label="Chunk size"
              help="Characters per indexed chunk."
              rules={[
                {
                  required: true,
                  message: "Please input default chunk size!",
                },
              ]}
            >
              <InputNumber className="!w-full sm:!w-[120px]" />
            </SettingRow>
            <SettingRow
              name="defaultChunkOverlap"
              label="Chunk overlap"
              help="Characters shared between chunks."
              rules={[
                {
                  required: true,
                  message: "Please input default chunk overlap!",
                },
              ]}
            >
              <InputNumber className="!w-full sm:!w-[120px]" />
            </SettingRow>
            <SettingRow
              name="hideDefaultModels"
              label="Hide built-in models"
              help="Show only models added locally or from Ollama."
              isSwitch
            >
              <SwitchControl label="Hide built-in models" />
            </SettingRow>
          </ApplicationCard>

          <ApplicationCard title="Ollama">
            <SettingRow
              name="ollamaURL"
              label="Ollama URL"
              help="Where your local models run."
              rules={[
                {
                  required: true,
                  message: "Please input ollama url!",
                },
              ]}
            >
              <Input
                placeholder="Enter ollama url"
                className="!w-full sm:!w-[300px]"
              />
            </SettingRow>
            <SettingRow
              name="dynamicallyFetchOllamaModels"
              label="Fetch Ollama models automatically"
              help="Lists whatever models that server has, so you don't add them by hand."
              isSwitch
            >
              <SwitchControl label="Fetch Ollama models automatically" />
            </SettingRow>
          </ApplicationCard>

          {(dirtyCount > 0 || saving) && (
            <div
              role="region"
              aria-label="Unsaved changes"
              className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-[0_8px_24px_rgba(24,24,27,0.08)]"
            >
              <span className="flex-1 text-sm text-fg-muted">
                {saving
                  ? "Saving…"
                  : `${dirtyCount} unsaved ${
                      dirtyCount === 1 ? "change" : "changes"
                    }`}
              </span>
              <button
                type="button"
                onClick={onDiscard}
                disabled={saving}
                className="ui-btn-secondary"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ui-btn-primary"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </Form>
      )}
      {status === "loading" && <SkeletonLoading />}

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          Something went wrong
        </div>
      )}
    </SettingsLayout>
  );
}
