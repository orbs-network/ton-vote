import { useProposalTimeline } from "pages/dao/hooks";
import { StyledTime } from "../styles";

export const ProposalTimeline = ({ address }: { address?: string }) => {
  const value = useProposalTimeline(address);

  return <StyledTime>{value}</StyledTime>;
};
