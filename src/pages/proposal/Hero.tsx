import { Container, Img } from "components";
import { Chip, Fade, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn, StyledFlexRow, textOverflow } from "styles";
import {
  getProposalStatusText,
  getTonScanContractUrl,
  makeElipsisAddress,
} from "utils";
import { useDaoQuery, useProposalStatusQuery } from "query/queries";
import { useProposalState } from "./hooks";
import { useDaoAddress, useProposalAddress } from "hooks";
import { Link } from "react-router-dom";
import { appNavigation } from "router";

export function Hero() {
  const title = "Title";
  const description = "Description";
  const isLoading = useProposalState().isLoading;

  return (
    <StyledContainer
      title={title}
      loading={isLoading}
      loaderAmount={5}
      headerChildren={<StatusChip />}
    >
      <StyledFlexColumn alignItems="flex-start">
        <ProposalOwner />
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

const ProposalOwner = () => {
  const daoAddress = useDaoAddress();
  const proposalMetadata = useProposalState().data?.proposalMetadata;
  const dao = useDaoQuery(daoAddress);

  return (
    <StyledProposalOwner justifyContent="flex-start">
      <StyledDaoImg src={dao.data?.daoMetadata.avatar} />
      <StyledFlexRow gap={0} justifyContent="flex-start" style={{ flex: 1 }}>
        <Link to={appNavigation.daoPage.root(daoAddress)} className="dao-name">
          {dao.data?.daoMetadata.name}
        </Link>
        {proposalMetadata?.owner && (
          <StyledLink href={getTonScanContractUrl(proposalMetadata?.owner)}>
            by {makeElipsisAddress(proposalMetadata?.owner, 6)}
          </StyledLink>
        )}
      </StyledFlexRow>
    </StyledProposalOwner>
  );
};

const StatusChip = () => {
  const proposalAddress = useProposalAddress();
  const proposalMetadata = useProposalState().data?.proposalMetadata;

  const proposalStatus = useProposalStatusQuery(
    proposalMetadata,
    proposalAddress
  );

  return (
    <StyledVoteTimeline
      label={getProposalStatusText(proposalStatus)}
      variant="filled"
      color="primary"
    />
  );
};

const StyledLink = styled("a")({
  width: "unset",
  marginLeft: 5,
});

const StyledDaoImg = styled(Img)({
  width: 30,
  height: 30,
  borderRadius: "50%",
});

const StyledProposalOwner = styled(StyledFlexRow)({
  "*": {
    textDecoration: "unset",
    color: "unset",
    fontWeight: 600,
  },
  a: {
    ...textOverflow,
  },
  ".dao-name": {
   maxWidth: 200
  },
});

const StyledVoteTimeline = styled(Chip)({
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
