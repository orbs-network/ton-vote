import { Fade, styled } from "@mui/material";
import { Outlet } from "react-router-dom";
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
import { useAppQueryParams, useAppSettings } from "hooks/hooks";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MainButton } from "@twa-dev/sdk/react";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Webapp } from "WebApp";


const TWAConnect = () => {
  const [tonConnect] = useTonConnectUI()
  const tonAddress = useTonAddress();
  if (tonAddress) return null;
    return (
      <MainButton
        text="Connect wallet"
        onClick={() => tonConnect.connectWallet()}
      />
    );
}

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

function Layout({ children }: { children?: ReactNode }) {
  useIsBeta();

  return (
    <>
      <TWAConnect />
      <StyledContainer>
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
  minHeight: "100vh",
  gap: 0,
  display: "flex",
});

export default Wrapped;
