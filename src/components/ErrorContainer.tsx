import { styled, Typography } from "@mui/material";
import { AddressDisplay, Button, Container } from "components";

import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow } from "styles";

export function ErrorContainer({ text, className = "" }: { text: string; className?: string }) {
  const navigate = useAppNavigation();
  return (
    <StyledContainer className={className}>
      <StyledFlexColumn gap={20}>
        <StyledContent>
          <Typography className="text">{text}</Typography>
        </StyledContent>
        <Button onClick={() => navigate.daosPage.root()}>Home</Button>
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const StyledContainer = styled(Container)({
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 100,
  width: "100%",
  maxWidth: 400,
});

const StyledContent = styled(StyledFlexRow)({
  ".text": {
    fontSize: 20,
    fontWeight: 700,
  },
});
