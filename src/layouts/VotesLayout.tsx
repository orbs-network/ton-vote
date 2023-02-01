import { styled, Typography } from "@mui/material";
import { useDataQuery, useNextPage } from "queries";
import { Button, Container, Link, NumberDisplay } from "components";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import { makeElipsisAddress } from "utils";
import { useWalletAddress } from "store/wallet-store";
import { TONSCAN_ADDRESS_URL } from "config";
import AnimateHeight from "react-animate-height";
import { Vote } from "types";

export function VotesLayout() {
  const votes = useDataQuery().data?.votes;

  const isLoading = !votes || !votes?.length;
  return (
    <StyledContainer title="Votes" loading={isLoading} loaderAmount={3}>
      {votes && (
        <StyledList gap={15}>
          {votes?.map((vote) => {
            return <VoteComponent data={vote} key={vote.address} />;
          })}
        </StyledList>
      )}
      <LoadMoreButton />
    </StyledContainer>
  );
}

const VoteComponent = ({ data }: { data: Vote }) => {
  const { address, votingPower, vote } = data;
  const connectedAddress = useWalletAddress();

  return (
    <StyledVote justifyContent="flex-start">
      <Link className="address" href={`${TONSCAN_ADDRESS_URL}/${address}`}>
        {connectedAddress === address ? "You" : makeElipsisAddress(address, 5)}
      </Link>
      <Typography className="vote">{vote}</Typography>
      <Typography className="voting-power">
        <NumberDisplay value={votingPower} /> TON
      </Typography>
    </StyledVote>
  );
};

const LoadMoreButton = () => {
  const { loadMore, isLoading, hide } = useNextPage();

  return (
    <AnimateHeight height={hide ? 0 : "auto"} duration={200}>
      <StyledLoaderMore>
        <Button isLoading={isLoading} onClick={loadMore}>
          See More
        </Button>
      </StyledLoaderMore>
    </AnimateHeight>
  );
};

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
    display:'flex',
    gap:5,
    ".number-display": {
      ...textOverflow,
      flex:1
    }
  },

  "@media (max-width: 850px)": {
    alignItems: "flex-start",
    flexWrap:'wrap',

    ".address": {
     maxWidth: '60%',
    },
    ".vote":{
      flex:'unset',
      marginLeft:'auto'
    },
    ".voting-power":{
      width:'100%',
      textAlign:'left',
      justifyContent:'flex-start',
      ".number-display ":{
        flex:'unset',
        maxWidth:'70%'
      }
    }
  },
});

const StyledList = styled(StyledFlexColumn)({
});

const StyledContainer = styled(Container)({
  paddingBottom: 30
});
