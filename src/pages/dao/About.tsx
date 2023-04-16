import { styled, Typography } from "@mui/material";
import { Container, Link } from "components";
import { useDaoAddress } from "hooks";
import {  useDaoQuery } from "query/queries";
import React from "react";
import { StyledContainer, StyledFlexColumn, StyledFlexRow, StyledTitle, textOverflow } from "styles";
import { getTonScanContractUrl } from "utils";

export function About() {
  const daoAddress = useDaoAddress();
  const roles = useDaoQuery(daoAddress).data?.daoRoles;

  return (
    <StyledFlexColumn gap={20} alignItems='flex-start'>
      <StyledTitle>About</StyledTitle>
      <StyledContainer>
        <StyledFlexColumn gap={20}>
          <StyledSection>
            <Typography>Dao Owner:</Typography>
            {roles && (
              <StyledLink href={getTonScanContractUrl(roles.owner)}>
                {roles.owner}
              </StyledLink>
            )}
          </StyledSection>
          <StyledSection>
            <Typography>Proposal Owner:</Typography>
            {roles && (
              <StyledLink href={getTonScanContractUrl(roles?.proposalOwner)}>
                {roles?.proposalOwner}
              </StyledLink>
            )}
          </StyledSection>
        </StyledFlexColumn>
      </StyledContainer>
    </StyledFlexColumn>
  );
}

const StyledSection = styled(StyledFlexRow)({
  gap: 30,
  justifyContent: "flex-start",
});

const StyledLink = styled(Link)({
  width: 300,
  ...textOverflow,
});
