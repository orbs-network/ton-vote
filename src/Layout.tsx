import { styled } from "@mui/material";
import { Back, Footer, Navbar } from "components";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { StyledGrid } from "styles";

function Layout() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <StyledContainer>
        <Outlet />
      </StyledContainer>
      <Footer />
    </>
  );
}

export { Layout };

const StyledContainer = styled(StyledGrid)({
  display: "flex",
  flexDirection: "column",
  paddingTop: 90,
  minHeight: "100vh",
});
