import { styled, Typography } from "@mui/material";
import { useAllVotesQuery } from "queries";
import { Container, Link } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { makeElipsisAddress } from "utils";
import { useAccountAddress } from "store/wallet-store";

const title = "Votes";
export function VotesLayout() {
  const votes: any = useAllVotesQuery();

  if (!votes) {
    return (
      <StyledContainer>
        <Typography>Loading...</Typography>
      </StyledContainer>
    );
  }
  return (
    <StyledContainer title={title}>
      <StyledList gap={15}>
        {Object.keys(votes).map(function (key, index) {
          return <Vote vote={votes[key]} key={key} address={key} />;
        })}
      </StyledList>
    </StyledContainer>
  );
}

const Vote = ({ address, vote }: { address: string; vote: string }) => {
  const connectedAddress = useAccountAddress();

  return (
    <StyledVote justifyContent="space-between">
      <Link className="link" href="/">
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
  // maxHeight: 400,
  // overflow:'auto',
  paddingRight: 20,
});

const StyledContainer = styled(Container)({
  paddingRight: 0,
});
