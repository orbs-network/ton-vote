import { styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Button, Container } from "components";
import { useGetSpacesQuery } from "queries";
import React from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import { routes, useAppNavigation } from "router";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Space } from "types";
import { nFormatter } from "utils";

function SpacesList() {
  const { data: spaces } = useGetSpacesQuery();

  return (
    <StyledList>
      {spaces?.map((space) => {
        return <Item space={space} key={space.id} />;
      })}
    </StyledList>
  );
}

export default SpacesList;

const StyledList = styled(StyledFlexRow)({
  marginLeft: "auto",
  marginRight: "auto",
  flexWrap: "wrap",
  gap: 10,
});

const Item = ({ space }: { space: Space }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const {navigateToSpace} = useAppNavigation();

  return (
    <StyledSpace ref={ref} onClick={() => navigateToSpace(space.id)}>
      <Container className="container">
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
      </Container>
    </StyledSpace>
  );
};



const StyledJoin = styled(Button)({
    minWidth:'60%'
})

const StyledListItemImg = styled("img")({
  width: 80,
  height: 80,
  borderRadius: "50%",
  overflow: "hidden",
  marginBottom: 20
});

const StyledSpace = styled(Box)({
  width: "calc(100% / 4 - 8px)",
  height: 280,
  borderRadius: 10,
  cursor: "pointer",
  ".container": {
    height:'100%'
  },
  ".title": {
    fontSize: 18,
    fontWeight: 700,
  },
  ".members": {
    fontWeight: 700,
  },
});
