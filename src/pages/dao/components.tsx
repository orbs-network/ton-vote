import { Box, Fade, styled } from "@mui/material";
import { Header, LoadingContainer } from "components";
import { MOBILE_WIDTH } from "consts";
import { useMobile } from "hooks";
import React, { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { DaoMenu } from "./dao-menu/DaoMenu";

export const LayoutSection = ({
  children,
  title,
  className = "",
  isLoading = false,
  headerChildren,
}: {
  children: ReactNode;
  title: string;
  className?: string;
  isLoading?: boolean;
  headerChildren?: ReactNode;
}) => {
  const mobile = useMobile();

  return (
    <StyledSection className={className}>
      {!mobile && <StyledHeader component={headerChildren} title={title} />}
      {isLoading ? (
        <LoadingContainer loaderAmount={5} />
      ) : (
        <StyledSectionChildren style={{ gap: mobile ? 10 : 20 }}>
          {children}
        </StyledSectionChildren>
      )}
    </StyledSection>
  );
};

const StyledHeader = styled(Header)({
  marginBottom: 34,
});

const StyledSection = styled(StyledFlexColumn)({
  gap: 0,
});

const StyledSectionChildren = styled(StyledFlexColumn)({});

export function DaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <Fade in={true}>
      <StyledContainer>
        <DaoMenu />
        <StyledChildren>{children}</StyledChildren>
      </StyledContainer>
    </Fade>
  );
}

const StyledContainer = styled(StyledFlexRow)({
  alignItems: "flex-start",
  gap: 20,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    flexDirection: "column",
  },
});

const StyledChildren = styled(Box)({
  flex: 1,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    width: "100%",
  },
});

