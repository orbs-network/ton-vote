import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { ReactElement } from "react";
import { DialogContent, styled } from "@mui/material";
import { GrClose } from "react-icons/gr";
import { IconButton, Typography } from "@mui/material";
import { Container } from "./Container";
interface Props {
  children: ReactElement;
  onClose?: () => void;
  open: boolean;
  className?: string;
  title?: string;
  hideCloseButton?: boolean
}

export const Popup = ({
  hideCloseButton,
  children,
  onClose,
  open,
  className = "",
  title,
}: Props) => {
  return (
    <StyledModal open={open} onClose={onClose}>
      <StyledDialogContent>
        <StyledChildren
          className={`children ${className}`}
          title={title}
          headerChildren={
            onClose && !hideCloseButton && <CloseButton close={onClose} />
          }
        >
          {children}
        </StyledChildren>
      </StyledDialogContent>
    </StyledModal>
  );
};

const StyledDialogContent = styled(DialogContent)({
 display:'flex',
 alignItems:'center',
 justifyContent:'center',
 padding: 0,
 outline:'unset'
});

const StyledChildren = styled(Container)(({ theme }) => ({
 
  ".container-header": {
    alignItems: "center",
  },
  boxShadow: "0px 0px 25px 0px rgb(0 0 0 / 10%)",
  position: "relative",
  padding: "20px 20px 40px 20px",
  width: "100%",
  height: "fit-content",
  outline: "unset",
  border: "unset",
  borderRadius: 10,
  ".popup-title": {
    fontSize: 18,
    fontWeight: 600,
    textAlign: "center",
  },
}));

const StyledModal = styled(Modal)({
  backdropFilter: "blur(5px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  outline: "unset",
  border: "unset",
});

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
