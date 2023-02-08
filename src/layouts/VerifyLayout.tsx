import { styled, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Button, Container } from "components";
import { filterTxByTimestamp, getTransactions } from "contracts-api/logic";
import {
  useContractAddressQuery,
  useGetContractState,
  useStateQuery,
} from "queries";
import { useClient, useTransactionsStore } from "store";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import {BsFillCheckCircleFill} from 'react-icons/bs'
const useVerify = () => {
  const currentResults = useStateQuery().data?.proposalResults;
  const getContractState = useGetContractState();
  const clientV2 = useClient().clientV2;
  const contractAddress = useContractAddressQuery().data;
  const { transactions } = useTransactionsStore();

  const query =  useMutation(async () => {
    const result = await getTransactions(clientV2, contractAddress);
    console.log(result);

    const allTxns = filterTxByTimestamp(result.allTxns, transactions[0].time);
    const state = await getContractState(allTxns);
    const results = state.proposalResults;

    const yes = currentResults?.yes === results.yes;
    const no = currentResults?.no === results.no;
    const totalWeight = currentResults?.totalWeight === results.totalWeight;
    const abstain = currentResults?.abstain === results.abstain;

    return yes && no && abstain && totalWeight;
  });

  return {
    ...query,
    isReady: !!currentResults,
  };
};

function VerifyLayout() {
  const { mutate: verify, isLoading, data: isVerified, isReady } = useVerify();

  if (!isReady) return null
    if (isVerified) {
      return (
        <StyledContainer title="Verify Results">
          <StyledFlexColumn>
            <StyledVerified>
              <Typography>Verified</Typography>
              <BsFillCheckCircleFill />
            </StyledVerified>
          </StyledFlexColumn>
        </StyledContainer>
      );
    }

    return (
      <StyledContainer title="Verify Results">
        <StyledFlexColumn>
          <StyledButton isLoading={isLoading} onClick={verify}>
            Verfiy
          </StyledButton>
        </StyledFlexColumn>
      </StyledContainer>
    );
}

export default VerifyLayout;

const StyledVerified = styled(StyledFlexRow)(({ theme }) => ({
  svg: {
    fill: theme.palette.primary.main,
  },
}));

const StyledButton = styled(Button)({
    maxWidth: 200,
    width:'100%'
});

const StyledContainer = styled(Container)({
    alignItems:'center'
})