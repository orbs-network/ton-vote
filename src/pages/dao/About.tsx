import { Chip, styled, Typography } from "@mui/material";
import { Header, Link, TitleContainer } from "components";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import {
  StyledContainer,
  StyledFlexColumn,
  StyledFlexRow,
  textOverflow,
} from "styles";
import { getTonScanContractUrl, makeElipsisAddress } from "utils";

export function About() {
  const daoAddress = useDaoAddress();
  const roles = useDaoQuery(daoAddress).data?.daoRoles;

  return (
    <StyledFlexColumn gap={0} alignItems="flex-start">
      <Header title="About" />
      <StyledTitleContainer
        title="Administrators"
        headerComponent={<Chip label={2} />}
      >
        <StyledFlexColumn gap={0}>
          <StyledSection>
            {roles && (
              <StyledLink href={getTonScanContractUrl(roles.owner)}>
                {makeElipsisAddress(roles.owner)}
              </StyledLink>
            )}
            <Chip label="Admin" />
          </StyledSection>
          <StyledSection>
            {roles && (
              <StyledLink href={getTonScanContractUrl(roles?.proposalOwner)}>
                {makeElipsisAddress(roles?.proposalOwner)}
              </StyledLink>
            )}
            <Chip label="Admin" />
          </StyledSection>
        </StyledFlexColumn>
      </StyledTitleContainer>
    </StyledFlexColumn>
  );
}

const StyledTitleContainer = styled(TitleContainer)({
  ".title-container-header":{
    justifyContent:'flex-start'
  },
  ".title-container-children":{
    padding: 0
  }
});

const StyledSection = styled(StyledFlexRow)({
  gap: 30,
  justifyContent: "space-between",
  padding: "14px 25px",
  borderBottom: "1px solid rgba(114, 138, 150, 0.24)",
  "&:last-child": {
    border:'unset'
  }
});

const StyledLink = styled(Link)({
  width: 300,
  ...textOverflow,
});
