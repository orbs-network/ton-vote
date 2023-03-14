import { CircularProgress, styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Button, Container, LoadMore } from "components";
import _ from "lodash";
import React from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { Space } from "types";
import { nFormatter } from "utils";
import { useGetSpacesQuery } from "./query";

function SpacesList() {
  const { data, fetchNextPage, isLoading, isFetchingNextPage } =
    useGetSpacesQuery();
  const loadMoreOnScroll = data?.pages && data?.pages.length > 1;


  return (
    <Container title='Spaces'>
      <StyledFlexColumn gap={70}>
        <StyledList>
          {isLoading ? (
            <Loader />
          ) : (
            data?.pages.map((page) => {
              return (
                <React.Fragment key={page.nextPage}>
                  {page.spaces.map((space) => {
                    return <Item key={space.id} space={space} />;
                  })}
                </React.Fragment>
              );
            })
          )}
        </StyledList>
        <LoadMore
          isFetchingNextPage={isFetchingNextPage}
          loadMoreOnScroll={!!loadMoreOnScroll}
          fetchNextPage={fetchNextPage}
          hide={isLoading}
        />
      </StyledFlexColumn>
    </Container>
  );
}
export { SpacesList };

const StyledLoader = styled(StyledSkeletonLoader)({
  width: "100%",
  height: "100%",
});

const Loader = () => {
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
};

const StyledList = styled(StyledFlexRow)({
  marginLeft: "auto",
  marginRight: "auto",
  flexWrap: "wrap",
  gap: 15,
});

const Item = ({ space }: { space: Space }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const { spacePage } = useAppNavigation();

  return (
    <StyledSpace ref={ref} onClick={() => spacePage.root(space.id)}>
      <StyledSpaceContent className="container">
        {isVisible ? (
          <StyledFlexColumn>
            <StyledListItemImg src={space.image} />
            <StyledFlexColumn>
              <Typography className="title">{space.name}</Typography>
              <Typography className="members">
                {nFormatter(space.members)} members
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
