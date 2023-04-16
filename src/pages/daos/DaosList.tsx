import { styled, Typography } from "@mui/material";
import { Button, Container, List, LoadMore } from "components";
import _ from "lodash";
import {  useDaosQuery } from "query/queries";
import { useAppNavigation } from "router";
import { StyledFlexColumn, textOverflow } from "styles";
import { useIntersectionObserver } from "react-intersection-observer-hook";

import {
  StyledDao,
  StyledDaoAvatar,
  StyledDaoContent,
  StyledDaosList,
  StyledJoinDao,
  StyledLoader,
} from "./styles";
import { makeElipsisAddress } from "utils";
import { Dao } from "types";
import { useMutation } from "@tanstack/react-query";

export function DaosList() {
  const { data, isLoading, } = useDaosQuery();  


  const navigation = useAppNavigation();

  // const emptyList = data && _.size(_.first(data.pages)?.daoAddresses) === 0;
  const emptyList = false
  return (
    <Container
      title="Daos"
      headerChildren={
        <Button onClick={navigation.createSpace.root}>
          <Typography style={textOverflow}>Create Dao</Typography>
        </Button>
      }
    >
      <StyledFlexColumn>
        <List
          isLoading={isLoading}
          isEmpty={!!emptyList}
          loader={<ListLoader />}
          emptyComponent={
            <StyledEmptyList>There are no Daos yet</StyledEmptyList>
          }
        >
          <StyledDaosList>
            {data?.pages?.map((page) => {
              return page.daos?.map((dao, index) => {
                return <DaoListItem key={index} dao={dao} />;
              });
            })}
          </StyledDaosList>
        </List>

        <LoadMoreDaos />
      </StyledFlexColumn>
    </Container>
  );
}

const StyledEmptyList = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
});

const LoadMoreDaos = () => {
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, } =
    useDaosQuery();

  const loadMoreOnScroll = _.size(data?.pages) > 1 && !isFetchingNextPage;
  
  return (
    <LoadMore
      showMore={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      loadMoreOnScroll={loadMoreOnScroll}
      hide={false}
    />
  );
};

const ListLoader = () => {
  return (
    <StyledDaosList>
      {_.range(0, 4).map((it, i) => {
        return (
          <StyledDao key={i}>
            <StyledLoader />
          </StyledDao>
        );
      })}
    </StyledDaosList>
  );
};


const useJoinDao = () => {
  return useMutation(async () => {

  })
}

export const DaoListItem = ({ dao }: { dao: Dao }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const { daoPage } = useAppNavigation();
  const { mutate } = useJoinDao();
  const { daoMetadata } = dao;

  const navigate = () => daoPage.root((dao as any).daoAddress);

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
            <Typography className="title">{daoMetadata?.name}</Typography>
            <Typography className="address">
              {makeElipsisAddress(dao.daoAddress, 6)}
            </Typography>
            <StyledJoinDao onClick={join}>Join</StyledJoinDao>
          </StyledFlexColumn>
        ) : null}
      </StyledDaoContent>
    </StyledDao>
  );
};
