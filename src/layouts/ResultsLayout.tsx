import { Typography } from "@mui/material";
import { styled } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Button, Container, Progress } from "components";
import {
  getTransactions,
  filterTxByTimestamp,
  getCurrentResults,
} from "contracts-api/logic";
import {
  useContractAddressQuery,
  useIsFetchFromServer,
  useProposalInfoQuery,
  useStateQuery,
} from "queries";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { useClientStore, useContractStore, useServerStore } from "store";
import { useGetContractState } from "hooks";

export const ResultsLayout = () => {
  const { data, isLoading } = useStateQuery();
  const results = data?.proposalResults;

  return (
    <StyledResults title="Results" loaderAmount={3} loading={isLoading}>
      <StyledFlexColumn>
        <ResultRow name="Yes" percent={results?.yes || 0} />
        <ResultRow name="No" percent={results?.no || 0} />
        <ResultRow name="Abstain" percent={results?.abstain || 0} />
        <VerifyResults />
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

const useVerify = () => {
  const currentResults = useStateQuery().data?.proposalResults;
  const proposalInfo = useProposalInfoQuery().data;
  const clientV2 = useClientStore().clientV2;
  const contractAddress = useContractAddressQuery().data;
  const contractMaxLt = useContractStore().contractMaxLt;
  const fetchFromServer = useIsFetchFromServer();
  const serverMaxLt = useServerStore().serverMaxLt;
  const getContractState = useGetContractState();

  const query = useMutation(async () => {
    const result = await getTransactions(clientV2, contractAddress);
    const maxLt = fetchFromServer ? serverMaxLt : contractMaxLt;

    const transactions = filterTxByTimestamp(result.allTxns, maxLt);
    const contractState = await getContractState(proposalInfo!, transactions);
    const proposalResults = contractState.proposalResults;
    const yes = currentResults?.yes === proposalResults.yes;
    const no = currentResults?.no === proposalResults.no;
    const totalWeight =
      currentResults?.totalWeight === proposalResults.totalWeight;
    const abstain = currentResults?.abstain === proposalResults.abstain;

    return yes && no && abstain && totalWeight;
  });

  return {
    ...query,
    isReady: !!currentResults,
  };
};

export function VerifyResults() {
  const { mutate: verify, isLoading, data: isVerified, isReady } = useVerify();

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
  marginTop: 30,
});

const StyledVerified = styled(StyledVerifyContainer)(({ theme }) => ({
  svg: {
    fill: "white",
  },
}));

const StyledVerifyButton = styled(Button)({
  maxWidth: 200,
  width: "100%",
});

const StyledVerifiedButton = styled(StyledVerifyButton)({
  cursor: "unset",
  ".children": {
    gap: 10,
  },
});
