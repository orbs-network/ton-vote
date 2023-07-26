import { IconButton, styled, Typography } from "@mui/material";
import {
  AppTooltip,
  Button,
  OverflowWithTooltip,
  VirtualList,
} from "components";
import { useDaosQuery, useProposalQuery } from "query/getters";
import { useMemo, useState } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useAirdropStore } from "../store";
import _ from "lodash";
import { makeElipsisAddress, parseLanguage } from "utils";
import { appNavigation } from "router/navigation";
import { SubmitButtonContainer } from "./SubmitButton";
import {
  StyledAirdropSearch,
  StyledAirdropTitleContainer,
} from "../Components";
import { BiLinkExternal } from "react-icons/bi";
import { errorToast } from "toasts";

export const SelectProposals = () => {
  const allProposals = useAllProposals();
  const { nextStep, selectProposal, proposals, setProposals } = useAirdropStore();
  const [filterValue, setFilterValue] = useState("");

  const filteredProposals = useMemo(() => {
    return _.filter(allProposals, (p) =>
      _.includes(p.toLowerCase(), filterValue.toLowerCase())
    );
  }, [
    filterValue,
    _.size(allProposals),
  ]);

  const onNextClick = () => {
    if (_.isEmpty(proposals)) {
      errorToast("Please select at least one proposal");
      return;
    } else {
      nextStep();
    }
  };


  const selectAll = () => {
    setProposals(allProposals);
  }

  return (
    <StyledAirdropTitleContainer
      title="Selected proposals"
      headerComponent={<StyledAirdropSearch onChange={setFilterValue} />}
    >
      <StyledFlexColumn>
        <StyledSelectAll onClick={selectAll} variant="text">
          Select all
        </StyledSelectAll>
        <StyledList
          disabled={_.isEmpty(allProposals)}
          RowComponent={ProposalRow}
          data={filteredProposals}
          itemSize={60}
          selected={proposals}
          onSelect={selectProposal}
        />
      </StyledFlexColumn>
      <SubmitButtonContainer>
        <Button onClick={onNextClick}>Next</Button>
      </SubmitButtonContainer>
    </StyledAirdropTitleContainer>
  );
};

const StyledSelectAll = styled(Button)({
  marginLeft: "auto",
})

const StyledList = styled(VirtualList)({
  height: 400,
  width:'100%'
});

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
        <OverflowWithTooltip
          className="name"
          text={parseLanguage(proposal?.metadata?.title)}
          hideTooltip
        />
        <Typography>{`(${makeElipsisAddress(proposalAddress)})`}</Typography>
        <AppTooltip text="View proposal">
          <StyledNavigationBtn onClick={onClick}>
            <BiLinkExternal />
          </StyledNavigationBtn>
        </AppTooltip>
      </StyledFlexRow>
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
