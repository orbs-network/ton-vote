import { styled, Typography } from "@mui/material";
import { Button, Container } from "components";
import Layout from "layout/Layout";
import React from "react";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn } from "styles";

export function BadRoute() {
  const navigate = useAppNavigation();
  return (
    <Layout>
      <StyledContainer>
        <StyledFlexColumn gap={20}>
          <Typography className="title">Page doesn't exist</Typography>
          <Button onClick={() => navigate.daosPage.root()}>
            <Typography>Go Home</Typography>
          </Button>
        </StyledFlexColumn>
      </StyledContainer>
    </Layout>
  );
}

export default BadRoute;

const StyledContainer = styled(Container)({
  width: "100%",
  maxWidth: 500,
  ".title": {
    fontSize: 20,
    fontWeight: 600,
  },
  button: {
    width: "70%",
  },
});
