import { Typography } from "@mui/material";
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
import { useClientStore, useContractStore, useServerStore } from "store";
import { useGetContractState } from "hooks";
import { useEffect } from "react";
import { Logger } from "utils";

export const ResultsLayout = () => {
  const { data, isLoading } = useStateQuery();
  const results = data?.proposalResults;

  return (
    <StyledResults
      title="Results"
      loaderAmount={3}
      loading={isLoading}
      headerChildren={<VerifyResults />}
    >
      <StyledFlexColumn>
        <ResultRow name="Yes" percent={results?.yes || 0} />
        <ResultRow name="No" percent={results?.no || 0} />
        <ResultRow name="Abstain" percent={results?.abstain || 0} />
      </StyledFlexColumn>
    </StyledResults>
  );
};

const ResultRow = ({
  name,
  percent = 0,
}: {
  name: string;
  percent?: number;
}) => {
  return (
    <StyledResultRow>
      <StyledFlexRow justifyContent="space-between" width="100%">
        <Typography>{name}</Typography>
        <Typography>{percent}%</Typography>
      </StyledFlexRow>
      <Progress progress={percent} />
    </StyledResultRow>
  );
};

const StyledResultRow = styled(StyledFlexColumn)({
  gap: 5,
  fontWeight: 600,
  p: {
    fontWeight: "inherit",
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
    const maxLt = fetchFromServer ? serverMaxLt : contractMaxLt;
    const { allTxns } = await getTransactions(clientV2);
    const transactions = filterTxByTimestamp(allTxns, maxLt);

    const contractState = await getContractState(proposalInfo!, transactions);

    const proposalResults = contractState.proposalResults;

    Logger({ currentResults, proposalResults });

    const yes = compare(currentResults?.yes, proposalResults.yes);

    const no = compare(currentResults?.no, proposalResults.no);
    const totalWeight = compare(
      currentResults?.totalWeight,
      proposalResults.totalWeight
    );
    const abstain = compare(currentResults?.abstain, proposalResults.abstain);

    return yes && no && abstain && totalWeight;
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
    const { dataUpdatedAt } = useStateQuery();

  useEffect(() => {
    if (isVerified) {
      reset();
    }
  }, [dataUpdatedAt]);

  if (!isReady) return null;
  if (isVerified) {
    return (
      <StyledVerified>
        <StyledVerifiedButton>
          <Typography>Verified</Typography>
          <BsFillCheckCircleFill />
        </StyledVerifiedButton>
      </StyledVerified>
    );
  }

  return (
    <StyledVerifyContainer>
      <StyledVerifyButton isLoading={isLoading} onClick={verify}>
        <Typography>Verify</Typography>
      </StyledVerifyButton>
    </StyledVerifyContainer>
  );
}

const StyledVerifyContainer = styled(StyledFlexRow)({
  width: "fit-content",
});

const StyledVerified = styled(StyledVerifyContainer)(({ theme }) => ({
  svg: {
    fill: "white",
  },
}));

const StyledVerifyButton = styled(Button)({
  height: 32,
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
