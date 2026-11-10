import { createHashRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import DashboardLayout from "./Layout";
import NewRoot from "./routes/new/root";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BotLayout from "./Layout/BotLayout";
import BotEmbedRoot from "./routes/bot/embed";
import BotPreviewRoot from "./routes/bot/playground";
import BotDSRoot from "./routes/bot/ds";
import BotSettingsRoot from "./routes/bot/settings";
import LoginRoot from "./routes/login/root";
import { AuthProvider } from "./context/AuthContext";
import SettingsRoot from "./routes/settings/root";
import BotIntegrationRoot from "./routes/bot/integrations";
import BotAppearanceRoot from "./routes/bot/appearance";
import { ConfigProvider, theme } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import BotPlaygroundLayout from "./Layout/BotPlaygroundLayout";
import BotConversationsRoot from "./routes/bot/conversations";
import RegisterRoot from "./routes/register";
import ForgotPasswordRoot from "./routes/forgot-password";
import ResetPasswordRoot from "./routes/reset-password";
import { QueryBoundaries } from "./components/Common/QueryBoundaries";
import SettingsApplicationRoot from "./routes/settings/application";
import SettingsTeamsRoot from "./routes/settings/teams";
import BotIntegrationAPIRoot from "./routes/bot/api";
import SettingsModelRoot from "./routes/settings/model";
import { useDarkMode } from "./hooks/useDarkmode";
import BotSearchRoot from "./routes/bot/serach";
import UsageRoot from "./routes/usage/root";
import AdminRoot from "./routes/admin/root";

const router = createHashRouter([
  {
    element: (
      <DashboardLayout>
        <Root />
      </DashboardLayout>
    ),
    path: "/",
  },
  {
    element: (
      <DashboardLayout>
        <NewRoot />
      </DashboardLayout>
    ),
    path: "/new",
  },
  {
    element: (
      <DashboardLayout>
        <UsageRoot />
      </DashboardLayout>
    ),
    path: "/usage",
  },
  {
    path: "/bot/:id/embed",
    element: (
      <BotLayout>
        <BotEmbedRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id",
    element: (
      <BotLayout asideSpace="">
        <BotPreviewRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id/search",
    element: (
      <BotLayout>
        <BotSearchRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id/playground/:history_id",
    element: (
      <BotLayout asideSpace="">
        <BotPreviewRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id/conversations",
    element: (
      <BotPlaygroundLayout>
        <BotConversationsRoot />
      </BotPlaygroundLayout>
    ),
  },
  {
    path: "/bot/:id/conversations/:type/:conversation_id",
    element: (
      <BotPlaygroundLayout>
        <BotConversationsRoot />
      </BotPlaygroundLayout>
    ),
  },
  {
    path: "/bot/:id/data-sources",
    element: (
      <BotLayout>
        <BotDSRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id/settings",
    element: (
      <BotLayout>
        <BotSettingsRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id/usage",
    element: (
      <BotLayout>
        <UsageRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id/integrations",
    element: (
      <BotLayout>
        <BotIntegrationRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id/integrations/api",
    element: (
      <BotLayout>
        <BotIntegrationAPIRoot />
      </BotLayout>
    ),
  },
  {
    path: "/bot/:id/appearance",
    element: (
      <BotLayout>
        <BotAppearanceRoot />
      </BotLayout>
    ),
  },
  {
    path: "/login",
    element: <LoginRoot />,
  },
  {
    path: "/settings",
    element: (
      <DashboardLayout>
        <QueryBoundaries>
          <SettingsRoot />
        </QueryBoundaries>
      </DashboardLayout>
    ),
  },
  {
    path: "/settings/application",
    element: (
      <DashboardLayout>
        <QueryBoundaries>
          <SettingsApplicationRoot />
        </QueryBoundaries>
      </DashboardLayout>
    ),
  },
  {
    path: "/settings/teams",
    element: (
      <DashboardLayout>
        <QueryBoundaries>
          <SettingsTeamsRoot />
        </QueryBoundaries>
      </DashboardLayout>
    ),
  },
  {
  },
  {
    path: "/settings/model",
    element: (
      <DashboardLayout>
        <QueryBoundaries>
          <SettingsModelRoot />
        </QueryBoundaries>
      </DashboardLayout>
    ),
  },
  {
    path: "/admin",
    element: (
      <DashboardLayout>
        <QueryBoundaries>
          <AdminRoot />
        </QueryBoundaries>
      </DashboardLayout>
    ),
  },
  {
    path: "/admin/:tab",
    element: (
      <DashboardLayout>
        <QueryBoundaries>
          <AdminRoot />
        </QueryBoundaries>
      </DashboardLayout>
    ),
  },
  {
    path: "/register",
    element: <RegisterRoot />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordRoot />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordRoot />,
  },
]);
const queryClient = new QueryClient({});

export default function App() {
  const { mode } = useDarkMode();
  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          colorPrimary: "#4f46e5",
          colorLink: "#4f46e5",
          borderRadius: 8,
          borderRadiusLG: 14,
          controlHeight: 36,
          boxShadowSecondary:
            "0 2px 4px rgb(16 16 24 / 0.04), 0 16px 40px -16px rgb(16 16 24 / 0.28)",
          ...(mode === "dark"
            ? {
                colorBgBase: "#161619",
                colorBgLayout: "#0f0f11",
                colorBgContainer: "#1c1c20",
                colorBgElevated: "#232328",
                colorBorder: "#37373f",
                colorBorderSecondary: "#27272d",
                colorFillAlter: "#1f1f23",
              }
            : {
                colorBgLayout: "#f8f8fa",
                colorBorder: "#dadae2",
                colorBorderSecondary: "#e9e9ee",
                colorFillAlter: "#f7f7f9",
              }),
        },
        components: {
          Button: {
            fontWeight: 500,
            primaryShadow: "none",
            defaultShadow: "none",
          },
          Input: {
            activeShadow: "0 0 0 4px rgb(79 70 229 / 0.12)",
          },
          InputNumber: {
            activeShadow: "0 0 0 4px rgb(79 70 229 / 0.12)",
          },
          Select: {
            optionSelectedBg:
              mode === "dark" ? "rgb(99 102 241 / 0.16)" : "#eef2ff",
          },
          Card: {
            headerFontSize: 15,
          },
          Modal: {
            borderRadiusLG: 16,
            titleFontSize: 17,
          },
          Table: {
            headerBg: mode === "dark" ? "#1f1f23" : "#f7f7f9",
            headerColor: mode === "dark" ? "#a8a8b2" : "#52525b",
            headerSplitColor: "transparent",
            rowHoverBg: mode === "dark" ? "#222227" : "#fafafb",
            borderColor: mode === "dark" ? "#27272d" : "#ececf1",
          },
          Tabs: {
            itemSelectedColor: mode === "dark" ? "#a5b4fc" : "#4338ca",
            inkBarColor: "#4f46e5",
            titleFontSize: 14,
          },
          Segmented: {
            itemSelectedBg: mode === "dark" ? "#2e2e34" : "#ffffff",
          },
        },
      }}
    >
      <StyleProvider hashPriority="high">
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </AuthProvider>
      </StyleProvider>
    </ConfigProvider>
  );
}
