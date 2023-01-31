import { styled, Typography } from "@mui/material";
import { useDataQuery, useNextPage } from "queries";
import { Button, Container, Link } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { makeElipsisAddress } from "utils";
import { useWalletAddress } from "store/wallet-store";
import { TONSCAN_ADDRESS_URL } from "config";
import AnimateHeight from "react-animate-height";



export function VotesLayout() {
  const votes = useDataQuery().data?.votes
  
  const isLoading = !votes || !votes?.length;
  return (
    <StyledContainer title="Votes" loading={isLoading} loaderAmount={3}>
      {votes && (
        <StyledList gap={15}>
          {votes?.map((vote) => {
            return (
              <Vote
                vote={vote.vote}
                key={vote.address}
                address={vote.address}
              />
            );
          })}
          <LoadMoreButton />
        </StyledList>
      )}
    </StyledContainer>
  );
}

const Vote = ({ address, vote }: { address: string; vote: string }) => {
  const connectedAddress = useWalletAddress();

  return (
    <StyledVote justifyContent="space-between">
      <Link className="link" href={`${TONSCAN_ADDRESS_URL}/${address}`}>
        {connectedAddress === address ? "You" : makeElipsisAddress(address, 12)}
      </Link>
      <Typography>{vote}</Typography>
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
}

const StyledLoaderMore = styled(StyledFlexRow)({
  marginTop: 20,
  button:{
    width: 160
  }
})

const StyledVote = styled(StyledFlexRow)({
  borderBottom: "0.5px solid rgba(114, 138, 150, 0.16)",
  paddingBottom: 10,
  gap: 10,
  "&:last-of-type": {
    borderBottom: "unset",
  },

  "@media (max-width: 850px)": {
    flexDirection: "column",
    alignItems: "flex-start",

    ".link": {
      width: "100%",
    },
  },
});

const StyledList = styled(StyledFlexColumn)({
  paddingRight: 20,
});

const StyledContainer = styled(Container)({
  paddingRight: 0,
});
