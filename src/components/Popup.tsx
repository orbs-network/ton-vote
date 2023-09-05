import Modal from "@mui/material/Modal";
import { ReactElement, ReactNode } from "react";
import { DialogContent, Drawer, styled } from "@mui/material";
import { GrClose } from "react-icons/gr";
import { IconButton } from "@mui/material";
import * as React from "react";
import { Global } from "@emotion/react";
import { grey } from "@mui/material/colors";
import { useMobile } from "../hooks/hooks";
import { TitleContainer } from "./TitleContainer";
interface Props {
  children: ReactElement;
  onClose?: () => void;
  open: boolean;
  className?: string;
  title?: ReactNode;
  hideCloseButton?: boolean;
  transparent?: boolean;
  fullHeight?: boolean;
}

export const Popup = ({
  hideCloseButton,
  children,
  onClose,
  open,
  className = "",
  title,
  transparent,
  fullHeight,
}: Props) => {
  const content = (
    <StyledDialogContent style={{
      height: fullHeight ? "calc(100vh - 60px)" : "auto",
    }}>
      <StyledChildren
        title={title || ""}
        className={`popup-children mobile-popup-children ${className}`}
        headerComponent={
          <CloseButton hideCloseButton={hideCloseButton} close={onClose} />
        }
      >
        {children}
      </StyledChildren>
    </StyledDialogContent>
  );

  const isMobile = useMobile();

  if (isMobile) {
    return (
      <SwipeableEdgeDrawer onClose={onClose} open={open}>
        {content}
      </SwipeableEdgeDrawer>
    );
  }
  return (
    <StyledModal
      open={open}
      onClose={onClose}
      componentsProps={{
        backdrop: {
          style: {
            opacity: transparent ? 0 : 1,
          },
        },
      }}
    >
      {content}
    </StyledModal>
  );
};

const StyledDialogContent = styled(DialogContent)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: 0,
  outline: "unset",
  ".mobile-popup-children": {
    borderRadius: 0,
    height: "100%",
    maxHeight: "calc(100vh - 60px)",
  },
});

const StyledChildren = styled(TitleContainer)(({ theme }) => ({
  maxHeight: "calc(100vh - 100px)",
  display: "flex",
  flexDirection: "column",
  ".container-header": {
    alignItems: "center",
  },
  ".title-container-header": {
    padding: "10px 15px 10px 20px",
  },
  ".title-container-children": {
    flex: 1,
    overflowY: "auto",
  },
  position: "relative",
  padding: "0px",
  width: "100%",
  height: "fit-content",
  outline: "unset",
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
  hideCloseButton,
}: {
  close?: () => void;
  className?: string;
  hideCloseButton?: boolean;
}) {
  if (hideCloseButton || !close) return null;
  return (
    <StyledClose className={className} onClick={close}>
      <GrClose style={{ width: 15, height: 15 }} />
    </StyledClose>
  );
}

const StyledClose = styled(IconButton)(({ theme }) => ({
  background: "transparent",
  border: "unset",
  cursor: "pointer",
  svg: {
    stroke: theme.palette.text.primary,

    "*": {
      color: "inherit",
      stroke: "inherit",
    },
  },
}));

const drawerBleeding = 56;

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  backgroundColor:
    theme.palette.mode === "light"
      ? grey[100]
      : theme.palette.background.default,
}));

export default function SwipeableEdgeDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <Root>
      <Drawer
        container={document.body}
        anchor="bottom"
        open={open}
        onClose={() => onClose?.()}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {children}
      </Drawer>
    </Root>
  );
}
