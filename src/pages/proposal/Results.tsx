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
import { useProposalPageStatus, useVerifyProposalResults } from "./hooks";
import { useProposalAddress } from "hooks";
import { EndpointPopup } from "./EndpointPopup";
import { useProposalPageQuery } from "./query";
import { ProposalStatus } from "types";

export const Results = () => {
  const { data, dataUpdatedAt, isLoading } = useProposalPageQuery(false);

  const proposalResult = data?.proposalResult;
  const votes = data?.votes;

  const votingPowerStrategy = data?.metadata?.votingPowerStrategy;
  const symbol = getSymbol(votingPowerStrategy);

  const votesCount = useMemo(() => {
    const grouped = _.groupBy(votes, "vote");

    return {
      yes: nFormatter(_.size(grouped.Yes)),
      no: nFormatter(_.size(grouped.No)),
      abstain: nFormatter(_.size(grouped.Abstain)),
    };
  }, [dataUpdatedAt]);

  const results = (proposalResult as any) || ({} as any);

  if (isLoading) {
    return <LoadingContainer />;
  }

 const showVerify = results.totalWeight != "0";
  return (
    <StyledResults title="Results">
      <StyledFlexColumn gap={15}>
        <ResultRow
          symbol={symbol}
          name={"Yes"}
          percent={results.yes || 0}
          tonAmount={calculateTonAmount(
            results.yes || 0,
            results?.totalWeight as string
          )}
          votes={votesCount.yes}
        />

        <ResultRow
          symbol={symbol}
          name={"No"}
          percent={results.no || 0}
          tonAmount={calculateTonAmount(
            results.no || 0,
            results?.totalWeight as string
          )}
          votes={votesCount.no}
        />
        <ResultRow
          symbol={symbol}
          name={"Abstain"}
          percent={results.abstain || 0}
          tonAmount={calculateTonAmount(
            results.abstain || 0,
            results?.totalWeight as string
          )}
          votes={votesCount.abstain}
        />

        {/* {proposalResult &&
          normalizeResults(proposalResult).map((item) => {
            const { title, percent } = item;

            return (
              <ResultRow
                symbol={symbol}
                name={title}
                percent={percent}
                tonAmount={calculateTonAmount(
                  percent,
                  proposalResult?.totalWeight as string
                )}
                votes={votesCount.yes}
              />
            );
          })} */}
      </StyledFlexColumn>
      {showVerify && <VerifyResults />}
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
          <Typography style={{ textTransform: "capitalize" }}>
            {name}
          </Typography>
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
  const {
    mutate: verify,
    isLoading,
    error,
    isSuccess,
    reset,
  } = useVerifyProposalResults();

  useEffect(() => {
    if (isSuccess || error) {
      setTimeout(() => {
        reset();
      }, 5_000);
    }
  }, [isSuccess, reset, error]);

  const [open, setOpen] = useState(false);

  const onClick = () => setOpen(true);

  return (
    <StyledVerifyContainer>
      <StyledVerifyText>
        Download votes from chain and verify the results in browser.{" "}
        <Link href={VERIFY_LINK} target="_blank">
          Read more
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
            <BsFillCheckCircleFill className="icon" />
          </StyledFlexRow>
        </StyledButton>
      ) : error ? (
        <StyledButton>
          <StyledFlexRow>
            <Typography>Not Verified</Typography>
            <AiFillCloseCircle className="icon" />
          </StyledFlexRow>
        </StyledButton>
      ) : (
        <StyledButton onClick={onClick} isLoading={isLoading}>
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
  a: {
    textDecoration:'unset'
  }
});

const StyledButton = styled(Button)({
  height: 40,
  minWidth: 180,
  "*": {
    fontSize: 15,
  },
  ".icon": {
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
