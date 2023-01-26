import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { ReactElement } from "react";
import { styled } from "@mui/material";
import { GrClose } from "react-icons/gr";
import { IconButton, Typography } from "@mui/material";
interface Props {
  children: ReactElement;
  close?: () => void;
  open: boolean;
  className?: string;
  title?: string;
}

export const Popup = ({
  children,
  close,
  open,
  className = "",
  title,
}: Props) => {
  return (
    <StyledModal open={open} onClose={close} className={className}>
      <StyledChildren className="children">
        {close && (
          <StyledClose onClick={close}>
            <GrClose style={{ width: 15, height: 15 }} />
          </StyledClose>
        )}
        {title && (
          <Typography variant="h3" className="popup-title">
            {title}
          </Typography>
        )}
        {children}
      </StyledChildren>
    </StyledModal>
  );
}

const StyledChildren = styled(Box)(({ theme }) => ({
  boxShadow: "0px 0px 25px 0px rgb(0 0 0 / 10%)",
  position: "relative",
  padding: "50px 20px 40px 20px",
  background: 'white',
  width: "fit-content",
  height: "fit-content",
    outline:'unset',
  border:'unset',
  borderRadius: 10,
  ".popup-title": {
    fontSize: 18,
    fontWeight: 600,
    textAlign: "center",
    marginBottom: 20,
  },
}));

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  outline:'unset',
  border:'unset'
});
const StyledClose = styled('button')({
  
  position: "absolute",
  right: 10,
  top: 10,
  padding: 10,
  background: "transparent",
  border:'unset',
  cursor:'pointer',
  svg: {
    stroke: "black",

    "*": {
      color: "inherit",
      stroke: "inherit",
    },
  },
});
