import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ApplicationMenu } from "./ApplicationMenu";
import api from "../services/api";

// Balance (in dollars) under which the credits pill turns amber.
export const LOW_BALANCE = 1;

export const formatBalance = (balance?: number | string | null) =>
  `$${Number(balance || 0).toFixed(2)}`;

export const balanceState = (balance?: number | string | null) => {
  const value = Number(balance || 0);
  if (value <= 0) return "empty" as const;
  if (value < LOW_BALANCE) return "low" as const;
  return "ok" as const;
};

export const BrandLink = ({ className = "" }: { className?: string }) => (
  <Link
    to="/"
    className={`flex shrink-0 items-center gap-2 rounded-lg text-[15px] font-semibold tracking-tight text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${className}`}
  >
    <img className="h-6 w-6 rounded-md object-contain" src="/logo.png" alt="" />
    Botcraft Pro
  </Link>
);

const appNav = [
  { name: "Bots", to: "/", match: (p: string) => p === "/" || p === "/new" },
  { name: "Usage", to: "/usage", match: (p: string) => p.startsWith("/usage") },
  {
    name: "Settings",
    to: "/settings",
    match: (p: string) => p.startsWith("/settings"),
  },
  {
    name: "Admin",
    to: "/admin",
    adminOnly: true,
    match: (p: string) => p.startsWith("/admin"),
  },
];

const CreditsPill = ({ balance }: { balance?: number | string | null }) => {
  const state = balanceState(balance);
  const tone =
    state === "ok"
      ? "bg-surface text-fg-muted ring-line"
      : state === "low"
      ? "bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30"
      : "bg-red-50 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/30";
  return (
    <Link
      to="/usage"
      title="Credits"
      className={`flex min-h-[32px] items-center gap-2 whitespace-nowrap rounded-full px-3 text-[13px] font-medium tabular-nums ring-1 ring-inset transition-colors hover:text-fg ${tone}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          state === "ok"
            ? "bg-green-600"
            : state === "low"
            ? "bg-amber-600"
            : "bg-red-600"
        }`}
      />
      {state === "empty" ? "Out of credits" : `${formatBalance(balance)} credits`}
    </Link>
  );
};

// Top bar shared by every signed-in page.
// mode "app": product nav + credits. mode "bot": breadcrumb into the bot.
export const AppHeader = ({
  balance,
  onOpenNav,
  mode = "app",
  botName,
  crumb,
  zIndex = "z-[999]",
}: {
  balance?: number | string | null;
  // Shows a menu button below md that opens the layout's mobile nav.
  onOpenNav?: () => void;
  mode?: "app" | "bot";
  botName?: string;
  crumb?: string;
  // Kept for older callers; the bar is always full width now.
  contained?: boolean;
  zIndex?: string;
}) => {
  const location = useLocation();
  const { data: adminInfo } = useQuery(
    ["fetchDialoqbaseUserInfo"],
    async () => {
      const response = await api.get("/user/is-admin");
      return response.data as { is_admin: boolean };
    },
    { suspense: false }
  );

  return (
    <header
      className={`sticky top-0 ${zIndex} border-b border-line bg-chrome/95 backdrop-blur`}
    >
      <div className="flex min-h-[56px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 sm:px-5">
        {onOpenNav && (
          <button
            type="button"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
            onClick={onOpenNav}
          >
            <span className="sr-only">Open menu</span>
            <Bars3BottomLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <BrandLink />

        {mode === "bot" ? (
          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-2 text-sm text-fg-subtle sm:flex"
          >
            <span aria-hidden="true">/</span>
            <Link to="/" className="text-fg-muted hover:text-fg">
              Bots
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate font-medium text-fg">
              {botName || "…"}
            </span>
            {crumb && (
              <>
                <span aria-hidden="true">/</span>
                <span className="truncate text-fg">{crumb}</span>
              </>
            )}
          </nav>
        ) : (
          <nav aria-label="Main" className="flex items-center gap-1 text-sm">
            {appNav
              .filter((item) => !item.adminOnly || adminInfo?.is_admin)
              .map((item) => {
                const active = item.match(location.pathname);
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[36px] items-center rounded-lg px-2.5 transition-colors ${
                      active
                        ? "bg-surface-2 font-medium text-fg"
                        : "text-fg-muted hover:text-fg"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
          </nav>
        )}

        <div className="flex flex-1 items-center justify-end gap-3">
          {mode === "app" && <CreditsPill balance={balance} />}
          <ApplicationMenu />
        </div>
      </div>
    </header>
  );
};
