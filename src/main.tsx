import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { theme } from "theme";
import { globalStyles } from "styles";
import { SnackbarProvider } from "notistack";
import analytics from "analytics";
import App from "App";
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
      <SnackbarProvider
        maxSnack={3}
        classes={{
          variantSuccess: "snackbar-success",
          variantError: "snackbar-error",
        }}
      >
        <App />
      </SnackbarProvider>
    </ThemeProvider>

    <ReactQueryDevtools />
  </QueryClientProvider>
);
