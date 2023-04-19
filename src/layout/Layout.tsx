import { Fade, styled } from "@mui/material";
import {  TxReminderPopup } from "../components";
import { Outlet } from "react-router-dom";
import { StyledFlexColumn, StyledGrid } from "styles";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import ScrollTop from "components/ScrollTop";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "./ErrorBoundary";
import { Toolbar } from "./Toolbar";
import { ReactNode, Suspense } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

function Layout({children}:{children?: ReactNode}) {
  return (
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <Fade in={true} timeout={500}>
        <StyledContainer>
          <Toolbar />
          <Navbar />
          <ErrorBoundary
            fallbackRender={(props) => <ErrorFallback {...props} />}
          >
            <StyledContent>
              {children}
              <Suspense>
                <Outlet />
              </Suspense>
            </StyledContent>
            <Footer />
          </ErrorBoundary>
        </StyledContainer>
      </Fade>
      <ScrollTop />
      <Toaster />
      <TxReminderPopup />
    </QueryParamProvider>
  );
}

const StyledContent = styled(StyledGrid)({
  paddingTop: 90,
  flex: 1,
});

const StyledContainer = styled(StyledFlexColumn)({
  minHeight: "100vh",
  gap: 0,
  display: "flex",
});

export default Layout;
