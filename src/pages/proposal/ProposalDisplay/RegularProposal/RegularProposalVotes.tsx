import { styled } from "@mui/material";
import { LoadingContainer } from "components";
import _ from "lodash";
import { useAppParams } from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { Votes } from "../Components/Votes";

export function RegularProposalVotes() {
  const { proposalAddress } = useAppParams();
  const { data, isLoading, dataUpdatedAt } = useProposalQuery(proposalAddress);
   const totalWeight =
     data?.proposalResult?.totalWeight ||
     data?.proposalResult?.totalWeights ||
     "0";


  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <Votes
      totalWeight={totalWeight}
      votes={data?.votes || []}
      isLoading={isLoading}
      dataUpdatedAt={dataUpdatedAt}
    />
  );
}

