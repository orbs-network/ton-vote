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
import { useWalletListener } from "analytics";



const useInitApp = () => {
  useInitThemeMode();
};


function App() { 
  useInitApp();
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
