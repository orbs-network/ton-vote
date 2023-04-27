import { Chip, styled } from "@mui/material";
import { AddressDisplay, Header, Link, TitleContainer } from "components";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { DaoDescription } from "./DaoDescription";

export function DaoPageAbout() {
  const daoAddress = useDaoAddress();
  const roles = useDaoQuery(daoAddress).data?.daoRoles;

  return (
    <StyledFlexColumn gap={0} alignItems="flex-start">
      <Header title="About" />
      <StyledFlexColumn>
        <DaoDescription />
        <StyledTitleContainer
          title="Administrators"
          headerComponent={<Chip label={2} />}
        >
          <StyledFlexColumn gap={0}>
            <StyledSection>
              {roles && <AddressDisplay address={roles.owner} />}
              <Chip label="Dao Owner" />
            </StyledSection>
            <StyledSection>
              {roles && <AddressDisplay address={roles?.proposalOwner} />}
              <Chip label="Proposal Owner" />
            </StyledSection>
          </StyledFlexColumn>
        </StyledTitleContainer>
      </StyledFlexColumn>
    </StyledFlexColumn>
  );
}

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
