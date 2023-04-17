import { styled, Typography } from "@mui/material";
import { Header, Link } from "components";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import {
  StyledContainer,
  StyledFlexColumn,
  StyledFlexRow,
  textOverflow,
} from "styles";
import { getTonScanContractUrl } from "utils";

export function About() {
  const daoAddress = useDaoAddress();
  const roles = useDaoQuery(daoAddress).data?.daoRoles;

  return (
    <StyledFlexColumn gap={0} alignItems="flex-start">
      <Header title="About" />
      <StyledContainer style={{width:'100%'}}>
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
