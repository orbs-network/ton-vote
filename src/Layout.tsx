import { Box, Fade, styled, Typography } from "@mui/material";
import { Button, Container, Footer, Navbar, TxReminderPopup } from "./components";
import { Outlet } from "react-router-dom";
import { StyledFlexColumn, StyledGrid } from "styles";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import ScrollTop from "components/ScrollTop";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useAppNavigation } from "router";

function Layout() {
  return (
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <Fade in={true} timeout={500}>
        <StyledContainer>
          <Navbar />
          <ErrorBoundary
            fallbackRender={(props) => <ErrorFallback {...props} />}
          >
            <StyledContent>
              <Outlet />
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


const ErrorFallback = (props: FallbackProps) => {
  const appNavigation = useAppNavigation()
  const reset = () => {
    appNavigation.daosPage.root();
    props.resetErrorBoundary();
  };
  return (
    <StyledErrorContainer>
      <StyledErrorContent>
        <StyledFlexColumn alignItems="center" gap={30}>
          <Typography className="text">Something went wrong</Typography>
          <Button onClick={reset}>Home</Button>
        </StyledFlexColumn>
      </StyledErrorContent>
    </StyledErrorContainer>
  );
};



const StyledErrorContent = styled(Container)({
  maxWidth: 400,
  ".text":{
    fontSize: 18
  },
  button: {
    width:130,
  }
})

const StyledErrorContainer = styled(StyledFlexColumn)({
})

const StyledContent = styled(StyledGrid)({
  paddingTop: 90,
  flex: 1
});

const StyledContainer = styled(StyledFlexColumn)({
  minHeight: "100vh",
  gap: 0
});

export default Layout;
