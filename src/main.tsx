import ReactDOM from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CssBaseline } from "@mui/material";
import "./i18n/index";
import App from "App";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { manifestUrl } from "config";
import { clearAllToasts } from "toasts";
import { useSettingsStore } from "store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
    mutations: {
      onMutate: () => clearAllToasts(),
    },
  },
});
const defaultTheme =
  useSettingsStore.getState().themeMode === "dark" ? THEME.DARK : THEME.LIGHT;
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <CssBaseline />

    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{
        theme: defaultTheme,
      }}
    >
      <App />
    </TonConnectUIProvider>

    <ReactQueryDevtools />
  </QueryClientProvider>
);
