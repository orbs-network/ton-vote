import { Fade } from "@mui/material";
import { FadeElement } from "components";
import { useDaoId } from "hooks";
import _ from "lodash";
import { StyledFlexColumn } from "styles";
import { useDaoProposalsQuery } from "../query";
import { ProposalComponent } from "./Proposal";
import { StyledLoader, StyledProposalsContainer } from "./styles";

export function SpaceProposals() {

  const { data: daoProposals, isLoading } = useDaoProposalsQuery();

  return (
    <FadeElement>
      <StyledProposalsContainer title="Proposals">
        <StyledFlexColumn gap={70}>
          <StyledFlexColumn gap={20}>
            {isLoading ? (
              <Loader />
            ) : (
              daoProposals?.map((proposal) => {
                return (
                  <ProposalComponent proposal={proposal} key={proposal.title} />
                );
              })
            )}
          </StyledFlexColumn>
        </StyledFlexColumn>
      </StyledProposalsContainer>
    </FadeElement>
  );
}

const Loader = () => {
  return (
    <StyledFlexColumn gap={20}>
      {_.range(0, 3).map((it, i) => {
        return <StyledLoader key={i} />;
      })}
    </StyledFlexColumn>
  );
};
