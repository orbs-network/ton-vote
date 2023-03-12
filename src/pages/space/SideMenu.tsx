import { Avatar, styled, Typography } from "@mui/material";
import { Button, Container } from "components";
import { useGetSpaceQuery } from "queries";
import React from "react";
import { useParams } from "react-router-dom";
import { StyledFlexColumn } from "styles";
import { nFormatter } from "utils";
import Socials from "./Socials";

function SideMenu() {
  const { spaceId } = useParams();

  const { data: space } = useGetSpaceQuery(spaceId);

  return (
    <StyledContainer>
      <StyledFlexColumn>
        <StyledLogo src={space?.image} />
        <StyledTitle>{space?.name}</StyledTitle>
        <Typography>{nFormatter(space?.members || 0)} members</Typography>
        <StyledJoin>Join</StyledJoin>
      </StyledFlexColumn>

      <StyledSocials github="/" twitter="/" />
    </StyledContainer>
  );
}

const StyledSocials = styled(Socials)({
  marginTop: 20,
  justifyContent: "flex-start",
});

export { SideMenu };

const StyledJoin = styled(Button)({
  minWidth: 120,
});

const StyledTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 800,
});

const StyledContainer = styled(Container)({
  position: "sticky",
  top: 90,
  width: 320,
});

const StyledLogo = styled(Avatar)({
  width: 90,
  height: 90,
});
