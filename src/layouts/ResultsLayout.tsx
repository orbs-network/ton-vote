import { Box, Chip, Fade, Link, Typography } from "@mui/material";
import { styled } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Button, Container, Progress } from "components";
import { getTransactions, filterTxByTimestamp } from "contracts-api/logic";
import {
  useIsFetchFromServer,
  useProposalInfoQuery,
  useStateQuery,
} from "queries";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { BsFillCheckCircleFill } from "react-icons/bs";
import {
  useClientStore,
  useContractStore,
  usePersistedStore,
  useServerStore,
} from "store";
import { useGetContractState, useVoteTimeline } from "hooks";
import { useEffect, useMemo, useState } from "react";
import { Logger, nFormatter } from "utils";
import { VERIFY_LINK, VOTE_OPTIONS } from "config";
import analytics from "analytics";
import { fromNano } from "ton";
import _ from "lodash";
import BigNumber from "bignumber.js";

const useVotesCount = () => {
  const votes = useStateQuery().data?.votes;
  const updated = useStateQuery().dataUpdatedAt;

  return useMemo(() => {
    const _votes = _.flatten(_.map(votes, (vote) => vote.vote));
    return _.countBy(_votes);
  }, [updated]);
};

const calculateTonAmount = (percent?: number, totalPower?: BigNumber) => {
  if (!percent || !totalPower) return;
  const result = (Number(fromNano(totalPower.toNumber())) * percent) / 100;
  return nFormatter(result, 2);
};

export const ResultsLayout = () => {
  const { data, isLoading, dataUpdatedAt } = useStateQuery();
  const results = data?.proposalResults.proposalResult || {};
  const totalPower = data?.proposalResults.totalPower;
  const [showAll, setShowAll] = useState(false);

  const votesCount = useVotesCount();

  const sortedList = useMemo(() => {
    const mapped = _.map(VOTE_OPTIONS, (option) => ({
      option,
      value: results[option as keyof {}],
    }));
    return _.sortBy(mapped, "value", "desc").reverse();
  }, [dataUpdatedAt]);

  return (
    <StyledResults title="Results" loaderAmount={3} loading={isLoading}>
      <StyledFlexColumn gap={0}>
        <StyledFlexColumn gap={15}>
          {sortedList.map((item, index) => {
            if (!showAll && index > 2) return null;
            return (
              <ResultRow
                key={item.option}
                name={item.option.toString()}
                percent={item.value || 0}
                tonAmount={calculateTonAmount(item.value, totalPower)}
                votes={nFormatter(votesCount[item.option], 2)}
              />
            );
          })}
        </StyledFlexColumn>
        {showAll ? (
          <StyledShowAllButton onClick={() => setShowAll(false)}>
            Show Less
          </StyledShowAllButton>
        ) : (
          <StyledShowAllButton onClick={() => setShowAll(true)}>
            Show more
          </StyledShowAllButton>
        )}
      </StyledFlexColumn>
      <VerifyResults />
    </StyledResults>
  );
};

const StyledShowAllButton = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: 14,
  fontWeight: 700,
  marginLeft: "auto",
  marginTop: 10,
  cursor: "pointer",
  borderBottom: "2px solid transparent",
  transition: "0.2s all",
  "&:hover": {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
}));

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

const compare = (first: any, second: any) => {
  const firstValue = isNaN(first) ? 0 : Number(first);
  const secondValue = isNaN(second) ? 0 : Number(second);

  return firstValue === secondValue;
};

const useVerify = () => {
  const currentResults = useStateQuery().data?.proposalResults;
  const proposalInfo = useProposalInfoQuery().data;
  const clientV2 = useClientStore().clientV2;
  const contractMaxLt = useContractStore().contractMaxLt;
  const fetchFromServer = useIsFetchFromServer();
  const serverMaxLt = useServerStore().serverMaxLt;
  const getContractState = useGetContractState();

  const query = useMutation(async () => {
    analytics.GA.verifyButtonClick();
    const maxLt =  fetchFromServer ? serverMaxLt : contractMaxLt;
    console.log({ maxLt, fetchFromServer });

    const { allTxns } = await getTransactions(clientV2);
    const transactions = filterTxByTimestamp(allTxns, maxLt);

    const contractState = await getContractState(proposalInfo!, transactions);

    const compareResults = contractState.proposalResults;

    Logger({
      currentResults: currentResults?.proposalResult,
      compareResults: compareResults.proposalResult,
    });

    const isVotesEqual = _.isEqual(
      currentResults?.proposalResult,
      compareResults.proposalResult
    );
    const isVotingPowerEqual = _.isEqual(
      compareResults.totalPower,
      compareResults.totalPower
    );

    return isVotesEqual && isVotingPowerEqual;
  });

  return {
    ...query,
    isReady: !!currentResults,
  };
};

export function VerifyResults() {
  const {
    mutate: verify,
    isLoading,
    data: isVerified,
    isReady,
    reset,
  } = useVerify();
  const voteStarted = useVoteTimeline()?.voteStarted;

  const maxLt = usePersistedStore().maxLt;
  useEffect(() => {
    if (isVerified && maxLt) {
      reset();
    }
  }, [maxLt]);

  if (!voteStarted) return null;

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
