import { GlobalStyles, ThemeProvider } from '@mui/material';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import { APP_NAME, manifestUrl } from 'config';
import { Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { RouterProvider } from 'react-router-dom';
import { router } from 'router/router';
import { useSettingsStore } from 'store';
import { getGlobalStyles } from 'styles';
import { darkTheme, lightTheme, useInitThemeMode } from 'theme';


function App() {  
  useInitThemeMode();
 const { themeMode } = useSettingsStore();

  const theme = useMemo(
    () => (themeMode === 'dark' ? darkTheme : lightTheme),
    [themeMode]
  );

  console.log(themeMode);
  
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      uiPreferences={{ theme: themeMode === "dark" ? THEME.DARK : THEME.LIGHT }}
    >
      <ThemeProvider theme={theme}>
        <Suspense>
          <GlobalStyles styles={getGlobalStyles(theme)} />
          <Helmet>
            <title>{APP_NAME}</title>
          </Helmet>
          <RouterProvider router={router} />
        </Suspense>
      </ThemeProvider>
    </TonConnectUIProvider>
  );
}

export default App


