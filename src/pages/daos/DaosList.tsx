import { Typography } from "@mui/material";
import { Button, Container, Loader, LoadMore } from "components";
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
import { Address } from "ton";
import { useJoinDao } from "query/mutations";

export function DaosList() {
  const { data: daos, isLoading, fetchNextPage } = useDaosQuery();

  // if (daos) {
  //   const mapped = daos.pages[0].daoAddresses.map((it) => it.toString());
  //   console.log(mapped);
    
  // }
  const navigation = useAppNavigation();

  return (
    <Container
      title="Spaces"
      headerChildren={
        <Button onClick={navigation.createSpace.root}>Create</Button>
      }
    >
      <StyledDaosList>
        <ListLoader isLoading={isLoading}>
          {daos?.pages?.map((page) => {
            return page.daoAddresses?.map((address, index) => {
              return <DaoListItem key={index} address={address} />;
            });
          })}
        </ListLoader>
      </StyledDaosList>
      <LoadMore
        showMore={fetchNextPage}
        isFetchingNextPage={isLoading}
        loadMoreOnScroll={false}
        hide={isLoading}
      />
    </Container>
  );
}

const ListLoader = ({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: ReactNode;
}) => {
  if (isLoading) {
    return (
      <>
        {_.range(0, 4).map((it, i) => {
          return (
            <StyledDao key={i}>
              <StyledLoader />
            </StyledDao>
          );
        })}
      </>
    );
  }
  return <>{children}</>;
};

export const DaoListItem = ({ address }: { address: Address }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const { spacePage } = useAppNavigation();
  const { mutate } = useJoinDao();
  const { data: daoMetadata, isLoading } = useDaoMetadataQuery(
    address.toString()
  );
  

  const navigate = () => spacePage.root(address.toString());

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
            <StyledFlexColumn>
              <Loader
                isLoading={isLoading}
                component={
                  <Typography className="title">{daoMetadata?.name}</Typography>
                }
              />
              {!isLoading && <StyledJoinDao onClick={join}>Join</StyledJoinDao>}
            </StyledFlexColumn>
          </StyledFlexColumn>
        ) : null}
      </StyledDaoContent>
    </StyledDao>
  );
};
