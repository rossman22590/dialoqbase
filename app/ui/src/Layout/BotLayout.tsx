import React, { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  SparklesIcon,
  SwatchIcon,
  Squares2X2Icon,
  WindowIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { AppHeader, balanceState, formatBalance, BrandLink } from "./AppHeader";
import { CreditsBanner } from "./index";
import { useSettings } from "../hooks/useSettings";
import { OnboardingModal } from "../components/Common/OnboardingModal";
import api from "../services/api";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  key: string;
  beta?: boolean;
};

export const botNavigation: { group: string; items: NavItem[] }[] = [
  {
    group: "Build",
    items: [
      { name: "Playground", href: "/bot/:id", icon: SparklesIcon, key: "playground" },
      { name: "Data sources", href: "/bot/:id/data-sources", icon: CircleStackIcon, key: "data-sources" },
      { name: "Settings", href: "/bot/:id/settings", icon: Cog6ToothIcon, key: "settings" },
      { name: "Appearance", href: "/bot/:id/appearance", icon: SwatchIcon, key: "appearance" },
    ],
  },
  {
    group: "Deploy",
    items: [
      { name: "Integrations", href: "/bot/:id/integrations", icon: Squares2X2Icon, key: "integrations" },
      { name: "Embed on a site", href: "/bot/:id/embed", icon: WindowIcon, key: "embed" },
      { name: "API", href: "/bot/:id/integrations/api", icon: CodeBracketIcon, key: "api" },
    ],
  },
  {
    group: "Monitor",
    items: [
      { name: "Conversations", href: "/bot/:id/conversations", icon: ChatBubbleLeftRightIcon, key: "conversations" },
      { name: "Usage", href: "/bot/:id/usage", icon: ChartBarIcon, key: "usage" },
      { name: "Search", href: "/bot/:id/search", icon: MagnifyingGlassIcon, key: "search", beta: true },
    ],
  },
];

const allItems = botNavigation.flatMap((g) => g.items);

// The nav item for a path: the longest href that matches, so
// /integrations/api picks "API" over "Integrations".
export const activeBotNavItem = (pathname: string, id: string) => {
  let best: NavItem | undefined;
  let bestLen = -1;
  for (const item of allItems) {
    const path = item.href.replace(":id", id);
    const matches =
      pathname === path ||
      pathname.startsWith(`${path}/`) ||
      (item.key === "playground" &&
        pathname.startsWith(`/bot/${id}/playground/`));
    if (!matches) continue;
    // Playground's href is the bot root, which every page starts with.
    const len = item.key === "playground" && pathname !== path && !pathname.startsWith(`/bot/${id}/playground/`) ? -1 : path.length;
    if (len > bestLen) {
      best = item;
      bestLen = len;
    }
  }
  return best;
};

const BOT_COLORS = [
  "#0F766E",
  "#4F46E5",
  "#1D4ED8",
  "#C2410C",
  "#BE185D",
  "#7E22CE",
  "#4D7C0F",
  "#334155",
];

export const botColor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return BOT_COLORS[h % BOT_COLORS.length];
};

export const BotAvatarTile = ({
  name,
  id,
  size = 28,
}: {
  name?: string;
  id?: string;
  size?: number;
}) => (
  <span
    aria-hidden="true"
    className="flex shrink-0 items-center justify-center font-semibold text-white"
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size / 4),
      fontSize: Math.round(size * 0.45),
      background: botColor(id || name || "?"),
    }}
  >
    {String(name || "?").trim().charAt(0).toUpperCase() || "?"}
  </span>
);

const cleanModel = (model?: string) =>
  (model || "")
    .replace("-dbase", "")
    .replace(/_dialoqbase_[0-9]+$/, "")
    .replace(/^[^/]+\//, "");

const BotSwitcher = ({
  bots,
  current,
  sectionKey,
}: {
  bots: any[];
  current?: any;
  sectionKey?: string;
}) => {
  const navigate = useNavigate();
  const go = (id: string) => {
    const item = allItems.find((i) => i.key === sectionKey);
    navigate((item?.href || "/bot/:id").replace(":id", id));
  };
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex w-full items-center gap-2.5 rounded-[10px] border border-line bg-surface p-2 text-left transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
        <BotAvatarTile name={current?.name} id={current?.id} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-fg">
            {current?.name || "Loading…"}
          </span>
          <span className="block truncate text-xs text-fg-subtle">
            {cleanModel(current?.model)}
          </span>
        </span>
        <ChevronUpDownIcon className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />
        <span className="sr-only">Switch bot</span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 right-0 z-[1100] mt-1 max-h-72 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-float focus:outline-none">
          {bots.map((bot) => (
            <Menu.Item key={bot.id}>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => go(bot.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm ${
                    active ? "bg-surface-2" : ""
                  }`}
                >
                  <BotAvatarTile name={bot.name} id={bot.id} size={22} />
                  <span className="min-w-0 flex-1 truncate text-fg">{bot.name}</span>
                  {bot.id === current?.id && (
                    <CheckIcon className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
          <div className="my-1 border-t border-line" />
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/new"
                className={`flex w-full items-center rounded-lg px-2 py-2 text-sm text-indigo-700 dark:text-indigo-300 ${
                  active ? "bg-surface-2" : ""
                }`}
              >
                New bot
              </Link>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const SidebarCredits = ({ balance }: { balance?: number | string | null }) => {
  const state = balanceState(balance);
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-line bg-surface p-3">
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-fg-muted">Credits</span>
        <span
          className={`font-semibold tabular-nums ${
            state === "empty"
              ? "text-red-700 dark:text-red-400"
              : state === "low"
              ? "text-amber-700 dark:text-amber-400"
              : "text-fg"
          }`}
        >
          {formatBalance(balance)}
        </span>
      </div>
      {state !== "ok" && (
        <p className="text-xs text-fg-muted">
          {state === "empty"
            ? "Your bots have stopped answering."
            : "Running low. Bots stop at $0."}
        </p>
      )}
      <Link
        to="/usage"
        className="text-[13px] font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300"
      >
        Add credits
      </Link>
    </div>
  );
};

const BotSidebar = ({
  id,
  pathname,
  bots,
  current,
  balance,
  showSearch,
}: {
  id: string;
  pathname: string;
  bots: any[];
  current?: any;
  balance?: number | string | null;
  showSearch: boolean;
}) => {
  const active = activeBotNavItem(pathname, id);
  return (
    <nav aria-label="Bot" className="flex min-h-full flex-col gap-5 px-3 py-4">
      <Link
        to="/"
        className="flex items-center gap-1.5 px-2 text-[13px] text-fg-muted hover:text-fg"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
        All bots
      </Link>
      <BotSwitcher bots={bots} current={current} sectionKey={active?.key} />

      {botNavigation.map((group) => (
        <div key={group.group} className="flex flex-col gap-0.5">
          <p className="ui-eyebrow mb-1">{group.group}</p>
          {group.items
            .filter((item) => item.key !== "search" || showSearch)
            .map((item) => {
              const isActive = active?.key === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.href.replace(":id", id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-[40px] items-center gap-2.5 rounded-lg px-2 text-sm transition-colors ${
                    isActive
                      ? "bg-surface font-medium text-indigo-700 shadow-[0_0_0_1px_rgb(var(--c-line))] dark:text-indigo-300"
                      : "text-fg-muted hover:bg-surface-2 hover:text-fg"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.name}
                  {item.beta && (
                    <span className="ml-auto rounded-full border border-line px-1.5 text-[11px] text-fg-muted">
                      Beta
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      ))}

      <div className="mt-auto">
        <SidebarCredits balance={balance} />
      </div>
    </nav>
  );
};

export default function BotLayout({
  children,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
  // Kept for older callers; the sidebar no longer overlaps the page.
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
    { enabled: isLogged, refetchOnWindowFocus: true }
  );

  const { data: bots } = useQuery(
    ["getAllBots"],
    async () => {
      const response = await api.get("/bot");
      return response.data;
    },
    { enabled: isLogged }
  );

  React.useEffect(() => {
    if (!isLogged) {
      navigate("/login");
    }
  }, [isLogged]);

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const id = params.id!;
  const botList: any[] = Array.isArray(bots) ? bots : [];
  const current = botList.find((b) => b.id === id);
  const active = activeBotNavItem(location.pathname, id);
  const showSearch = !!settings?.data?.internalSearchEnabled;

  const sidebar = (
    <BotSidebar
      id={id}
      pathname={location.pathname}
      bots={botList}
      current={current}
      balance={creditData?.balance}
      showSearch={showSearch}
    />
  );

  return (
    <>
      <OnboardingModal />
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[1002] md:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-200 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-[280px] flex-col overflow-y-auto border-r border-line bg-sidebar">
                <div className="flex items-center justify-between px-4 pt-4">
                  <BrandLink />
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                {sidebar}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="flex min-h-full flex-col bg-canvas">
        <AppHeader
          mode="bot"
          balance={creditData?.balance}
          botName={current?.name}
          crumb={active?.name}
          onOpenNav={() => setSidebarOpen(true)}
        />
        <CreditsBanner balance={creditData?.balance} />
        <div className="flex flex-1">
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-line bg-sidebar md:block">
            {sidebar}
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
