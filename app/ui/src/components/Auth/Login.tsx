import React from "react";
import { Form, Input, notification } from "antd";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../hooks/useSettings";
import { motion } from "framer-motion";
import { CreditCardIcon, CircleStackIcon, SparklesIcon } from "@heroicons/react/24/outline";
interface User {
  user_id: number;
  username: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
  to: string;
}
export const AuthLogin = () => {
  const navigate = useNavigate();
  const onLogin = async (values: any) => {
    const response = await api.post("/user/login", values);
    return response.data as LoginResponse;
  };

  const { login } = useAuth();

  const { data: info } = useSettings();

  const { mutateAsync: loginMutation, isLoading } = useMutation(onLogin, {
    onSuccess: (data) => {
      notification.success({
        message: "Success",
        description: data.message,
        placement: "bottomRight",
      });
      login(data.token, data.user);
      navigate(data.to);
    },
    onError: (error) => {
      // is axios
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        notification.error({
          message: "Error",
          description: message,
          placement: "bottomRight",
        });
        return;
      }

      notification.error({
        message: "Error",
        description: "Something went wrong",
      });
    },
  });

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your account to continue."
      footer={
        info?.isRegistrationAllowed ? (
          <p className="text-center text-sm text-fg-muted">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Register
            </Link>
          </p>
        ) : (
          <p className="text-center text-xs text-fg-subtle">
            Registration is disabled by admin.
          </p>
        )
      }
    >
      <Form
        layout="vertical"
        onFinish={loginMutation}
        requiredMark={false}
      >
        {" "}
        <Form.Item
          name="username"
          label={"Username"}
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input
            autoComplete="username"
            placeholder="Username"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label={"Password"}
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password
            size="large"
            autoComplete="current-password"
            placeholder="Password"
          />
        </Form.Item>
        <div className="pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="ui-btn-primary h-11 w-full text-[15px]"
          >
            {isLoading && <AuthSpinner />}
            {isLoading ? "Loading..." : "Login"}
          </button>
        </div>
      </Form>
    </AuthShell>
  );
};

export const AuthSpinner = () => (
  <span
    aria-hidden="true"
    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
  />
);

const FEATURES = [
  {
    title: "Dynamic RAG Engine",
    desc: "Connect websites, PDFs, and more. Chat with your data instantly with 99.9% accuracy.",
    icon: CircleStackIcon,
    delay: 0.2,
  },
  {
    title: "Monthly Credit Boost",
    desc: "Every account gets a $20.00 credit infusion every single month. Forever.",
    icon: CreditCardIcon,
    delay: 0.3,
  },
  {
    title: "Advanced Model Suite",
    desc: "Access GPT-4o, Claude 3.5, and Gemini 1.5 Pro all in one unified interface.",
    icon: SparklesIcon,
    delay: 0.4,
  },
];

// Shared split layout for the auth screens: form column + brand panel.
// Renders outside any app layout, so it owns its own background and height.
export const AuthShell = ({
  title,
  description,
  children,
  footer,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => (
  <div className="flex min-h-screen w-full flex-1 bg-app">
    {/* Form column */}
    <div className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden px-4 py-12 sm:px-6 lg:flex-none lg:basis-[46%] lg:px-16 xl:px-24">
      <div
        aria-hidden="true"
        className="chat-hero-glow pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/3"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgb(var(--c-fg)/0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
      />

      <div className="relative mx-auto w-full max-w-sm">
        <div className="animate-fade-up flex items-center gap-2.5">
          <img
            className="h-9 w-9 rounded-xl object-contain"
            src="/logo.png"
            alt="Botcraft Pro"
          />
          <span className="text-[15px] font-semibold tracking-tight text-fg">
            Botcraft Pro
          </span>
          <span className="ui-badge ui-badge-brand">
            {/* @ts-ignore */}
            {`v${__APP_VERSION__}`}
          </span>
        </div>

        <div
          className="animate-fade-up mt-10"
          style={{ animationDelay: "60ms" }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-[26px]">
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
              {description}
            </p>
          )}
        </div>

        <div
          className="ui-card animate-fade-up mt-8 p-6 shadow-raised sm:p-7"
          style={{ animationDelay: "120ms" }}
        >
          {children}
        </div>

        {footer && (
          <div
            className="animate-fade-up mt-8"
            style={{ animationDelay: "180ms" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>

    {/* Brand panel (desktop only) */}
    <div className="relative hidden min-w-0 flex-1 overflow-hidden lg:block">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-700 to-indigo-950 dark:from-indigo-900 dark:via-indigo-950 dark:to-chrome" />
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-fuchsia-400/30 blur-3xl dark:bg-fuchsia-500/15"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="relative flex h-full flex-col justify-center px-12 py-16 text-white xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-inset ring-white/20 backdrop-blur">
            <SparklesIcon className="h-3.5 w-3.5" aria-hidden="true" />
            AI knowledge assistants
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
            The Future of{" "}
            <span className="bg-gradient-to-r from-white to-fuchsia-200 bg-clip-text text-transparent">
              Knowledge
            </span>{" "}
            is Here.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            Harness the power of AI to chat with your documents, automate your
            workflows, and scale your intelligence.
          </p>
        </motion.div>

        <div className="mt-12 grid w-full max-w-lg grid-cols-1 gap-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: feature.delay,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group flex items-start gap-4 rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-xl transition-colors duration-200 hover:bg-white/[0.12]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-inset ring-white/20 transition-transform duration-200 group-hover:scale-105">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-0.5 text-sm leading-relaxed text-white/70">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute bottom-8 left-12 text-xs font-medium text-white/50 xl:left-20"
        >
          Powered by Dialoqbase • Loved by Professionals
        </motion.div>
      </div>
    </div>
  </div>
);
