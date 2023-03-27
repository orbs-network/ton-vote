import { Chip, Link, Typography } from "@mui/material";
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

const useVotesCount = () => {
  const votes = useStateQuery().data?.votes;
  const updated = useStateQuery().dataUpdatedAt;

  return useMemo(() => {
    const grouped = _.groupBy(votes, "vote");

    return {
      yes: nFormatter(_.size(grouped.Yes)),
      no: nFormatter(_.size(grouped.No)),
      abstain: nFormatter(_.size(grouped.Abstain)),
    };
  }, [updated]);
};

const calculateTonAmount = (percent?: number, total?: string) => {
  if (!percent || !total) return;
  const result = (Number(fromNano(total)) * percent) / 100;
  return nFormatter(result, 2);
};

export const ResultsLayout = () => {
  const { data, isLoading } = useStateQuery();
  const results = data?.proposalResults as any || {};

  
  const [showAll, setShowAll] = useState(false)

  const votesCount = useVotesCount();



  return (
    <StyledResults title="Results" loaderAmount={3} loading={isLoading}>
      <StyledFlexColumn gap={30}>
        <StyledFlexColumn gap={15}>
          {VOTE_OPTIONS.map((option, index) => {
            if (!showAll && index > 2) return null;
            const _option = option.toString();
            return (
              <ResultRow
                key={_option}
                name={_option}
                percent={results[_option] || 0}
                tonAmount={calculateTonAmount(
                  results[_option as any],
                  results?.totalPower
                )}
                votes={votesCount.yes}
              />
            );
          })}
        </StyledFlexColumn>
        <Button onClick={() => setShowAll(true)}>Show more</Button>
      </StyledFlexColumn>
     
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
    const maxLt = fetchFromServer ? serverMaxLt : contractMaxLt;
    const { allTxns } = await getTransactions(clientV2);
    const transactions = filterTxByTimestamp(allTxns, maxLt);

    const contractState = await getContractState(proposalInfo!, transactions);

    const proposalResults = contractState.proposalResults;

    Logger({ currentResults, proposalResults });

    // const yes = compare(currentResults?.yes, proposalResults.yes);

    // const no = compare(currentResults?.no, proposalResults.no);
    // const totalWeight = compare(
    //   currentResults?.totalWeight,
    //   proposalResults.totalWeight
    // );
    // const abstain = compare(currentResults?.abstain, proposalResults.abstain);

    // return yes && no && abstain && totalWeight;
    return false
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
