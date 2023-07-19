import { styled } from "@mui/material";
import { useAppParams } from "hooks/hooks";
import _ from "lodash";
import { Page } from "wrappers";
import { appNavigation } from "router/navigation";
import { CreateAirdropForm } from "./CreateAirdropForm";
import { ActiveAirdrop } from "./ActiveAirdrop";
import { useAirdrop } from "./hooks";

export function Airdrop() {
  const { daoAddress, proposalAddress } = useAppParams();
  const { airdropExist } = useAirdrop();
  return (
    <StyledPage
    title="Airdrop"
      back={appNavigation.proposalPage.root(daoAddress, proposalAddress)}
    >
      {!airdropExist ? <CreateAirdropForm /> : <ActiveAirdrop />}
    </StyledPage>
  );
}
const StyledPage = styled(Page)({
  maxWidth: 700,
  marginLeft: "auto",
  marginRight: "auto",
});

