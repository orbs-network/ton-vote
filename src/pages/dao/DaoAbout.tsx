import { Chip, styled } from "@mui/material";
import { AddressDisplay, TitleContainer } from "components";
import { useAppParams } from "hooks/hooks";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoQuery } from "query/getters";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { LayoutSection } from "./components";
import { DaoDescription } from "./DaoDescription";

export function DaoAbout() {
    const { daoAddress } = useAppParams();

  const roles = useDaoQuery(daoAddress).data?.daoRoles;
  const translations = useCommonTranslations();

  return (
    <LayoutSection title="About">
      <DaoDescription />
      <StyledTitleContainer
        title={translations.administrators}
        headerComponent={<Chip label={2} />}
      >
        <StyledFlexColumn gap={0}>
          <StyledSection>
            {roles && (
              <StyledAddressDisplay address={roles.owner} padding={10} />
            )}
            <Chip label={translations.daoSpaceOwner} color="primary" />
          </StyledSection>
          <StyledSection>
            {roles && (
              <StyledAddressDisplay
                address={roles?.proposalOwner}
                padding={10}
              />
            )}
            <Chip label={translations.proposalPublisher} color="primary" />
          </StyledSection>
        </StyledFlexColumn>
      </StyledTitleContainer>
    </LayoutSection>
  );
}

export default DaoAbout;


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
