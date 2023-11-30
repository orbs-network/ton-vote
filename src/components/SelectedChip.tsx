import { IconButton, styled } from "@mui/material";
import React, { ReactNode } from "react";
import { IoClose, IoCloseCircle } from "react-icons/io5";

export function SelectedChip({
  children,
  className = "",
  onDelete,
}: {
  children: ReactNode;
  className?: string;
  onDelete: () => void;
}) {
  return (
    <StyledContainer className={`${className} selected-chip`}>
      {children}
      <StyledDelete onClick={onDelete}>
        <IoClose style={{ width: 20, height: 20 }} />
      </StyledDelete>
    </StyledContainer>
  );
}

const StyledDelete = styled(IconButton)({
  position: "absolute",
  right: 5,
  top: 5,
  padding: 5,
});

const StyledContainer = styled("div")(({ theme }) => ({
  padding: "0px 40px 0px 10px",
  borderRadius: 20,
  position: "relative",
  background:
    theme.palette.mode === "dark"
      ? "rgba(255,255,255, 0.05)"
      : "rgba(0,0,0, 0.05)",
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
}));
