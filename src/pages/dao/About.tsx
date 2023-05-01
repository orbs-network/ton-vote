import { Chip, styled } from "@mui/material";
import { AddressDisplay, Header, Link, TitleContainer } from "components";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { DaoDescription } from "./DaoDescription";

export function DaoPageAbout() {
  const daoAddress = useDaoAddress();
  const roles = useDaoQuery(daoAddress).data?.daoRoles;

  return (
    <StyledFlexColumn gap={0} alignItems="flex-start">
      <StyledHeader title="About" />
      <StyledFlexColumn gap={30}>
        <DaoDescription />
        <StyledTitleContainer
          title="Administrators"
          headerComponent={<Chip label={2} />}
        >
          <StyledFlexColumn gap={0}>
            <StyledSection>
              {roles && (
                <StyledAddressDisplay address={roles.owner} padding={10} />
              )}
              <Chip label="DAO space owner" color="primary" />
            </StyledSection>
            <StyledSection>
              {roles && (
                <StyledAddressDisplay
                  address={roles?.proposalOwner}
                  padding={10}
                />
              )}
              <Chip label="Proposal publisher" color="primary" />
            </StyledSection>
          </StyledFlexColumn>
        </StyledTitleContainer>
      </StyledFlexColumn>
    </StyledFlexColumn>
  );
}

const StyledHeader = styled(Header)({
  marginBottom: 38
});

const StyledAddressDisplay = styled(AddressDisplay)({
  P: {
    fontWeight: 600,
  },
});

const StyledTitleContainer = styled(TitleContainer)({
  ".title-container-header": {
    justifyContent: "flex-start",
  },
  ".title-container-children": {
    padding: 0,
  },
});

const StyledSection = styled(StyledFlexRow)({
  gap: 30,
  justifyContent: "space-between",
  padding: "14px 25px",
  borderBottom: "1px solid rgba(114, 138, 150, 0.24)",
  "&:last-child": {
    border: "unset",
  },
});
