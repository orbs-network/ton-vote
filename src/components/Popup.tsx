import Modal from "@mui/material/Modal";
import { MouseEvent, ReactElement } from "react";
import { DialogContent, styled } from "@mui/material";
import { GrClose } from "react-icons/gr";
import { IconButton } from "@mui/material";
import { TitleContainer } from "components";
interface Props {
  children: ReactElement;
  onClose?: () => void;
  open: boolean;
  className?: string;
  title?: string;
  hideCloseButton?: boolean;
  transparent?: boolean;
}

export const Popup = ({
  hideCloseButton,
  children,
  onClose,
  open,
  className = "",
  title,
  transparent,
}: Props) => {
  const closeOnOutsideClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <StyledModal open={open} onClose={onClose} componentsProps={{
      backdrop: {
        style: {
         opacity: transparent ?  0 : 1
        }
      }
    }}>
      <StyledDialogContent onClick={closeOnOutsideClick}>
        <StyledChildren
          title={title || ""}
          className={`popup-children ${className}`}
          onClick={(event) => event.stopPropagation()}
          headerComponent={
            !title ? null : onClose && !hideCloseButton && <CloseButton close={onClose} />
          }
        >
          {children}
        </StyledChildren>
      </StyledDialogContent>
    </StyledModal>
  );
};

const StyledDialogContent = styled(DialogContent)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  padding: 0,
  outline: "unset",
});

const StyledChildren = styled(TitleContainer)(({ theme }) => ({
  ".container-header": {
    alignItems: "center",
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
