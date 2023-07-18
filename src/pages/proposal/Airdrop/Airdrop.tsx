import { styled } from "@mui/material";
import { useAppParams } from "hooks/hooks";
import _ from "lodash";
import { Page } from "wrappers";
import { appNavigation } from "router/navigation";
import { Form } from "./AirdropForm";
import { ActiveAirdrop } from "./ActiveAirdrop";
import { useAirdrop } from "./hooks";

export function Airdrop() {
  const { daoAddress, proposalAddress } = useAppParams();
  const { airdropExist } = useAirdrop();
  return (
    <StyledPage
      back={appNavigation.proposalPage.root(daoAddress, proposalAddress)}
    >
      {!airdropExist ? <Form /> : <ActiveAirdrop />}
    </StyledPage>
  );
}
const StyledPage = styled(Page)({
  maxWidth: 800,
  marginLeft: "auto",
  marginRight: "auto",
});

