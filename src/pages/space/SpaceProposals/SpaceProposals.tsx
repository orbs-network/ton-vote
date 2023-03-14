import { Fade } from "@mui/material";
import { FadeElement, LoadMore } from "components";
import _ from "lodash";
import React, { Fragment } from "react";
import { useParams } from "react-router-dom";
import { StyledFlexColumn } from "styles";
import { ProposalComponent } from "./Proposal";
import { useGetProposalsQuery } from "../query";
import { StyledLoader, StyledProposalsContainer } from "./styles";

export function SpaceProposals() {
  const { spaceId } = useParams();

  const { data, fetchNextPage, isLoading, isFetchingNextPage } =
    useGetProposalsQuery(spaceId);

  const loadMoreOnScroll = data?.pages && data?.pages.length > 1;
  return (
    <FadeElement>
      <StyledProposalsContainer title="Proposals">
        <StyledFlexColumn gap={70}>
          <StyledFlexColumn gap={20}>
            {isLoading ? (
              <Loader />
            ) : (
              data?.pages.map((page) => {
                return (
                  <Fragment key={page.nextPage}>
                    {page.proposals?.map((proposal) => {
                      return (
                        <ProposalComponent
                          proposal={proposal}
                          key={proposal.title}
                        />
                      );
                    })}
                  </Fragment>
                );
              })
            )}
          </StyledFlexColumn>
          <LoadMore
            hide={isLoading}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            loadMoreOnScroll={!!loadMoreOnScroll}
          />
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
