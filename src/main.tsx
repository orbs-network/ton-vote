import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CssBaseline, GlobalStyles } from "@mui/material";
import App from "./App";
import { ThemeProvider } from "@mui/material";
import { theme } from "theme";
import { globalStyles } from "styles";
import { SnackbarProvider } from "notistack";
import analytics from "analytics";
analytics.GA.init();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      cacheTime: Infinity,
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
