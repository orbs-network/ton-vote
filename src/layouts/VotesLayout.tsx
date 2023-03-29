import { Chip, Fade, styled, Typography } from "@mui/material";
import { AppTooltip, Button, Container, Link, NumberDisplay } from "components";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { makeElipsisAddress, nFormatter } from "utils";
import { TONSCAN } from "config";
import { Vote } from "types";
import { useStateQuery } from "queries";
import { useConnectionStore, useVotesPaginationStore } from "store";
import { fromNano } from "ton";
import { useMemo } from "react";
import moment from "moment";
import _, { isArray } from "lodash";
import { useVoteTimeline } from "hooks";

const ContainerHeader = () => {
  const { data, isLoading } = useStateQuery();
  const totalTonAmount = data?.proposalResults.totalPower;
  const votesLength = _.size(data?.votes);

  const tonAmount = useMemo(() => {
    return nFormatter(Number(fromNano(Number(totalTonAmount) || "0")));
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

export function VotesLayout() {
  const { isLoading, data, dataUpdatedAt: votesUpdatedDate } = useStateQuery();

  const votes = data?.votes;
  const { showMoreVotes, votesViewLimit } = useVotesPaginationStore();
  const hideLoadMore = (votes?.length || 0) <= votesViewLimit;
  const connectedAddress = useConnectionStore((store) => store.address);

  const { voteStarted, isLoading: voteTimelineLoading } = useVoteTimeline();



  const addressVote = useMemo(() => {
    if (!connectedAddress) return;
    return votes?.find((vote) => vote.address === connectedAddress);
  }, [votesUpdatedDate, connectedAddress]);

  if (!voteStarted && !voteTimelineLoading) return null;
    return (
      <StyledContainer
        title="Recent votes"
        loading={isLoading}
        loaderAmount={3}
        headerChildren={<ContainerHeader />}
      >
        {votes?.length ? (
          <StyledList gap={15}>
            {addressVote && <VoteComponent you={true} data={addressVote} />}
            {votes?.map((vote, index) => {
              if (
                index >= votesViewLimit ||
                vote.address === connectedAddress
              ) {
                return null;
              }

              return <VoteComponent data={vote} key={vote.address} />;
            })}
          </StyledList>
        ) : (
          <StyledNoVotes>No votes yet</StyledNoVotes>
        )}
        {!hideLoadMore && (
          <StyledLoaderMore>
            <Button onClick={() => showMoreVotes()}>See More</Button>
          </StyledLoaderMore>
        )}
      </StyledContainer>
    );
}

const VoteComponent = ({ data, you }: { data: Vote; you?: boolean }) => {
  const { address, votingPower, vote, hash, timestamp } = data;

  return (
    <StyledVote justifyContent="space-between">
      <AppTooltip
        text={
          <StyledFlexColumn>
            {vote && isArray(vote) && (
              <Typography>Vote: {vote.join(",")}</Typography>
            )}
            <Typography>{moment.unix(timestamp).utc().fromNow()}</Typography>
          </StyledFlexColumn>
        }
      >
        <Link className="address" href={`${TONSCAN}/tx/${hash}`}>
          {you ? "You" : makeElipsisAddress(address, 5)}
        </Link>

        <Typography className="voting-power">
          {nFormatter(Number(votingPower))} TON
        </Typography>
      </AppTooltip>
    </StyledVote>
  );
};

const StyledNoVotes = styled(Typography)({
  textAlign: "center",
  fontSize: 17,
  fontWeight: 600,
});

const StyledLoaderMore = styled(StyledFlexRow)({
  marginTop: 30,
  button: {
    width: 160,
  },
});

const StyledVote = styled(StyledFlexRow)({
  ".tooltip-children": {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
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
    ".tooltip-children": {
      alignItems: "flex-start",
      flexWrap: "wrap",
    },

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
