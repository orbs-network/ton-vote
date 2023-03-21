import { Chip, Link, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { Button, Container, Progress } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { useEffect } from "react";
import { nFormatter } from "utils";
import { VERIFY_LINK } from "config";
import { fromNano } from "ton";
import _ from "lodash";
import {
  useLatestMaxLtAfterTx,
  useProposalResults,
  useProposalVotesCount,
  useVerifyProposalResults,
  useProposalStatus,
} from "./hooks";
import { ProposalStatus } from "types";

const calculateTonAmount = (percent?: number, total?: string) => {
  if (!percent || !total) return;
  const result = (Number(fromNano(total)) * percent) / 100;
  return nFormatter(result, 2);
};

export const Results = () => {
  const { proposalResults, isLoading } = useProposalResults();

  const votesCount = useProposalVotesCount();

  return (
    <StyledResults title="Results" loaderAmount={3} loading={isLoading}>
      <StyledFlexColumn gap={15}>
        <ResultRow
          name="Yes"
          percent={proposalResults?.yes || 0}
          tonAmount={calculateTonAmount(
            proposalResults?.yes,
            proposalResults?.totalWeight
          )}
          votes={votesCount.yes}
        />
        <ResultRow
          name="No"
          percent={proposalResults?.no || 0}
          tonAmount={calculateTonAmount(
            proposalResults?.no,
            proposalResults?.totalWeight
          )}
          votes={votesCount.no}
        />
        <ResultRow
          name="Abstain"
          percent={proposalResults?.abstain || 0}
          tonAmount={calculateTonAmount(
            proposalResults?.abstain,
            proposalResults?.totalWeight
          )}
          votes={votesCount.abstain}
        />
      </StyledFlexColumn>
      <VerifyResults />
    </StyledResults>
  );
};

const ResultRow = ({
  name,
  percent = 0,
  tonAmount = "0",
  votes,
}: {
  name: string;
  percent?: number;
  tonAmount?: string;
  votes: string;
}) => {
  return (
    <StyledResultRow>
      <StyledFlexRow justifyContent="space-between" width="100%">
        <StyledFlexRow style={{ width: "fit-content" }}>
          <Typography>{name}</Typography>
          <StyledChip label={`${votes} votes`} />
        </StyledFlexRow>

        <StyledResultRowRight justifyContent="flex-end">
          <Typography fontSize={13}>{tonAmount} TON</Typography>

          <Typography className="percent">{percent}%</Typography>
        </StyledResultRowRight>
      </StyledFlexRow>
      <Progress progress={percent} />
    </StyledResultRow>
  );
};

const StyledChip = styled(Chip)({
  fontSize: 11,
  height: 25,
  ".MuiChip-label": {
    paddingLeft: 10,
    paddingRight: 10,
  },
});

const StyledResultRowRight = styled(StyledFlexRow)({
  flex: 1,
});

const StyledResultRow = styled(StyledFlexColumn)({
  gap: 5,
  fontWeight: 600,
  p: {
    fontWeight: "inherit",
  },
  ".percent": {
    fontSize: 14,
  },
});

const StyledResults = styled(Container)({
  width: "100%",
});

export function VerifyResults() {
  const {
    mutate: verify,
    isLoading,
    data: isVerified,
    isReady,
    reset,
  } = useVerifyProposalResults();
  const proposalStatus = useProposalStatus();

  const { latestMaxLtAfterTx } = useLatestMaxLtAfterTx();

  useEffect(() => {
    if (isVerified && latestMaxLtAfterTx) {
      reset();
    }
  }, [latestMaxLtAfterTx]);

  if (proposalStatus !== ProposalStatus.ACTIVE) return null;

  const component = () => {
    if (!isReady) return null;
    if (isVerified) {
      return (
        <StyledVerifiedButton>
          <Typography>Verified</Typography>
          <BsFillCheckCircleFill />
        </StyledVerifiedButton>
      );
    }

    return (
      <StyledVerifyButton isLoading={isLoading} onClick={verify}>
        <Typography>Verify</Typography>
      </StyledVerifyButton>
    );
  };
  return (
    <StyledVerifyContainer>
      <StyledVerifyText>
        Download votes from chain and verify the results in browser.{" "}
        <Link href={VERIFY_LINK} target="_blank">
          Read more.
        </Link>
      </StyledVerifyText>
      {component()}
    </StyledVerifyContainer>
  );
}

const StyledVerifyContainer = styled(StyledFlexColumn)(({ theme }) => ({
  marginTop: 30,
  justifyContent: "center",
  width: "100%",
  gap: 15,
}));

const StyledVerifyText = styled(Typography)({
  fontWeight: 500,
});

const StyledVerifyButton = styled(Button)({
  height: 40,
  minWidth: 180,
  "*": {
    fontSize: 15,
  },
  ".loader": {
    maxWidth: 20,
    maxHeight: 20,
  },
});

const StyledVerifiedButton = styled(StyledVerifyButton)({
  cursor: "unset",
  ".children": {
    gap: 10,
  },
});
