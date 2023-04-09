import { Typography } from "@mui/material";
import { Button, Container, List, Loader, LoadMore } from "components";
import _ from "lodash";
import { useDaoMetadataQuery, useDaosQuery } from "query/queries";
import { ReactNode } from "react";
import { useAppNavigation } from "router";
import { StyledFlexColumn } from "styles";
import { useIntersectionObserver } from "react-intersection-observer-hook";

import {
  StyledDao,
  StyledDaoAvatar,
  StyledDaoContent,
  StyledDaosList,
  StyledJoinDao,
  StyledLoader,
} from "./styles";
import { useJoinDao } from "query/mutations";
import { DAOS_LIMIT } from "config";

export function DaosList() {
  const { data, isLoading } = useDaosQuery();

  const navigation = useAppNavigation();

  const emptyList = data && _.size(_.first(data.pages)?.daoAddresses) === 0;

  return (
    <Container
      title="Spaces"
      headerChildren={
        <Button onClick={navigation.createSpace.root}>Create</Button>
      }
    >
      <StyledFlexColumn>
        <List
          isLoading={isLoading}
          isEmpty={!!emptyList}
          loader={<ListLoader />}
        >
          <StyledDaosList>
            {data?.pages?.map((page) => {
              return page.daoAddresses?.map((address, index) => {
                return <DaoListItem key={index} address={address.toString()} />;
              });
            })}
          </StyledDaosList>
        </List>

        <LoadMoreDaos />
      </StyledFlexColumn>
    </Container>
  );
}

const LoadMoreDaos = () => {
  const { data, isLoading, fetchNextPage, isFetchingNextPage } = useDaosQuery();

  const loadMoreOnScroll = _.size(data?.pages) > 1 && !isFetchingNextPage;
  const hide =
    isLoading || _.size(_.last(data?.pages)?.daoAddresses) < DAOS_LIMIT;

  return (
    <LoadMore
      showMore={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      loadMoreOnScroll={loadMoreOnScroll}
      hide={hide}
    />
  );
};

const ListLoader = () => {
  return <StyledDaosList>
    {_.range(0, 4).map((it, i) => {
      return (
        <StyledDao key={i}>
          <StyledLoader />
        </StyledDao>
      );
    })}
  </StyledDaosList>;
};

export const DaoListItem = ({ address }: { address: string }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const { daoPage } = useAppNavigation();
  const { mutate } = useJoinDao();
  const { data: daoMetadata, isLoading } = useDaoMetadataQuery(address);

  const navigate = () => daoPage.root(address);

  const join = (e: any) => {
    e.stopPropagation();
    mutate();
  };

  return (
    <StyledDao ref={ref} onClick={navigate}>
      <StyledDaoContent className="container">
        {isVisible ? (
          <StyledFlexColumn>
            <StyledDaoAvatar src={daoMetadata?.avatar} />
            <Loader
              isLoading={isLoading}
              component={
                <>
                  <Typography className="title">{daoMetadata?.name}</Typography>
                  <Typography className="address">{address}</Typography>
                  <StyledJoinDao onClick={join}>Join</StyledJoinDao>
                </>
              }
            />
          </StyledFlexColumn>
        ) : null}
      </StyledDaoContent>
    </StyledDao>
  );
};
