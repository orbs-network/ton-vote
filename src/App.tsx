import { GlobalStyles, ThemeProvider } from "@mui/material";
import { APP_NAME } from "config";
import { useAppSettings } from "hooks";
import { Suspense, useMemo } from "react";
import { Helmet } from "react-helmet";
import { RouterProvider } from "react-router-dom";
import { useRouter } from "router/router";
import { getGlobalStyles } from "styles";
import { darkTheme, lightTheme, useInitThemeMode } from "theme";

const useInitApp = () => {
  useInitThemeMode();
};

function App() {
  useInitApp();
  const { isDarkMode } = useAppSettings();
  const router = useRouter();

  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <>
      <Helmet>
        <title>{APP_NAME}</title>
      </Helmet>
      <ThemeProvider theme={theme}>
        <GlobalStyles styles={getGlobalStyles(theme)} />
        <Suspense>
          <RouterProvider router={router} />
        </Suspense>
      </ThemeProvider>
    </>
  );
}

export default App;
