import { Fade, styled } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { StyledFlexColumn, StyledGrid } from "styles";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorBoundary";
import { Toolbar } from "./Toolbar";
import { ReactNode, useEffect } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { MOBILE_WIDTH } from "consts";
import {
  useAppQueryParams,
  useAppSettings,
  useCurrentRoute,
  useDevFeaturesMode,
} from "hooks/hooks";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Webapp, WebappConnectWalletButton } from "WebApp";
import { DEV_ROUTES } from "config";

const useIsBeta = () => {
  const {
    query: { dev },
  } = useAppQueryParams();
  const setBeta = useAppSettings().setBeta;

  useEffect(() => {
    if (dev) {
      setBeta(true);
    }
  }, [dev, setBeta]);
};

 const useHandleDevRoutes = () => {
  const route = useCurrentRoute();
  const navigate = useNavigate();
  const devMode = useDevFeaturesMode();

  useEffect(() => {
    if (route && DEV_ROUTES.includes(route) && !devMode) {
      navigate("/");
    }
  }, [route, devMode]);
};

function Layout({ children }: { children?: ReactNode }) {
  useIsBeta();
  useHandleDevRoutes();
  return (
    <>
      <StyledContainer>
        <WebappConnectWalletButton />
        <Toolbar />
        <Navbar />
        <ErrorBoundary fallbackRender={(props) => <ErrorFallback {...props} />}>
          <StyledContent>
            {children}
            <Outlet />
          </StyledContent>
          <Footer />
        </ErrorBoundary>
      </StyledContainer>
      <Toaster
        toastOptions={{
          className: "toast",
        }}
      />
    </>
  );
}

const Wrapped = ({ children }: { children?: ReactNode }) => {
  return (
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <Layout>{children}</Layout>
      <ReactQueryDevtools />
    </QueryParamProvider>
  );
};

const StyledContent = styled(StyledGrid)({
  paddingTop: Webapp.isEnabled ? 20 : 90,
  flex: 1,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    paddingTop: Webapp.isEnabled ? 20 : 80,
  },
});

const StyledContainer = styled(StyledFlexColumn)({
  gap: 0,
  display: "flex",
  flex:1
});

export default Wrapped;
