import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  CircleStackIcon,
  CogIcon,
  SparklesIcon,
  PuzzlePieceIcon,
  EyeDropperIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { Tooltip } from "antd";
import { ApplicationMenu } from "./ApplicationMenu";
import { useSettings } from "../hooks/useSettings";
import api from "../services/api";
import { OnboardingModal } from "../components/Common/OnboardingModal";

const navigation = [
  {
    name: "Playground",
    href: "/bot/:id",
    icon: SparklesIcon,
    key: "playground",
  },
  {
    name: "Data Sources",
    href: "/bot/:id/data-sources",
    icon: CircleStackIcon,
    key: "data-sources",
  },
  {
    name: "Search (Beta)",
    href: "/bot/:id/search",
    icon: MagnifyingGlassIcon,
    key: "search",
  },
  {
    name: "Integrations",
    href: "/bot/:id/integrations",
    icon: PuzzlePieceIcon,
    key: "integrations",
  },
  {
    name: "Conversations",
    href: "/bot/:id/conversations",
    icon: ChatBubbleLeftRightIcon,
    key: "conversations",
  },
  {
    name: "Appearance",
    href: "/bot/:id/appearance",
    icon: EyeDropperIcon,
    key: "appearance",
  },
  {
    name: "Settings",
    href: "/bot/:id/settings",
    icon: CogIcon,
    key: "settings",
  },
  {
    name: "Usage",
    href: "/bot/:id/usage",
    icon: ChartBarIcon,
    key: "usage",
  },
];

//@ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function BotLayout({
  children,
  asideSpace = "md:ml-16",
}: {
  children: React.ReactNode;
  noPadding?: boolean;
  asideSpace?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { isLogged } = useAuth();

  const settings = useSettings();

  const { data: creditData } = useQuery(
    ["getUserCredits"],
    async () => {
      const response = await api.get("/user/credits");
      return response.data;
    },
    {
      enabled: isLogged,
      refetchOnWindowFocus: true,
    }
  );

  React.useEffect(() => {
    if (!isLogged) {
      navigate("/login");
    }
  }, [isLogged]);

  const isActive = (href: string) => {
    const path = href.replace(":id", params.id!);
    if (location.pathname === path) return true;
    // Saved playground chats live under /bot/:id/playground/:history_id.
    return (
      href === "/bot/:id" &&
      location.pathname.startsWith(`/bot/${params.id}/playground/`)
    );
  };

  return (
    <>
      <OnboardingModal />
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 md:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4 dark:bg-[#171717]">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <Link
                    to="/"
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-700 flex items-center px-3"
                  >
                    <img
                      className="h-8 w-auto"
                      src="/logo.png"
                      alt="Botcraft Pro"
                    />
                    <span className="ml-1 text-xl font-bold">Botcraft Pro</span>
                    <span className="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 ml-2">
                      {/* @ts-ignore */}
                      {`v${__APP_VERSION__}`}
                    </span>
                  </Link>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="space-y-1 px-2">
                      {navigation.map((item) => {
                        if (
                          item.key === "search" &&
                          !settings?.data?.internalSearchEnabled
                        ) {
                          return null;
                        }
                        return (
                          <Link
                            key={item.name}
                            to={{
                              pathname: item.href.replace(":id", params.id!),
                            }}
                            className={classNames(
                              isActive(item.href)
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-100"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white dark:hover:bg-[#262626]",
                              "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                            )}
                          >
                            <item.icon
                              className={classNames(
                                isActive(item.href)
                                  ? "text-indigo-600 dark:text-indigo-300"
                                  : "text-gray-400 group-hover:text-gray-500",
                                "mr-4 flex-shrink-0 h-6 w-6"
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="flex flex-col">
          <header className="sticky top-0 z-[999] flex h-14 border-b border-line bg-chrome/80 backdrop-blur-xl backdrop-saturate-150">
            <button
              type="button"
              className="border-r border-line px-4 text-fg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <Link
              to="/"
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex shrink-0 items-center px-3 text-fg"
            >
              <img className="h-8 w-auto" src="/logo.png" alt="Botcraft Pro" />
              <span className="ml-1 whitespace-nowrap text-lg font-semibold tracking-tight sm:text-xl">
                Botcraft Pro
              </span>
              <span className="ml-2 hidden flex-shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20 sm:inline-block">
                {/* @ts-ignore */}
                {`v${__APP_VERSION__}`}
              </span>
            </Link>
            <div className="flex min-w-0 flex-1 justify-end px-3 sm:px-4">
              <div className="ml-2 flex items-center md:ml-6">
                <div
                  title="Credits"
                  className="mr-2 whitespace-nowrap rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium tabular-nums text-fg-muted shadow-soft sm:mr-4"
                >
                  <span className="hidden sm:inline">Credits: </span>$
                  {Number(creditData?.balance || 0).toFixed(4)}
                </div>
                <ApplicationMenu />
              </div>
            </div>
          </header>
          <div className="flex flex-1">
            <aside className="hidden md:flex md:flex-col md:w-16 md:fixed md:inset-y-0">
              <div className="flex flex-grow flex-col overflow-y-auto border-r border-line bg-chrome pt-5">
                <div className="mt-14 flex flex-grow flex-col">
                  <nav className="flex-1 space-y-1.5 px-2.5 pb-4">
                    {navigation.map((item) => {
                      if (
                        item.key === "search" &&
                        !settings.data?.internalSearchEnabled
                      ) {
                        return null;
                      }

                      return (
                        <Tooltip
                          placement="right"
                          key={item.name}
                          title={item.name}
                          mouseEnterDelay={0.05}
                        >
                          <Link
                            to={{
                              pathname: item.href.replace(":id", params.id!),
                            }}
                            aria-label={item.name}
                            aria-current={
                              isActive(item.href) ? "page" : undefined
                            }
                            className={classNames(
                              isActive(item.href)
                                ? "bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-200/70 dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-400/20"
                                : "text-fg-subtle hover:bg-surface-2 hover:text-fg",
                              "group flex h-10 items-center justify-center rounded-xl transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            )}
                          >
                            <item.icon
                              className="flex-shrink-0 h-5 w-5"
                              aria-hidden="true"
                            />
                          </Link>
                        </Tooltip>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </aside>
            <main className={`flex-1 ${asideSpace}`}>{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
