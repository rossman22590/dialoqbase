import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import { BotForm } from "../../components/Common/BotForm";
import { Form, notification } from "antd";
import axios from "axios";
import { useCreateConfig } from "../../hooks/useCreateConfig";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "../../components/ui";

export default function NewRoot() {
  const { data: botConfig, status: botConfigStatus } = useCreateConfig();

  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState<any>({
    id: 1,
    value: "Website",
  });
  // Only drives the step indicator: the picker starts empty on this page.
  const [hasPickedSource, setHasPickedSource] = useState(false);
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

  const currentStep = hasPickedSource ? 2 : 1;
  const steps = ["Add knowledge", "Pick a model", "Try it"];

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6 px-4 pb-12 pt-8 sm:px-6">
      <Link
        to="/"
        className="self-start text-[13px] text-fg-muted no-underline hover:text-fg"
      >
        ← Bots
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-fg">
          Create a bot
        </h1>
        <p className="mt-1.5 text-sm text-fg-muted">
          Pick where it learns from and which model answers. You can add more
          sources and change everything later.
        </p>
      </div>

      <ol
        aria-label="Steps"
        className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-sm"
      >
        {steps.map((label, i) => {
          const step = i + 1;
          const isCurrent = step === currentStep;
          const isDone = step < currentStep;
          return (
            <li
              key={label}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex items-center gap-2 ${
                isCurrent ? "font-medium text-fg" : "text-fg-muted"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  isCurrent || isDone
                    ? "bg-indigo-600 text-white"
                    : "ring-1 ring-inset ring-line-strong"
                }`}
              >
                {isDone ? (
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : (
                  step
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-start gap-6">
        <section
          aria-label="New bot"
          className="min-w-0 flex-[999_1_520px] rounded-xl border border-line bg-surface"
        >
          {botConfigStatus === "success" && (
            <BotForm
              botConfig={botConfig}
              showEmbeddingAndModels={true}
              createBot={createBot}
              isLoading={isLoading}
              setSelectedSource={(value: any) => {
                setHasPickedSource(true);
                setSelectedSource(value);
              }}
              form={form}
              onCancel={() => navigate("/")}
            />
          )}
          {botConfigStatus === "error" && (
            <div className="p-6">
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                <ExclamationTriangleIcon
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <div>Something went wrong while fetching config</div>
              </div>
            </div>
          )}
          {botConfigStatus === "loading" && (
            <div aria-busy="true" className="space-y-4 px-6 py-5">
              <span className="sr-only">Loading</span>
              <div className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))]">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Skeleton key={item} className="h-14 rounded-[10px]" />
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </section>

        <aside className="flex max-w-[340px] flex-[1_1_260px] flex-col gap-3 rounded-xl border border-line bg-surface p-5 text-[13px] leading-normal text-fg-muted">
          <h2 className="text-sm font-semibold text-fg">What happens next</h2>
          <p>
            We read your sources in the background. Small files take a few
            seconds; whole sites take longer.
          </p>
          <p>
            The chat model writes the answers and the embedding model indexes
            your sources. You can switch the chat model later in settings.
          </p>
          <p>
            Then you land in the playground with your new bot to try it.
          </p>
        </aside>
      </div>
    </div>
  );
}
