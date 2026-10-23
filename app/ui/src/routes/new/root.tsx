import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import { BotForm } from "../../components/Common/BotForm";
import { Form, notification } from "antd";
import axios from "axios";
import { useCreateConfig } from "../../hooks/useCreateConfig";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Card, PageHeader, Skeleton } from "../../components/ui";

export default function NewRoot() {
  const { data: botConfig, status: botConfigStatus } = useCreateConfig();

  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState<any>({
    id: 1,
    value: "Website",
  });
  const [form] = Form.useForm();
  const onSubmit = async (values: any) => {
    if (selectedSource.id == 2 || selectedSource.id == 5) {
      const formData = new FormData();
      values.file.forEach((file: any) => {
        formData.append("file", file.originFileObj);
      });
      const response = await api.post(
        `/bot/upload?embedding=${values.embedding}&model=${values.model}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    }
    const response = await api.post("/bot", {
      type: selectedSource.value.toLowerCase(),
      ...values,
    });
    return response.data;
  };
  const { mutateAsync: createBot, isLoading } = useMutation(onSubmit, {
    onSuccess: (data: any) => {
      navigate(`/bot/${data.id}`);
    },
    onError: (e) => {
      console.log(e);
      if (axios.isAxiosError(e)) {
        const message =
          e.response?.data?.message ||
          e?.response?.data?.error ||
          "Something went wrong.";
        notification.error({
          message: "Error",
          description: message,
        });
        return;
      }

      notification.error({
        message: "Error",
        description: "Something went wrong.",
      });
    },
  });

  return (
    <>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <PageHeader
          className="animate-fade-up"
          eyebrow="New bot"
          title="Create a new bot"
          description="Choose where your bot should learn from, then pick the models it uses. You can add more sources and change settings later."
        />
        <Card
          className="animate-fade-up mt-8 px-5 py-6 sm:px-8 sm:py-8"
          style={{ animationDelay: "80ms" }}
        >
          {botConfigStatus === "success" && (
            <BotForm
              botConfig={botConfig}
              showEmbeddingAndModels={true}
              createBot={createBot}
              isLoading={isLoading}
              setSelectedSource={setSelectedSource}
              form={form}
            />
          )}
          {botConfigStatus === "error" && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <ExclamationTriangleIcon
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <div>Something went wrong while fetching config</div>
            </div>
          )}
          {botConfigStatus === "loading" && (
            <div aria-busy="true" className="space-y-6">
              <span className="sr-only">Loading</span>
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Skeleton key={item} className="h-[84px] rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
