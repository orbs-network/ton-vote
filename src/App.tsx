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
import { setupIonicReact } from "@ionic/react";
import { IonButton, IonApp } from "@ionic/react";
import { isTwaApp } from "consts";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import _ from "lodash";




const useInitApp = () => {
  useInitThemeMode();
};
setupIonicReact();

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

  const content = (
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

  return isTwaApp ? <IonApp>{content}</IonApp> : content;
}

export default App;


