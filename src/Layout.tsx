import { styled } from "@mui/material";
import { Back, Footer, Navbar } from "components";
import { Outlet } from "react-router-dom";
import { StyledGrid } from "styles";


function Layout() {

  return (
    <>
      <Navbar />
      <StyledContainer>
        <Back />
        <Outlet />
        <Footer />
      </StyledContainer>
    </>
  );
}

export { Layout };

const StyledContainer = styled(StyledGrid)({
  display: "flex",
  flexDirection: "column",
  flex: 1,
});
