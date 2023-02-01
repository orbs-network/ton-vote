import { IconButton, styled } from '@mui/material';
import React from 'react'
import { GrClose } from 'react-icons/gr';

export function CloseButton({
  close,
  className = "",
}: {
  close: () => void;
  className?: string;
}) {
  return (
    <StyledClose className={className} onClick={close}>
      <GrClose style={{ width: 15, height: 15 }} />
    </StyledClose>
  );
}


const StyledClose = styled(IconButton)({
  position: "absolute",
  right: 10,
  top: 10,
  padding: 10,
  background: "transparent",
  border: "unset",
  cursor: "pointer",
  svg: {
    stroke: "black",

    "*": {
      color: "inherit",
      stroke: "inherit",
    },
  },
});

