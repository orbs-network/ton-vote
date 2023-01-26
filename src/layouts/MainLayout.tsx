import React, { useState } from "react";
import { Container } from "components";
import { Typography } from "@mui/material";
import { styled } from "@mui/material";
import { StyledFlexColumn } from "styles";

export function MainLayout() {
  const [showMore, setShowMore] = useState(false);
  return (
    <StyledContainer title="Single choice voting demo">
      <StyledFlexColumn alignItems="flex-start">
        <Typography>
          is simply dummy text of the printing and typesetting industry. Lorem
          Ipsum has been the industry's standard dummy text ever since the
          1500s, when an unknown printer took a galley of type and scrambled it
          to make a type specimen book.
        </Typography>
        {showMore ? (
          <ShowMorePart />
        ) : (
          <StyledShowMore onClick={() => setShowMore(true)}>
            <Typography>Show more</Typography>
          </StyledShowMore>
        )}
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const ShowMorePart = () => {
  return (
    <>
      <Typography>
        It has survived not only five centuries, but also the leap into
        electronic typesetting, remaining essentially unchanged. It was
        popularised in the 1960s with the release of Letraset sheets containing
        Lorem Ipsum passages, and more recently with desktop publishing software
        like Aldus PageMaker including versions of Lorem Ipsum.
      </Typography>
      <Typography> one option. Try it out for yourself!</Typography>
    </>
  );
};

const StyledShowMore = styled("div")({
  cursor: "pointer",
  p: {
    fontSize: 16,
    fontWeight: 600,
  },
  
});

const StyledContainer = styled(Container)({});
