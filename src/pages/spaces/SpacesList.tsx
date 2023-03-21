import { styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Button, Container } from "components";
import _ from "lodash";
import React, { ReactNode } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { Dao } from "types";
import { nFormatter } from "utils";
import { useDaosQuery } from "./hooks";

function SpacesList() {
  const { data: daos, isLoading } = useDaosQuery();

  const { createSpace } = useAppNavigation();

  return (
    <Container
      title="Spaces"
      headerChildren={<Button onClick={createSpace.root}>Create</Button>}
    >
      <StyledFlexColumn gap={70}>
        <StyledList>
          <ListLoader isLoading={isLoading}>
            {daos?.map((dao) => {
              return <Item key={dao.id} dao={dao} />;
            })}
          </ListLoader>
        </StyledList>
      </StyledFlexColumn>
    </Container>
  );
}
export { SpacesList };

const StyledLoader = styled(StyledSkeletonLoader)({
  width: "100%",
  height: "100%",
});

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
            <StyledSpace key={i}>
              <StyledLoader />
            </StyledSpace>
          );
        })}
      </>
    );
  }
  return <>{children}</>;
};

const StyledList = styled(StyledFlexRow)({
  marginLeft: "auto",
  marginRight: "auto",
  flexWrap: "wrap",
  gap: 15,
});

const Item = ({ dao }: { dao: Dao }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const { spacePage } = useAppNavigation();

  return (
    <StyledSpace ref={ref} onClick={() => spacePage.root(dao.id)}>
      <StyledSpaceContent className="container">
        {isVisible ? (
          <StyledFlexColumn>
            <StyledListItemImg src={dao.image} />
            <StyledFlexColumn>
              <Typography className="title">{dao.name}</Typography>
              <Typography className="members">
                {nFormatter(dao.members)} members
              </Typography>
              <StyledJoin>Join</StyledJoin>
            </StyledFlexColumn>
          </StyledFlexColumn>
        ) : null}
      </StyledSpaceContent>
    </StyledSpace>
  );
};

const StyledSpaceContent = styled(StyledFlexColumn)({
  border: "1px solid lightgray",
  //   background: "rgba(0, 136, 204, 0.05)",
  borderRadius: 10,
});

const StyledJoin = styled(Button)({
  minWidth: "60%",
});

const StyledListItemImg = styled("img")({
  width: 80,
  height: 80,
  borderRadius: "50%",
  overflow: "hidden",
  marginBottom: 20,
});

const StyledSpace = styled(Box)({
  width: "calc(100% / 4 - 12px)",
  height: 280,

  cursor: "pointer",
  ".container": {
    height: "100%",
  },
  ".title": {
    fontSize: 18,
    fontWeight: 700,
  },
  ".members": {
    fontWeight: 700,
  },
});
