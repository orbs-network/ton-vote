import { styled, Typography } from "@mui/material";
import { useAllVotesQuery } from "queries";
import { Container, Link } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { makeElipsisAddress } from "utils";
import { useWalletAddress } from "store/wallet-store";
import { TONSCAN_ADDRESS_URL } from "config";

const sortVotes = (votes: any[], walletAddress: string) => {
  const index = votes!.findIndex((it) => it.address === walletAddress);
  if (index < 0) return votes;

  const selectedItem = votes?.splice(index, 1)[0];
  votes?.unshift(selectedItem);
  return votes;
};

export function VotesLayout() {
  const votes = useAllVotesQuery();
  const walletAddress = useWalletAddress();

  const sorted =
    !votes || !votes.length || !walletAddress
      ? votes
      : sortVotes(votes, walletAddress);

  return (
    <StyledContainer title="Votes" loading={!votes} loaderAmount={3}>
      {votes && (
        <StyledList gap={15}>
          {sorted?.map((vote) => {
            return (
              <Vote
                vote={vote.vote}
                key={vote.address}
                address={vote.address}
              />
            );
          })}
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
