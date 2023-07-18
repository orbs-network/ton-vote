import { styled } from "@mui/material";
import { useAppParams } from "hooks/hooks";
import _ from "lodash";
import { StyledFlexColumn } from "styles";
import { Page } from "wrappers";
import { appNavigation } from "router/navigation";
import { Details } from "./Details";
import { SelectedWallets } from "./SelectedWallets";

export function Airdrop() {
  const { daoAddress, proposalAddress } = useAppParams();
  return (
    <StyledPage
      title="Airdrop"
      back={appNavigation.proposalPage.root(daoAddress, proposalAddress)}
    >
      <StyledContent gap={20}>
        <Details />
        <SelectedWallets />
      </StyledContent>
    </StyledPage>
  );
}
const StyledPage = styled(Page)({
  maxWidth: 800,
  marginLeft: "auto",
  marginRight: "auto",
});

const StyledContent = styled(StyledFlexColumn)({
  alignItems: "flex-start",
});
