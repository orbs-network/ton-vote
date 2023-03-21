import { Chip, Typography, styled, Fade } from "@mui/material";
import { Img } from "components";
import { useDaoId } from "hooks";
import { useDaoProposalMetadataQuery, useProposalInfoQuery } from "query";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Address } from "ton-core";
import { DaoProposal, DaoProposalMetadata, ProposalStatus } from "types";
import {
  getProposalStatus,
  makeElipsisAddress,
  getTimeDiff,
  nFormatter,
  getProposalStatusText,
} from "utils";
import {
  StyledProposal,
  StyledProposalContent,
  StyledProposalOwner,
  StyledProposalResult,
  StyledProposalResultContent,
  StyledProposalResultProgress,
} from "./styles";

const StyledDescription = styled(Typography)({
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
});

const StyledProfileImg = styled(Img)({
  width: 30,
  height: 30,
  borderRadius: "50%",
});

const Time = ({
  proposalInfo,
  status,
}: {
  proposalInfo: DaoProposal;
  status: ProposalStatus | null;
}) => {
  if (!status) return null;

  if (status === ProposalStatus.NOT_STARTED) {
    return (
      <Typography className="time-left">
        Start in {getTimeDiff(proposal.startDate)}
      </Typography>
    );
  }
  return (
    <Typography className="time-left">
      {getTimeDiff(proposal.endDate)} Left
    </Typography>
  );
};

export const ProposalComponent = ({ address }: { address: Address }) => {
  const { proposalPage } = useAppNavigation();
  const daoAddress = useDaoId();
  // const [height, setHeight] = useState(0);
  // const [ref, { entry }] = useIntersectionObserver();
  // const isVisible = !height ? true : entry && entry.isIntersecting;

  const { data: proposalMetadata } = useDaoProposalMetadataQuery(
    daoAddress,
    address.toString()
  );
  const { data: proposalInfo } = useProposalInfoQuery(address.toString());
  const status = getProposalStatus(
    Number(proposalInfo?.startTime),
    Number(proposalInfo?.endTime)
  );

  return (
    <Fade in={true}>
      <StyledProposal
        // style={{ height: height || "auto" }}
        onClick={() => proposalPage.root(daoAddress, address.toString())}
        // ref={ref}
      >
        <StyledProposalContent className="container">
          <StyledFlexRow justifyContent="space-between">
            <Typography className="title">{proposalMetadata?.title}</Typography>
            <Chip
              label={getProposalStatusText(status)}
              className="status"
              color="primary"
            />
          </StyledFlexRow>
          <StyledFlexColumn alignItems="flex-start">
            <StyledProposalOwner>
              {/* <StyledProfileImg src={proposal.ownerAvatar} /> */}
              <Typography>
                {makeElipsisAddress(proposalMetadata?.owner, 8)}
              </Typography>
            </StyledProposalOwner>
            <StyledDescription>
              {proposalMetadata?.description}
            </StyledDescription>
            <Time proposalInfo={proposalInfo} status={status} />
            <Results status={status} />
          </StyledFlexColumn>
        </StyledProposalContent>
      </StyledProposal>
    </Fade>
  );
};

const Results = ({ status }: { status: ProposalStatus | null }) => {
  if (status !== ProposalStatus.CLOSED) return null;
  return (
    <StyledFlexColumn gap={5}>
      <Result title="Yes" percent={10} tonAmount={20000} />
      <Result title="No" percent={30} tonAmount={20000} />
      <Result title="Abstain" percent={60} tonAmount={20000} />
    </StyledFlexColumn>
  );
};

const Result = ({
  title,
  percent,
  tonAmount,
}: {
  title: string;
  percent: number;
  tonAmount: number;
}) => {
  return (
    <StyledProposalResult>
      <StyledProposalResultProgress style={{ width: `${percent}%` }} />
      <StyledProposalResultContent>
        <StyledFlexRow justifyContent="flex-start">
          <Typography style={{ fontWeight: 700 }}>{title}</Typography>
          <Typography fontSize={13}>{nFormatter(tonAmount, 2)} TON</Typography>
        </StyledFlexRow>
        <Typography style={{ fontWeight: 700 }}>{percent}%</Typography>
      </StyledProposalResultContent>
    </StyledProposalResult>
  );
};
