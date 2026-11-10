import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { OnboardingModal } from "../components/Common/OnboardingModal";
import { AppHeader, balanceState, formatBalance } from "./AppHeader";

// Banner shown under the top bar when credits are low or gone, since bots
// stop answering at 0.
export const CreditsBanner = ({
  balance,
}: {
  balance?: number | string | null;
}) => {
  const state = balanceState(balance);
  if (balance === undefined || balance === null || state === "ok") return null;
  const empty = state === "empty";
  return (
    <div
      role="status"
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-2.5 text-sm sm:px-6 ${
        empty
          ? "border-red-200 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
          : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
      }`}
    >
      <ExclamationTriangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-[240px] flex-1">
        {empty ? (
          <>
            <strong className="font-semibold">You're out of credits.</strong>{" "}
            Your bots have stopped answering.
          </>
        ) : (
          <>
            <strong className="font-semibold">
              {formatBalance(balance)} credits left.
            </strong>{" "}
            Your bots stop answering when you reach $0.
          </>
        )}
      </span>
      <Link to="/usage" className="font-semibold underline-offset-2 hover:underline">
        Add credits
      </Link>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const { isLogged } = useAuth();

  React.useEffect(() => {
    if (!isLogged) {
      navigate("/login");
    }
  }, [isLogged]);

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

  return (
    <>
      <OnboardingModal />
      <div className="min-h-full bg-app">
        <AppHeader balance={creditData?.balance} />
        <CreditsBanner balance={creditData?.balance} />
        <main>{children}</main>
      </div>
    </>
  );
}
