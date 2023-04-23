import { Chip, Link, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { Button, LoadingContainer, Progress, TitleContainer } from "components";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { AiFillCloseCircle } from "react-icons/ai";
import { useEffect, useMemo, useState } from "react";
import { calculateTonAmount, getSymbol, nFormatter } from "utils";
import { VERIFY_LINK } from "config";
import _ from "lodash";
import { useVerifyProposalResults } from "./hooks";
import { Vote } from "types";
import { useProposalAddress } from "hooks";
import { useLatestMaxLtAfterTx } from "./store";
import { ProposalResult, VotingPowerStrategy } from "ton-vote-sdk";
import { EndpointPopup } from "./EndpointPopup";

export const Results = ({
  proposalResult,
  dataUpdatedAt,
  isLoading,
  votes,
  votingPowerStrategy,
}: {
  proposalResult?: ProposalResult;
  dataUpdatedAt?: number;
  isLoading: boolean;
  votes?: Vote[];
  votingPowerStrategy?: VotingPowerStrategy;
}) => {
  const symbol = getSymbol(votingPowerStrategy);

  const votesCount = useMemo(() => {
    const grouped = _.groupBy(votes, "vote");

  

    return {
      yes: nFormatter(_.size(grouped.Yes)),
      no: nFormatter(_.size(grouped.No)),
      abstain: nFormatter(_.size(grouped.Abstain)),
    };
  }, [dataUpdatedAt]);

    const hideVerify =
      !proposalResult?.totalWeight || Number(proposalResult?.totalWeight) === 0;

  if (isLoading) {
    return <LoadingContainer />;
  }
  return (
    <StyledResults title="Results">
      <StyledFlexColumn gap={15}>
        <ResultRow
          symbol={symbol}
          name="Yes"
          percent={proposalResult?.yes || 0}
          tonAmount={calculateTonAmount(
            proposalResult?.yes,
            proposalResult?.totalWeight
          )}
          votes={votesCount.yes}
        />
        <ResultRow
          symbol={symbol}
          name="No"
          percent={proposalResult?.no || 0}
          tonAmount={calculateTonAmount(
            proposalResult?.no,
            proposalResult?.totalWeight
          )}
          votes={votesCount.no}
        />
        <ResultRow
          symbol={symbol}
          name="Abstain"
          percent={proposalResult?.abstain || 0}
          tonAmount={calculateTonAmount(
            proposalResult?.abstain,
            proposalResult?.totalWeight
          )}
          votes={votesCount.abstain}
        />
      </StyledFlexColumn>
      {!hideVerify && <VerifyResults />}
    </StyledResults>
  );
};

const ResultRow = ({
  name,
  percent = 0,
  tonAmount = "0",
  votes,
  symbol,
}: {
  name: string;
  percent?: number;
  tonAmount?: string;
  votes: string;
  symbol?: string | null;
}) => {
  return (
    <StyledResultRow>
      <StyledFlexRow justifyContent="space-between" width="100%">
        <StyledFlexRow style={{ width: "fit-content" }}>
          <Typography>{name}</Typography>
          <StyledChip label={`${votes} votes`} />
        </StyledFlexRow>

        <StyledResultRowRight justifyContent="flex-end">
          {symbol && (
            <Typography fontSize={13}>
              {tonAmount} {symbol}
            </Typography>
          )}

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

const StyledResults = styled(TitleContainer)({
  width: "100%",
});

export function VerifyResults() {
  const proposalAddress = useProposalAddress();
  const {
    mutate: verify,
    isLoading,
    reset,
    error,
    isSuccess,
  } = useVerifyProposalResults();

  const [open, setOpen] = useState(false);

  const latestMaxLtAfterTx = useLatestMaxLtAfterTx(proposalAddress);

  useEffect(() => {
    if (isSuccess && latestMaxLtAfterTx) {
      reset();
    }
  }, [latestMaxLtAfterTx, isSuccess]);

  return (
    <StyledVerifyContainer>
      <StyledVerifyText>
        Download votes from chain and verify the results in browser.{" "}
        <Link href={VERIFY_LINK} target="_blank">
          Read more.
        </Link>
      </StyledVerifyText>
      <EndpointPopup
        onSubmit={verify}
        open={open}
        onClose={() => setOpen(false)}
      />
      {isSuccess ? (
        <StyledButton>
          <StyledFlexRow>
            <Typography>Verified</Typography>
            <BsFillCheckCircleFill />
          </StyledFlexRow>
        </StyledButton>
      ) : error ? (
        <StyledButton onClick={() => setOpen(true)}>
          <StyledFlexRow>
            <Typography>Not Verified</Typography>
            <AiFillCloseCircle />
          </StyledFlexRow>
        </StyledButton>
      ) : (
        <StyledButton onClick={() => setOpen(true)} isLoading={isLoading}>
          <Typography>Verify results</Typography>
        </StyledButton>
      )}
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

const StyledButton = styled(Button)({
  height: 40,
  minWidth: 180,
  "*": {
    fontSize: 15,
  },
  svg: {
    width: 18,
    height: 18,
    position: "relative",
    top: -1,
  },
  ".loader": {
    maxWidth: 20,
    maxHeight: 20,
  },
});
