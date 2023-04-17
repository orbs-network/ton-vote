import { styled } from "@mui/material";
import React, { ReactNode } from "react";

interface Props {
  isLoading: boolean;
  isEmpty: boolean;
  children?: ReactNode;
  emptyComponent?: ReactNode;
  loader?: ReactNode;
}

export function List({
  isLoading,
  isEmpty,
  children,
  emptyComponent,
  loader,
}: Props) {
  if (isEmpty) {
    return <>{emptyComponent}</>;
  }
  if (isLoading) {
    return <>{loader}</>;
  }
  return <>{children}</>;
}

