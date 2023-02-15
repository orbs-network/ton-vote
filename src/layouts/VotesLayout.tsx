import { Chip, styled, Typography } from "@mui/material";
import { AppTooltip, Button, Container, Link } from "components";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { makeElipsisAddress, nFormatter } from "utils";
import { TONSCAN } from "config";
import { Vote } from "types";
import { useStateQuery } from "queries";
import { useConnectionStore, useVotesPaginationStore } from "store";
import { fromNano } from "ton";
import { useMemo } from "react";
import moment from "moment";
import _ from "lodash";


const ContainerHeader = () => {
  const data = useStateQuery().data;
  const totalTonAmount = data?.proposalResults?.totalWeight || '0';
  const votesLength = _.size(data?.votes)

  const tonAmount = useMemo(() => {
    return nFormatter(Number(fromNano(totalTonAmount)));
  }, [totalTonAmount]);

   const totalVotes = useMemo(() => {
     return nFormatter(votesLength);
   }, [votesLength]);

  return (
    <StyledContainerHeader>
      <StyledChip label={`${totalVotes} votes`} />
      <Typography style={{ fontWeight: 600 }}>{tonAmount} TON</Typography>
    </StyledContainerHeader>
  );
};

const StyledContainerHeader = styled(StyledFlexRow)({
  flex:1,
  justifyContent:'space-between'
});

export function VotesLayout() {
  const { isLoading, data } = useStateQuery();

  const votes = data?.votes;
  const { showMoreVotes, votesViewLimit } = useVotesPaginationStore();
  const hideLoadMore = (votes?.length || 0) <= votesViewLimit;

  return (
    <StyledContainer
      title="Recent votes"
      loading={isLoading}
      loaderAmount={3}
      headerChildren={<ContainerHeader />}
    >
      {votes?.length ? (
        <StyledList gap={15}>
          {votes?.map((vote, index) => {
            if (index >= votesViewLimit) return null;
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

const VoteComponent = ({ data }: { data: Vote }) => {
  const { address, votingPower, vote, hash, timestamp } = data;

  const connectedAddress = useConnectionStore().address;

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

const StyledLoaderMore = styled(StyledFlexRow)({
  marginTop: 30,
  button: {
    width: 160,
  },
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
    ".date": {

    },  
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
