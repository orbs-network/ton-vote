import { styled, Typography } from '@mui/material';
import { FadeElement, TitleContainer } from 'components'
import React from 'react'
import { RiErrorWarningLine } from 'react-icons/ri';
import { StyledFlexRow } from 'styles';

export function Step({
  children,
  title,
  warning,
}: {
  children: React.ReactNode;
  title: string;
  warning?: string | null;
}) {
  return (
    <StyledStep
      title={title}
      headerComponent={
        warning && (
          <StyledWarning>
            {" "}
            <RiErrorWarningLine />
            {warning}
          </StyledWarning>
        )
      }
    >
      {children}
    </StyledStep>
  );
}

const StyledWarning = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  svg: {
    position: "relative",
    top: 2,
    marginRight: 4,
  },
}));

const StyledStep = styled(TitleContainer)({
  flex: 1,

  ".title-container-header": {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },
});
