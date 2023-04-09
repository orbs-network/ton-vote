import { styled } from "@mui/material";
import React, { ReactNode } from "react";
import { Loader } from "./Loader";

interface Props {
  isLoading: boolean;
  isEmpty: boolean;
  children?: ReactNode;
  emptyComponent?: ReactNode;
  loader?: ReactNode;
}

export function List({ isLoading, isEmpty, children, emptyComponent, loader }: Props) {
  if (isEmpty) {
    return <>{emptyComponent}</>;
  }
  return (
    <StyledContainer
      loader={loader}
      component={children}
      isLoading={isLoading}
    />
  );
}


const StyledContainer = styled(Loader)({});
