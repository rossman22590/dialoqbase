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
    <div className="flex min-h-full bg-white flex-1 dark:bg-[#171717]">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-700 flex items-center">
              <img className="h-8 w-auto" src="/logo.png" alt="Botcraft Pro" />
              <span className="text-lg font-bold dark:text-white">Botcraft Pro</span>
              <span className="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 ml-2">
                {/* @ts-ignore */}
                {`v${__APP_VERSION__}`}
              </span>
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
              Login to your account
            </h2>
          </div>

          <div className="mt-10">
            <div>
              <Form
                layout="vertical"
                className="space-y-6"
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
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {isLoading ? "Loading..." : "Login"}
                  </button>
                </div>
              </Form>
            </div>
            {info?.isRegistrationAllowed ? (
              <p className="mt-10 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                >
                  Register
                </Link>
              </p>
            ) : (
              <p className="mt-10 text-center text-xs text-gray-500">
                Registration is disabled by admin.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-sky-900 dark:from-indigo-950 dark:via-slate-900 dark:to-neutral-900">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          <div className="relative h-full flex flex-col items-center justify-center px-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl text-center mb-16"
            >
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                The Future of <span className="text-sky-400">Knowledge</span> is Here.
              </h1>
              <p className="text-lg text-slate-200">
                Harness the power of AI to chat with your documents, automate your workflows, and scale your intelligence.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 w-full max-w-lg">
              {[
                {
                  title: "Dynamic RAG Engine",
                  desc: "Connect websites, PDFs, and more. Chat with your data instantly with 99.9% accuracy.",
                  icon: CircleStackIcon,
                  delay: 0.2
                },
                {
                  title: "Monthly Credit Boost",
                  desc: "Every account gets a $20.00 credit infusion every single month. Forever.",
                  icon: CreditCardIcon,
                  delay: 0.4
                },
                {
                  title: "Advanced Model Suite",
                  desc: "Access GPT-4o, Claude 3.5, and Gemini 1.5 Pro all in one unified interface.",
                  icon: SparklesIcon,
                  delay: 0.6
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: feature.delay, duration: 0.6 }}
                  className="group relative p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-default"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-sky-500/30 text-sky-400 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 tracking-tight">{feature.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-12 text-sm font-medium text-slate-400 dark:text-slate-500"
            >
              Powered by Dialoqbase • Loved by Professionals
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
