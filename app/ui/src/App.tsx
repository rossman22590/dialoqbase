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
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          colorPrimary: "#7c3aed",
          borderRadius: 8,
          ...(mode === "dark"
            ? {
                colorBgBase: "#161619",
                colorBgContainer: "#1c1c20",
                colorBgElevated: "#232328",
                colorBorder: "#37373f",
                colorBorderSecondary: "#27272d",
              }
            : {
                colorBorder: "#dadae2",
                colorBorderSecondary: "#e9e9ee",
              }),
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
