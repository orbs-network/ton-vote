import { Box, styled, Typography } from "@mui/material";
import React from "react";
import { StyledContainer, StyledFlexColumn, StyledFlexRow } from "styles";

interface Props {
  headerComponent?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function TitleContainer({
  headerComponent,
  title,
  children,
  className = '',
}: Props) {
  return (
    <StyledTitleContainer className={className}>
      <StyledHeader justifyContent="space-between">
        <StyledTitle className="title">{title}</StyledTitle>
        {headerComponent}
      </StyledHeader>
      <Box className="title-container-children">{children}</Box>
    </StyledTitleContainer>
  );
}

const StyledTitle = styled(Typography)({
  fontSize: 17,
  color: "black",
  fontWeight: 700,
});

const StyledTitleContainer = styled(StyledContainer)({
  width: "100%",
  padding: 0,
  ".title-container-children": {
    padding: "25px",
    width:'100%'
  },
});

const StyledHeader = styled(StyledFlexRow)({
  borderBottom: "1px solid rgba(114, 138, 150, 0.24)",
  padding: "15px 25px",
});
