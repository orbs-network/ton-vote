import { Chip, styled } from "@mui/material";
import { AddressDisplay, Container, Header, Link, Markdown, TitleContainer } from "components";
import { useDaoAddress } from "hooks";
import { useDaoQuery } from "query/queries";
import {
  StyledFlexColumn,
  StyledFlexRow,
  textOverflow,
} from "styles";

 export function DaoPageAbout() {
  const daoAddress = useDaoAddress();
  const roles = useDaoQuery(daoAddress).data?.daoRoles;
  const metadata = useDaoQuery(daoAddress).data?.daoMetadata;
  return (
    <StyledFlexColumn gap={0} alignItems="flex-start">
      <Header title="About" />
      <StyledFlexColumn>
        {metadata?.about && (
          <StyledDescription>
            <Markdown>{metadata?.about}</Markdown>
          </StyledDescription>
        )}
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


const StyledDescription = styled(Container)({
  width: "100%",
});

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
