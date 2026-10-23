import { Form } from "antd";
import { AppearanceType } from "./types";
import React from "react";
import { AppearanceForm } from "./AppearanceForm";
import { AppearancePreview } from "./AppearancePreview";
import { Card, CardHeader, PageHeader } from "../../ui";
import { EyeIcon, SwatchIcon } from "@heroicons/react/24/outline";

type Props = AppearanceType;

export const AppearanceBody = (props: Props) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({
      ...props,
    });
  }, [props.data]);

  return (
    <div>
      <PageHeader
        title="Appearance"
        description="Customize how your bot looks and sounds. Changes show up in the live preview as you type."
      />
      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <section aria-label="Appearance settings" className="min-w-0 lg:col-span-3">
          <Card>
            <CardHeader
              icon={<SwatchIcon />}
              title="Bot appearance"
              description="Name, greeting, chat bubble colours and voice."
            />
            <AppearanceForm initialData={props} form={form} />
          </Card>
        </section>
        <section
          aria-label="Live preview"
          className="min-w-0 lg:sticky lg:top-20 lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <CardHeader
              icon={<EyeIcon />}
              title="Live preview"
              description="A mock of the chat widget."
            />
            <div className="bg-surface-2 p-3 sm:p-4">
              <div className="overflow-hidden rounded-xl border border-line shadow-soft">
                <AppearancePreview form={form} />
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};
