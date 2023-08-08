import { IconButton, styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  AppTooltip,
  Button,
  OverflowWithTooltip,
  Search,
  SelectedChip,
  VirtualList,
  VirtualListRowProps,
} from "components";
import { useDaosQuery, useProposalQuery } from "query/getters";
import { useMemo, useState } from "react";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { useAirdropStore } from "../../store";
import _ from "lodash";
import { makeElipsisAddress, parseLanguage } from "utils";
import { appNavigation } from "router/navigation";
import { BiLinkExternal } from "react-icons/bi";
import {
  StyledListTitleContainer,
  StyledSelectedList,
  StyledSelectPopup,
} from "pages/airdrop/styles";
import { useSelectedDaosProposals } from "pages/airdrop/hooks";
import { RowLink } from "pages/airdrop/Components";
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";

export const SelectProposals = () => {
  const allProposals = useSelectedDaosProposals();
  const { selectProposal, proposals, setProposals, daos } = useAirdropStore();
  const [filterValue, setFilterValue] = useState("");
  const [showMore, setShowMore] = useState(false);

  const filteredProposals = useMemo(() => {
    return _.filter(allProposals, (p) =>
      _.includes(p.toLowerCase(), filterValue.toLowerCase())
    );
  }, [filterValue, _.size(allProposals)]);

  const [open, setOpen] = useState(false);
  const selectAll = () => {
    setProposals(allProposals);
  };

  return (
    <StyledListTitleContainer
      title="Select proposals"
      headerComponent={
        <AppTooltip text={_.isEmpty(daos) ? "Select a DAO space" : ""}>
          <Button
            disabled={_.isEmpty(daos)}
            variant="text"
            onClick={() => setOpen(true)}
          >
            Select
          </Button>
        </AppTooltip>
      }
    >
      {_.isEmpty(proposals) ? (
        <StyledFlexColumn className="not-selected">
          <Typography>Proposals not selected</Typography>
        </StyledFlexColumn>
      ) : (
        <StyledSelectedList>
          {proposals?.map((proposal, index) => {
            if (!showMore && index > 5) return null;
            return <SelectedProposal address={proposal} key={proposal} />;
          })}
          {_.size(proposals) > 6 && (
            <StyledFlexRow className="show-all">
              <Button
                variant="transparent"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show less" : "Show more"}
              </Button>
            </StyledFlexRow>
          )}
        </StyledSelectedList>
      )}

      <StyledSelectPopup
        title="Select proposals"
        onClose={() => setOpen(false)}
        open={open}
      >
        <>
          <StyledSelectAll onClick={selectAll} variant="text">
            Select all
          </StyledSelectAll>
          <Search onChange={setFilterValue} />
          {_.isEmpty(daos) ? (
            <StyledFlexRow className="empty-list">
              <Typography>Selected dao dont have proposals</Typography>
            </StyledFlexRow>
          ) : (
            <StyledList
              disabled={_.isEmpty(allProposals)}
              RowComponent={ProposalRow}
              data={filteredProposals}
              itemSize={60}
              selected={proposals}
              onSelect={selectProposal}
            />
          )}
          <Button onClick={() => setOpen(false)}>Close</Button>
        </>
      </StyledSelectPopup>
    </StyledListTitleContainer>
  );
};

const SelectedProposal = ({ address }: { address: string }) => {
  const { data } = useProposalQuery(address);
  const { selectProposal } = useAirdropStore();
  return (
    <StyledSelectedPorposal onDelete={() => selectProposal(address)}>
      <StyledFlexColumn style={{ alignItems: "flex-start" }} gap={0}>
        <OverflowWithTooltip
          text={address}
          tooltipText={
            <>
              {address}
              <br />
              {parseLanguage(data?.metadata?.title)}
            </>
          }
        />
      </StyledFlexColumn>
    </StyledSelectedPorposal>
  );
};

const StyledSelectedPorposal = styled(SelectedChip)({
  p: {
    fontSize: 12,
    fontWeight: 600,
  },
});

const StyledSelectAll = styled(Button)({
  marginLeft: "auto",
});

const StyledList = styled(VirtualList)({
  flex: 1,
  width: "100%",
});


function ProposalRow(props: VirtualListRowProps) {
  const proposalAddress = props.data.list[props.index];
  const { data: proposal, isLoading } = useProposalQuery(proposalAddress);
  const t = useAirdropTranslations()
  const onClick = (e: any) => {
    e.stopPropagation();
    window.open(
      appNavigation.proposalPage.root(proposal?.daoAddress!, proposalAddress!),
      "_blank"
    );
  };

  const disabled = _.isEmpty(proposal?.rawVotes);

  if (isLoading) {
    return <StyledSkeletonLoader style={{ borderRadius: 50 }} height={45} />;
  }

  return (
    <VirtualList.RowContent
      isSelected={props.data.selected.includes(proposalAddress)}
      onClick={() => props.data.onSelect?.(proposalAddress)}
      disabled={disabled}
    >
      <AppTooltip
        text={disabled ? t.emptyProposalTooltip : undefined}
        placement="right"
      >
        <StyledProposal gap={2}>
          <StyledFlexRow justifyContent="space-between">
            <OverflowWithTooltip
              hideTooltip={disabled}
              placement="right"
              className="name"
              text={parseLanguage(proposal?.metadata?.title)}
            />

            <AppTooltip text={proposalAddress} placement="right">
              <Typography className="address">{`(${makeElipsisAddress(
                proposalAddress
              )})`}</Typography>
            </AppTooltip>
            <RowLink text="View proposal" onClick={onClick} />
          </StyledFlexRow>
        </StyledProposal>
      </AppTooltip>
    </VirtualList.RowContent>
  );
}

const StyledProposal = styled(StyledFlexColumn)({
  alignItems: "flex-start",
  ".name": {
    "*": {
      fontSize: 13,
      fontWeight: 700,
    },
  },
  ".address": {
    fontWeight: 500,
    fontSize: 13,
  },
});
