import { Button, Container } from "components";
import _ from "lodash";
import { useDaoRolesQuery, useDaosQuery } from "query";
import React, { ReactNode } from "react";
import { useAppNavigation } from "router";
import { StyledFlexColumn } from "styles";
import { Dao } from "./Dao";
import { StyledDao, StyledDaosList, StyledLoader } from "./styles";

export function DaosList() {
  const { data: daos, isLoading } = useDaosQuery();  
  const { createSpace } = useAppNavigation();

  return (
    <Container
      title="Spaces"
      headerChildren={<Button onClick={createSpace.root}>Create</Button>}
    >
      <StyledFlexColumn gap={70}>
        <StyledDaosList>
          <ListLoader isLoading={isLoading}>
            {daos?.daoAddresses.map((address, index) => {
              return <Dao key={index} address={address} />;
            })}
          </ListLoader>
        </StyledDaosList>
      </StyledFlexColumn>
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

