import { GlobalStyles, ThemeProvider } from "@mui/material";
import { APP_NAME } from "config";
import { useAppSettings } from "hooks";
import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { RouterProvider } from "react-router-dom";
import { router } from "router/router";
import { getGlobalStyles } from "styles";
import { darkTheme, lightTheme, useInitThemeMode } from "theme";


function App() {
  useInitThemeMode();
  const { isDarkMode } = useAppSettings();

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
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  );
}

export default App;
