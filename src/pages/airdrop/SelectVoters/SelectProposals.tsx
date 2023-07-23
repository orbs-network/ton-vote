import { styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  AppTooltip,
  OverflowWithTooltip,
  TitleContainer,
} from "components";
import {
  useDaosQuery,
  useEnsureProposalQuery,
  useProposalQuery,
} from "query/getters";
import { CSSProperties, useCallback, useMemo } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";

import { useAirdropStore } from "store";
import _ from "lodash";
import { parseLanguage } from "utils";
import SelectPopup from "components/SelectPopup";
import { Proposal } from "types";

export const SelectProposals = () => {
  const { proposals } = useAirdropStore();

  return (
    <TitleContainer
      title="Selected proposals"
      headerComponent={<ProposalsSelect />}
    >
      <StyledSection>
        <SelectPopup.List
          emptyText="Proposals not selected"
          isEmpty={_.isEmpty(proposals)}
        >
          {proposals?.map((proposalAddress) => {
            return (
              <RowProposal key={proposalAddress} address={proposalAddress} />
            );
          })}
        </SelectPopup.List>
      </StyledSection>
    </TitleContainer>
  );
};

const ProposalContent = ({ proposal, address }: { proposal?: Proposal | null, address: string }) => {

  return (
    <StyledProposal gap={3}>
      <AddressDisplay address={address} padding={10} className="address" />
      <OverflowWithTooltip
        className="name"
        text={parseLanguage(proposal?.metadata?.title)}
        hideTooltip
      />

      <Typography>{_.size(proposal?.rawVotes)} voters</Typography>
    </StyledProposal>
  );
};

const RowProposal = ({ address }: { address: string }) => {
  const { isLoading, data: proposal } = useProposalQuery(address);
  const { deleteProposal } = useAirdropStore();

  return (
    <SelectPopup.SelectedChip
      isLoading={isLoading}
      onDelete={() => deleteProposal(address)}
    >
      <ProposalContent address={address} proposal={proposal} />
    </SelectPopup.SelectedChip>
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

  return <ProposalContent address={proposalAddress!} proposal={proposal} />;
}

const StyledProposal = styled(StyledFlexColumn)({
  alignItems: "flex-start",
  ".name": {
    "*": {
      fontSize: 14,
      fontWeight: 600,
    },
  },
  ".address": {
    "*": {
      fontWeight: 500,
      fontSize: 14,
    },
  },
});

const ProposalsSelect = () => {
  const allProposals = useAllProposals();
  const { setProposals, proposals } = useAirdropStore();

  const filterFn = useCallback((address: string, search: string) => {
    return address.toLowerCase().includes(search.toLowerCase());
  }, []);

  return (
    <AppTooltip text={_.isEmpty(allProposals) ? "Select dao first" : undefined}>
      <SelectPopup
        disabled={_.isEmpty(allProposals)}
        RowComponent={ProposalRow}
        title="Select Proposals"
        data={allProposals}
        selected={proposals || []}
        onSave={setProposals}
        itemSize={100}
        buttonText="Select Proposals"
        filterFn={filterFn}
      />
    </AppTooltip>
  );
};

const StyledSection = styled(StyledFlexColumn)({
  alignItems: "center",
  gap: 30,
  ".title": {
    fontSize: 14,
    fontWeight: 600,
  },
});
