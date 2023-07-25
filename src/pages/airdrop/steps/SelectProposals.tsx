import { IconButton, styled } from "@mui/material";
import {
  AddressDisplay,
  AppTooltip,
  Button,
  OverflowWithTooltip,
} from "components";
import { useDaosQuery, useProposalQuery } from "query/getters";
import { useMemo, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useAirdropStore } from "../store";
import _ from "lodash";
import { parseLanguage } from "utils";
import { appNavigation, useAppNavigation } from "router/navigation";
import { SubmitButtonContainer } from "./SubmitButton";
import { StyledAirdropList } from "../styles";
import {
  StyledAirdropSearch,
  StyledAirdropTitleContainer,
} from "../Components";
import { BiLinkExternal } from "react-icons/bi";
import { errorToast } from "toasts";

export const SelectProposals = () => {
  const allProposals = useAllProposals();
  const { nextStep, selectProposal, proposals } = useAirdropStore();
  const [filterValue, setFilterValue] = useState("");

  const filteredProposals = useMemo(() => {}, [filterValue, allProposals]);

  const onNextClick = () => {
    if (_.isEmpty(proposals)) {
      errorToast("Please select at least one proposal");
      return;
    } else {
      nextStep();
    }
  };

  return (
    <StyledAirdropTitleContainer
      title="Selected proposals"
      headerComponent={<StyledAirdropSearch onChange={setFilterValue} />}
    >
      <StyledAirdropList
        disabled={_.isEmpty(allProposals)}
        RowComponent={ProposalRow}
        data={allProposals}
        itemSize={80}
        selected={proposals}
        onSelect={selectProposal}
      />
      <SubmitButtonContainer>
        <Button onClick={onNextClick}>Next</Button>
      </SubmitButtonContainer>
    </StyledAirdropTitleContainer>
  );
};

interface ProposalRowProps {
  value: string;
}

const useAllProposals = () => {
  const { dataUpdatedAt, data } = useDaosQuery();

  const { daos } = useAirdropStore();

  const daoAddress = daos?.[0];

  return useMemo(() => {
    return _.find(data, { daoAddress })?.daoProposals || [];
  }, [dataUpdatedAt, daoAddress]);
};

function ProposalRow({ value }: ProposalRowProps) {
  const proposals = useAllProposals();
  const proposalAddress = proposals.find((p) => p === value);
  const { data: proposal } = useProposalQuery(proposalAddress);

  const onClick = (e: any) => {
    e.stopPropagation();
    window.open(
      appNavigation.proposalPage.root(proposal?.daoAddress!, proposalAddress!),
      "_blank"
    );
  };

  return (
    <StyledProposal gap={2}>
      <StyledFlexRow justifyContent="space-between">
        <AddressDisplay address={proposalAddress} className="address" />
        <AppTooltip text="View proposal">
          <StyledNavigationBtn onClick={onClick}>
            <BiLinkExternal />
          </StyledNavigationBtn>
        </AppTooltip>
      </StyledFlexRow>
      <OverflowWithTooltip
        className="name"
        text={parseLanguage(proposal?.metadata?.title)}
        hideTooltip
      />
    </StyledProposal>
  );
}
const StyledNavigationBtn = styled(IconButton)(({ theme }) => ({
  svg: {
    width: 18,
    height: 18,
    color: theme.palette.primary.main,
  },
}));

const StyledProposal = styled(StyledFlexColumn)({
  alignItems: "flex-start",
  ".name": {
    "*": {
      fontSize: 14,
      fontWeight: 700,
    },
  },
  ".address": {
    "*": {
      fontWeight: 500,
      fontSize: 12,
    },
  },
});
