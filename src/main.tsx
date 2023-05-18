import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { theme } from "theme";
import { globalStyles } from "styles";
import analytics from "analytics";
import './i18n/index'
import App from "App";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { manifestUrl } from "config";

analytics.GA.init();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <TonConnectUIProvider
        manifestUrl={manifestUrl}
      >
        <App />
      </TonConnectUIProvider>
    </ThemeProvider>

    <ReactQueryDevtools />
  </QueryClientProvider>
);
