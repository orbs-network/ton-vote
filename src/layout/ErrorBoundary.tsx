import { styled, Typography } from "@mui/material";
import { Button, Container } from "components";
import { FallbackProps } from "react-error-boundary";
import { useAppNavigation } from "router";
import { StyledFlexColumn } from "styles";

export const ErrorFallback = (props: FallbackProps) => {
  const appNavigation = useAppNavigation();
  const reset = () => {
    appNavigation.daosPage.root();
    props.resetErrorBoundary();
  };
  return (
    <StyledErrorContainer>
      <StyledErrorContent>
        <StyledFlexColumn alignItems="center" gap={30}>
          <Typography className="text">Something went wrong</Typography>
          <Button onClick={reset}>Home</Button>
        </StyledFlexColumn>
      </StyledErrorContent>
    </StyledErrorContainer>
  );
};


const StyledErrorContainer = styled(StyledFlexColumn)({});


const StyledErrorContent = styled(Container)({
  maxWidth: 400,
  ".text": {
    fontSize: 18,
  },
  button: {
    width: 130,
  },
});
