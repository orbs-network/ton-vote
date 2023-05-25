import { GlobalStyles, ThemeProvider } from '@mui/material';
import { THEME, TonConnectUIProvider } from '@tonconnect/ui-react';
import { APP_NAME, manifestUrl } from 'config';
import { useAppSettings } from 'hooks';
import { Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { RouterProvider } from 'react-router-dom';
import { router } from 'router/router';
import { getGlobalStyles } from 'styles';
import { darkTheme, lightTheme, useInitThemeMode } from 'theme';


function App() {  
  useInitThemeMode();
 const { isDarkMode } = useAppSettings();

  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );;
  
  return (
  
      <ThemeProvider theme={theme}>
        <Suspense>
          <GlobalStyles styles={getGlobalStyles(theme)} />
          <Helmet>
            <title>{APP_NAME}</title>
          </Helmet>
          <RouterProvider router={router} />
        </Suspense>
      </ThemeProvider>
  );
}

export default App


