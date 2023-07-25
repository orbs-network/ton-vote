import { Box, Fade, styled, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import { StyledContainer, StyledFlexColumn, StyledFlexRow } from "styles";

interface Props {
  headerComponent?: React.ReactNode;
  title: ReactNode;
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export function TitleContainer({
  headerComponent,
  title,
  children,
  className = '',
  subtitle
}: Props) {

    const hideHeader = !title && !headerComponent;
  return (
    <Fade in={true}>
      <StyledTitleContainer className={className}>
        {!hideHeader && (
          <StyledHeader
            justifyContent="space-between"
            className="title-container-header"
          >
            <StyledTitle className="title">{title}</StyledTitle>
            {headerComponent}
          </StyledHeader>
        )}
        <Box className="title-container-children">
          {subtitle && <StyledSubtitle>{subtitle}</StyledSubtitle>}
          {children}
        </Box>
      </StyledTitleContainer>
    </Fade>
  );
}

export const StyledSubtitle = styled(Typography)({
  fontSize: 14,
  opacity: 0.7,
  width: "100%",
  textAlign: "left",
  marginBottom: 30
});

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontSize: 17,
  color: theme.palette.text.primary,
  fontWeight: 700,
}));

const StyledTitleContainer = styled(StyledContainer)({
  width: "100%",
  padding: 0,
  ".title-container-children": {
    padding: "20px",
    width:'100%',
    position:'relative',
  },
});

const StyledHeader = styled(StyledFlexRow)(({ theme }) => ({
  borderBottom:
    theme.palette.mode === "light" ? "1px solid #e0e0e0" : "1px solid #424242",
  padding: "15px 20px",
  flexWrap: "wrap",
}));
