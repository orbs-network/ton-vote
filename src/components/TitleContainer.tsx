import { Box, Fade, styled, Typography } from "@mui/material";
import { MOBILE_WIDTH } from "consts";
import React, { ReactNode } from "react";
import { StyledContainer, StyledFlexColumn, StyledFlexRow } from "styles";

interface Props {
  headerComponent?: React.ReactNode;
  title: ReactNode;
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
  small?: boolean
}

export function TitleContainer({
  headerComponent,
  title,
  children,
  className = "",
  subtitle,
  small,
}: Props) {
  const hideHeader = !title && !headerComponent;
  return (
    <StyledTitleContainer className={className}>
      {!hideHeader && (
        <StyledHeader
          small={small ? 1 : 0}
          justifyContent="space-between"
          className="title-container-header"
        >
          <StyledTitle small={small ? 1 : 0} className="title">
            {title}
          </StyledTitle>
          {headerComponent}
        </StyledHeader>
      )}
      <Box className="title-container-children">
        {subtitle && (
          <StyledSubtitle>
            {" "}
            {subtitle.split("/n").map((it, index) => {
              return <Typography key={index}>{it}</Typography>;
            }) || ""}
          </StyledSubtitle>
        )}
        {children}
      </Box>
    </StyledTitleContainer>
  );
}

export const StyledSubtitle = styled(StyledFlexColumn)({
  width: "100%",

  marginBottom: 40,
  p: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "left",
  },
});

const StyledTitle = styled(Typography)<{ small?: number }>(
  ({ theme, small }) => ({
    fontSize: small ? 15 : 17,
    color: theme.palette.text.primary,
    fontWeight: 700,
    [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
      fontSize: small ? 14 : 16,
    },
  })
);

const StyledTitleContainer = styled(StyledContainer)({
  width: "100%",
  padding: 0,
  ".title-container-children": {
    padding: "20px",
    width:'100%',
    position:'relative',
  },
});

const StyledHeader = styled(StyledFlexRow)<{ small?: number }>(
  ({ theme, small }) => ({
    borderBottom:
      theme.palette.mode === "light"
        ? "1px solid #e0e0e0"
        : "1px solid #424242",
    padding: small ? '10px 15px' : "15px 20px",
    flexWrap: "wrap",
  })
);
