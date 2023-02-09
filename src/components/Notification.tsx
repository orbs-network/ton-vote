import { ReactNode } from "react";
import {
  SnackbarKey,
  SnackbarOrigin,
  useSnackbar,
  VariantType,
} from "notistack";
import { IconButton, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import { GrClose } from "react-icons/gr";

interface Params {
  message: ReactNode | string;
  variant: VariantType;
  onClose?: () => void;
  autoHideDuration?: number | null;
  anchorOrigin?: SnackbarOrigin;
  disableClose?: boolean;
  closeButton?: boolean;
  action?: () => void;
  actionText?: string;
  hideClose?: boolean;
}

export function useNotification() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showNotification = ({
    message,
    variant,
    onClose,
    autoHideDuration,
    anchorOrigin,
    closeButton,
    action,
    actionText,
    hideClose = false,
  }: Params) => {
    const key = enqueueSnackbar(message, {
      anchorOrigin: anchorOrigin,
      action: (key) => {
        return (
          <StyledCloseButton onClick={() => closeSnackbar(key)}>
            <GrClose style={{ width: 16, height: 16 }} />
          </StyledCloseButton>
        );
      },
      variant,
      autoHideDuration: 5000,
      onClose,
    });
    return key;
  };

  return {
    showNotification,
    hideNotification: (key: SnackbarKey) => closeSnackbar(key),
  };
}


const StyledCloseButton = styled(IconButton)({
  svg: {
    stroke: "white",
    "*": {
      stroke: "inherit",
    },
  },
});
