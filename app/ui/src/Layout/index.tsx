import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { OnboardingModal } from "../components/Common/OnboardingModal";
import { AppHeader } from "./AppHeader";

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

  const { data: creditData } = useQuery(["getUserCredits"], async () => {
    const response = await api.get("/user/credits");
    return response.data;
  }, {
    enabled: isLogged,
    refetchOnWindowFocus: true
  });

  return (
    <>
      <OnboardingModal />
      <div className="min-h-full">
        <AppHeader balance={creditData?.balance} contained />
        <main>{children}</main>
      </div>
    </>
  );
}
