import React, { useMemo, useState } from "react";
import { Container } from "components";
import { Chip, Link, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn } from "styles";
import AnimateHeight from "react-animate-height";
import { useVoteTimeline } from "hooks";

export function MainLayout() {
  const [showMore, setShowMore] = useState(false);
  return (
    <StyledContainer
      title="Proposal of TON tokenomics optimization"
      headerChildren={<VoteEndedChip />}
    >
      <StyledFlexColumn alignItems="flex-start">
        <Typography>
          Support the proposal of tokenomics to achieve a community consensus
          about circulating supply and freeze for 48 months inactive mining
          wallets, that have never been activated and do not have a single
          outgoing transfer in their history.
        </Typography>

        <AnimateHeight height={showMore ? "auto" : 0} duration={400}>
          <ShowMorePart />
        </AnimateHeight>
        <StyledShowMore onClick={() => setShowMore(!showMore)}>
          <Typography>{showMore ? "Show less" : "Show more"}</Typography>
        </StyledShowMore>
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const VoteEndedChip = () => {
  const { voteStarted, voteInProgress } = useVoteTimeline();
  const label = useMemo(() => {
    if (!voteStarted) {
      return "Not Started";
    }
    if (voteInProgress) {
      return "Active";
    }
    return "Ended";
  }, [voteStarted, voteInProgress]);

  return <StyledVoteEnded label={label} variant="filled" color="primary" />;
};

const StyledVoteEnded = styled(Chip)({
  fontWeight: 700,
  fontSize: 12,
});

const ShowMorePart = () => {
  return (
    <StyledShowMoreText>
      <Typography>
        On December 17, in response to repeated requests for greater certainty,
        clarity and transparency over the tokenomics of the TON network, the
        community has called for all early miners to activate their inactive
        mining wallets by the end of 2022.
      </Typography>
      <Typography>
        Out of the 204 inactive mining wallets identified by the community, 195
        wallets holding 1,081,426,228 Toncoin remain inactive today. These
        mining wallets — the genesis wallets that have mined Toncoin directly
        from the Proof-of-Work smart-contracts — have never been activated and
        do not have a single outgoing transfer in their history. The full list
        of inactive mining wallet addresses can be found{" "}
        <Link href="https://tontech.io/stats/early-miners" target="_blank">
          here.
        </Link>{" "}
        The list is also specified in the{" "}
        <Link
          href="https://verifier.ton.org/EQB_ldKKqkDQcnI-9Mp7mB4D3i2r3ytWEnoGRlMDtMXTm4yy"
          target="_blank"
        >
        proposal contract.
        </Link>
        {" "}Any address that becomes active prior to validator action shall not be suspended.
      </Typography>
      <Typography>
        Toncoin is a gas required to access decentralized services on the TON
        network. It has been widely speculated that access to these inactive
        wallets may have been lost. What is clear is that there is a community
        consensus: the existence of these unutilized Toncoin only increases the
        uncertainty for the network participants.
      </Typography>
      <Typography>
        TON is a community-driven blockchain, and we believe that the network
        validators should listen to the voice of the community.
      </Typography>
      <Typography>
        Therefore, we are suggesting a reatail vote for the proposal of
        tokenomics optimization, one that enables these inactive mining wallets
        to remain inactive for a certain period of time.
      </Typography>
      <Typography>
        In spite of many community members pushing for a permanent inactivation,
        we believe in preserving the very idea that keeps us as one community:
        decentralization. For this reason, we are suggesting this period to be
        48 months. This will give the TON ecosystem enough time to flourish
        while providing flexibility to those who may not be aware of these
        discussions in the community.
      </Typography>
    </StyledShowMoreText>
  );
};

const StyledShowMoreText = styled(StyledFlexColumn)({
  gap: 20,
  alignItems: "flex-start",
  p: {
    textAlign: "left",
  },
});

const StyledShowMore = styled("div")(({ theme }) => ({
  cursor: "pointer",
  p: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
}));

const StyledContainer = styled(Container)({});
