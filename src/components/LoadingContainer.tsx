import { styled } from "@mui/material";
import React from "react";
import { StyledFlexColumn, StyledSkeletonLoader } from "styles";
import { Container } from "./Container";

export const LoadingContainer = ({
  loaderAmount = 4,
  className = "",
}: {
  loaderAmount?: number;
  className?: string;
}) => {
  return (
    <StyledLoaderContainer className={className}>
      <StyledFlexColumn alignItems="flex-start">
        {[...Array(loaderAmount).keys()].map((i) => {
          const percent = (i + 1) * 20;
          return (
            <StyledLoader
              key={i}
              style={{ width: percent > 100 ? `100%` : `${percent}%` }}
            />
          );
        })}
      </StyledFlexColumn>
    </StyledLoaderContainer>
  );
};

const StyledLoader = styled(StyledSkeletonLoader)({
  height: 20,
  transform: "unset",
  borderRadius: 10,
  gap: 15,
});

const StyledLoaderContainer = styled(Container)({
    width:'100%',
  gap: 10,
  alignItems: "flex-start",
});
