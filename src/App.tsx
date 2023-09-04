import { GlobalStyles, ThemeProvider } from "@mui/material";
import { APP_NAME } from "config";
import { useAppSettings } from "hooks/hooks";
import { Suspense, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { RouterProvider } from "react-router-dom";
import { getGlobalStyles } from "styles";
import { useRouter } from "router/router";
import "styles";
import { darkTheme, lightTheme, useInitThemeMode } from "theme";
import twa from '@twa-dev/sdk'
import { isTwa } from "consts";


const useInitApp = () => {
  useInitThemeMode();
};

function App() {
  useInitApp();

  useEffect(() => {
    const loader = document.querySelector(".app-loader");
    if (loader) {
      loader.classList.add("app-loader-hidden");
      setTimeout(() => {
        loader.classList.add("app-loader-none");
      }, 300);
    }
  }, []);

  const { isDarkMode } = useAppSettings();
  const router = useRouter();

  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  const { setThemeMode } = useAppSettings();

  useEffect(() => {
    if (!isTwa) {
      return
    }

    twa.ready();
    twa.expand();
  }, [isTwa])

  useEffect(() => {
    if (!isTwa) {
      return
    }

    setThemeMode(twa.colorScheme)
  }, [isTwa, twa.colorScheme])


  useEffect(() => {
    if (!isTwa) {
      return
    }

    twa.MainButton.setParams({
      color: theme.palette.primary.main,
    })
  }, [isTwa, theme.palette.primary.main])


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
