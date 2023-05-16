import { Chip, styled } from "@mui/material";
import { AddressDisplay, Header, Link, TitleContainer } from "components";
import { useMobile } from "hooks";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useDaoFromQueryParam } from "query/getters";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { DaoDescription } from "./DaoDescription";

export function DaoPageAbout() {
  const roles = useDaoFromQueryParam().data?.daoRoles;
  const translations = useCommonTranslations();
  const mobile = useMobile();

  return (
    <StyledFlexColumn gap={0} alignItems="flex-start">
      {!mobile && <StyledHeader title="About" />}
      <StyledFlexColumn gap={mobile ? 10 : 30}>
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
      </StyledFlexColumn>
    </StyledFlexColumn>
  );
}

const StyledHeader = styled(Header)({
  marginBottom: 38,
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
