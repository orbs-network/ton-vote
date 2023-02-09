import { styled, Typography } from "@mui/material";
import { Button, Container, Link, NumberDisplay } from "components";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { makeElipsisAddress } from "utils";
import { TONSCAN, TONSCAN_ADDRESS_URL } from "config";
import { Vote } from "types";
import { useStateQuery } from "queries";
import { useConnectionStore, useVotesPaginationStore } from "store";

export function VotesLayout() {
  const {isLoading, data} = useStateQuery()
  
    const votes = data?.votes;
  const { showMoreVotes, votesViewLimit } = useVotesPaginationStore();
  const hideLoadMore = (votes?.length || 0) <= votesViewLimit;  

  return (
    <StyledContainer title="Recent votes" loading={isLoading} loaderAmount={3}>
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
  const { address, votingPower, vote, hash } = data;
  
  const connectedAddress = useConnectionStore().address;

  return (
    <StyledVote justifyContent="flex-start">
      <Link className="address" href={`${TONSCAN}/tx/${hash}`}>
        {connectedAddress === address ? "You" : makeElipsisAddress(address, 5)}
      </Link>
      <Typography className="vote">{vote}</Typography>
      <Typography className="voting-power">
        <NumberDisplay value={votingPower} /> TON
      </Typography>
    </StyledVote>
  );
};


const StyledNoVotes = styled(Typography)({
  textAlign:'center',
  fontSize: 17,
  fontWeight: 600
})

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
    display: "flex",
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
});
