import React, { useMemo, useState } from "react";
import { Container } from "components";
import { Chip, Fade, Link, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn } from "styles";
import AnimateHeight from "react-animate-height";
import { useVoteTimeline } from "hooks";
import { CONTRACT_ADDRESS } from "config";

export function MainLayout() {
  const [showMore, setShowMore] = useState(false);
  return (
    <StyledContainer
      title="Proposal of TON Tokenomics Optimization"
      headerChildren={<VoteEndedChip />}
    >
      <StyledFlexColumn alignItems="flex-start">
        <Typography>
          Tokenomics proposal to achieve community consensus on circulating
          supply of TON. Proposal for a 48 month temporary freeze of inactive
          mining wallets which have never been activated, and do not have any
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
  const { voteStarted, voteInProgress, isLoading } = useVoteTimeline();
  const label = useMemo(() => {
    if (!voteStarted) {
      return "Not Started";
    }
    if (voteInProgress) {
      return "Active";
    }
    return "Ended";
  }, [voteStarted, voteInProgress]);

    return (
      <Fade in={!isLoading}>
        <StyledVoteEnded label={label} variant="filled" color="primary" />
      </Fade>
    );
};

const StyledVoteEnded = styled(Chip)({
  fontWeight: 700,
  fontSize: 12,
});

const ShowMorePart = () => {
  return (
    <StyledShowMoreText>
      <Typography>
        In response to repeated requests for greater certainty, clarity and
        transparency over the tokenomics of the TON network on December 17,
        2022, the community called for all early miners to activate their
        inactive mining wallets by the end of 2022.
      </Typography>
      <Typography>
        Out of the 204 inactive mining wallets identified by the community, 182
        wallets remain inactive as of February 14, 2023. 182 wallets constitute
        less than 0.0001% of the network. These mining wallets — the genesis
        wallets which have mined Toncoin directly from the Proof-of-Work
        smart-contracts — have never been activated and do not have a single
        outgoing transfer in their history. The full list of inactive mining
        wallet addresses can be found{" "}
        <Link href="https://tontech.io/stats/early-miners" target='_blank'>here</Link>, which is
        also specified in the{" "}
        <Link
          href={`https://verifier.ton.org/${CONTRACT_ADDRESS}`}
          target="_blank"
        >
          proposal smart-contract.
        </Link>
      </Typography>
      <Typography>
        Any address that becomes active prior to the network voting shall be
        excluded from this list. The network voting by the validators is
        expected to take place on or around February 21, 2023.
      </Typography>
      <Typography>
        Toncoin acts as a gas fee required to obtain access to decentralized
        services on the TON network. It has been widely speculated that access
        to these inactive wallets may have been lost. What is clear is that
        there is a community consensus: the existence of these unutilized
        Toncoin only increases the uncertainty for network participants.
      </Typography>
      <Typography>
        In spite of some community members proposing for a permanent
        inactivation, a large part of the community was in favor of preserving
        the very idea that keeps us together: decentralization. For this reason,
        we are suggesting this inactivation period to last temporarily for 48
        months. This will give the TON ecosystem enough time to flourish while
        providing flexibility to those who may not be aware of these discussions
        in the community.
      </Typography>
      <Typography>
        TON is a community-driven blockchain and we believe that the network
        validators should listen to the voice of the community as a whole.
        Therefore, we are suggesting every Toncoin holder to participate in this
        vote ahead of the network voting. It is momentous that everyone
        participates in this new chapter of TON’s history.
      </Typography>
      <Typography>Make your voice heard.</Typography>
      <Typography>
        <small>
          Disclaimer: the voting results on ton.vote will not have any direct
          impact on the network voting itself. However, the community believes
          that the network validators will seriously consider the voice of the
          community.
        </small>
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
  small: {
    fontSize: 14,
    fontStyle: "italic",
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
