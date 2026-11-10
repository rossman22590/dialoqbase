import { Form } from "antd";
import { AppearanceType } from "./types";
import React from "react";
import { AppearanceForm } from "./AppearanceForm";
import {
  AppearancePreview,
  AppearanceWidgetPreview,
} from "./AppearancePreview";

type Props = AppearanceType;

export const AppearanceBody = (props: Props) => {
  const [form] = Form.useForm();
  const [mode, setMode] = React.useState<"site" | "page">("site");

  React.useEffect(() => {
    form.setFieldsValue({
      ...props,
    });
  }, [props.data]);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:flex-row">
      <div className="min-w-0 flex-1 px-4 pb-8 pt-6 sm:px-8 sm:pt-7">
        <div className="max-w-3xl">
          <AppearanceForm initialData={props} form={form} />
        </div>
      </div>
      <aside
        aria-label="Live preview"
        className="flex flex-col gap-3 border-t border-line bg-surface-2 p-5 lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0"
      >
        <div
          role="group"
          aria-label="Preview mode"
          className="flex self-start rounded-lg border border-line bg-surface p-0.5"
        >
          {(
            [
              ["site", "On a website"],
              ["page", "Full page"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={mode === key}
              onClick={() => setMode(key)}
              className={`h-[30px] rounded-md px-2.5 text-xs ${
                mode === key
                  ? "bg-surface-2 font-medium text-fg"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="min-h-[600px] flex-1 overflow-hidden rounded-xl border border-line bg-white">
          {mode === "site" ? (
            <AppearanceWidgetPreview form={form} />
          ) : (
            <AppearancePreview form={form} />
          )}
        </div>
      </aside>
    </div>
  );
};
