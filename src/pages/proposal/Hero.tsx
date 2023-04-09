import { Container } from "components";
import { Chip, Fade, Link, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn } from "styles";
import { useProposalAddress } from "hooks";
import { getProposalStatusText } from "utils";
import { useProposalStatusQuery } from "query/queries";

export function Hero() {

  const title = 'Title'
  const description = 'Description'
  return (
    <StyledContainer
      title={title}
      headerChildren={<VoteEndedChip />}
      loading={false}
    >
      <StyledFlexColumn alignItems="flex-start">
        <Typography>{description}</Typography>
        {/* <Typography>
          Tokenomics proposal to achieve community consensus on circulating
          supply of TON. Proposal for a 48 month temporary freeze of inactive
          mining wallets, which have never been activated and do not have any
          outgoing transfer in their history.
        </Typography>

        <AnimateHeight height={showMore ? "auto" : 0} duration={400}>
          <ShowMorePart />
        </AnimateHeight>
        <StyledShowMore onClick={() => setShowMore(!showMore)}>
          <Typography>{showMore ? "Show less" : "Show more"}</Typography>
        </StyledShowMore> */}
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const VoteEndedChip = () => {
    const proposalAddress = useProposalAddress();

  const proposalStatus = useProposalStatusQuery(proposalAddress);

  const label = getProposalStatusText(proposalStatus);

  return (
    <Fade in={!!label}>
      <StyledVoteEnded label={label} variant="filled" color="primary" />
    </Fade>
  );
};

const StyledVoteEnded = styled(Chip)({
  fontWeight: 700,
  fontSize: 12,
});

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
