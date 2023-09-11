import { GlobalStyles, styled, ThemeProvider } from "@mui/material";
import { APP_NAME } from "config";
import { useAppSettings } from "hooks/hooks";
import { Suspense, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { RouterProvider } from "react-router-dom";
import { getGlobalStyles, StyledFlexColumn } from "styles";
import "styles";
import { darkTheme, lightTheme, useInitThemeMode } from "theme";
import { useWalletListener } from "analytics";
import { Webapp } from "WebApp";
import { router } from "router";

Webapp.init();

const useInitApp = () => {
  useInitThemeMode();
  useWalletListener();
  useEffect(() => {
    const loader = document.querySelector(".app-loader");
    if (loader) {
      loader.classList.add("app-loader-hidden");
      setTimeout(() => {
        loader.classList.add("app-loader-none");
      }, 300);
    }
  }, []);
};

const useTheme = () => {
  const { isDarkMode } = useAppSettings();
  return useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);
};

function App() {
  useInitApp();
  const theme = useTheme();

  return (
    <StyledApp>
      <Helmet>
        <title>{APP_NAME}</title>
      </Helmet>
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={getGlobalStyles(theme)} />
        <Suspense>
          <RouterProvider router={router} />
        </Suspense>
      </ThemeProvider>
    </StyledApp>
  );
}

export default App;

const StyledApp = styled(StyledFlexColumn)({
  minHeight: "100dvh",
});
