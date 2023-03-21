import { Chip, Fade, styled, Typography } from "@mui/material";
import {
  AppTooltip,
  Button,
  Container,
  Link,
  LoadMore,
  NumberDisplay,
} from "components";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { makeElipsisAddress, nFormatter } from "utils";
import { PAGE_SIZE, TONSCAN } from "config";
import { Vote } from "types";
import { fromNano } from "ton";
import { useMemo, useState } from "react";
import moment from "moment";
import _ from "lodash";
import { useConnectionStore } from "connection";
import { useProposalResults, useProposalVotes } from "./hooks";

const ContainerHeader = () => {
  const { proposalVotes, isLoading } = useProposalVotes();
  const proposalResults = useProposalResults().proposalResults;
  const totalTonAmount = proposalResults?.totalWeight || "0";
  const votesLength = _.size(proposalVotes);

  const tonAmount = useMemo(() => {
    return nFormatter(Number(fromNano(totalTonAmount)));
  }, [totalTonAmount]);

  return (
    <Fade in={!isLoading}>
      <StyledContainerHeader>
        <StyledChip
          label={
            <>
              <NumberDisplay value={votesLength} /> votes
            </>
          }
        />
        <Typography className="total" style={{ fontWeight: 600 }}>
          {tonAmount} TON
        </Typography>
      </StyledContainerHeader>
    </Fade>
  );
};

const StyledContainerHeader = styled(StyledFlexRow)({
  flex: 1,
  justifyContent: "space-between",
  "@media (max-width: 600px)": {
    ".total": {
      fontSize: 13,
    },
  },
});

export function Votes() {
  const { proposalVotes, isLoading, walletVote } = useProposalVotes();
  const [votesShowAmount, setShowVotesAMount] = useState(PAGE_SIZE);
  const showMoreVotes = () => {
    setShowVotesAMount((prev) => prev + PAGE_SIZE);
  };

  return (
    <StyledContainer
      title="Recent votes"
      loading={isLoading}
      loaderAmount={3}
      headerChildren={<ContainerHeader />}
    >
      {proposalVotes?.length ? (
        <StyledList gap={15}>
          <VoteComponent data={walletVote} />
          {proposalVotes?.map((vote, index) => {
            if (index >= votesShowAmount) return null;
            return <VoteComponent data={vote} key={vote.address} />;
          })}
        </StyledList>
      ) : (
        <StyledNoVotes>No votes yet</StyledNoVotes>
      )}
      <LoadMore
        hide={isLoading}
        loadMoreOnScroll={votesShowAmount > PAGE_SIZE}
        showMore={showMoreVotes}
        isFetchingNextPage={false}
      />
    </StyledContainer>
  );
}

const StyledLoaderMore = styled(StyledFlexRow)({
  marginTop: 50,
});

const VoteComponent = ({ data }: { data?: Vote }) => {
  const connectedAddress = useConnectionStore().address;

  if (!data) return null;
  const { address, votingPower, vote, hash, timestamp } = data;

  return (
    <StyledVote justifyContent="flex-start">
      <AppTooltip text={`${moment.unix(timestamp).utc().fromNow()}`}>
        <Link className="address" href={`${TONSCAN}/tx/${hash}`}>
          {connectedAddress === address
            ? "You"
            : makeElipsisAddress(address, 5)}
        </Link>
      </AppTooltip>
      <Typography className="vote">{vote}</Typography>
      <Typography className="voting-power">
        {nFormatter(Number(votingPower))} TON
      </Typography>
    </StyledVote>
  );
};

const StyledNoVotes = styled(Typography)({
  textAlign: "center",
  fontSize: 17,
  fontWeight: 600,
});

const StyledVote = styled(StyledFlexRow)({
  borderBottom: "0.5px solid rgba(114, 138, 150, 0.16)",
  paddingBottom: 10,
  gap: 10,
  ".address": {
    width: 160,
  },
  ".vote": {
    flex: 1,
    textAlign: "center",
  },
  ".voting-power": {
    width: 160,
    textAlign: "right",
    gap: 5,
    ".number-display": {
      ...textOverflow,
      flex: 1,
    },
  },

  "@media (max-width: 850px)": {
    alignItems: "flex-start",
    flexWrap: "wrap",

    ".address": {
      maxWidth: "60%",
    },
    ".date": {},
    ".vote": {
      flex: "unset",
      marginLeft: "auto",
    },
    ".voting-power": {
      width: "100%",
      textAlign: "left",
      justifyContent: "flex-start",
      ".number-display ": {
        flex: "unset",
        maxWidth: "70%",
      },
    },
  },
});

const StyledList = styled(StyledFlexColumn)({});

const StyledContainer = styled(Container)({
  paddingBottom: 30,
  ".container-header": {
    alignItems: "center",
    gap: 13,
    h4: {
      width: "fit-content",
    },
  },
});

const StyledChip = styled(Chip)({
  height: 28,
  "*": {
    fontWeight: 600,
    fontSize: 13,
  },
});
