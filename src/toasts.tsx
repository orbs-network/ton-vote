import { IconButton, styled } from "@mui/material";
import _ from "lodash";
import toast, { ToastPosition } from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { StyledFlexRow } from "styles";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { useTonWallet } from "@tonconnect/ui-react";

export function usePromiseToast<T>() {
  const translations = useCommonTranslations();
  const wallet = useTonWallet();
  return (args: {
    promise: Promise<T>;
    loading?: string;
    success?: string;
    error?: string;
    isSuccess?: (value: any) => boolean;
  }) => {
    let infoToast = "";
    if (wallet?.provider !== "injected") {
      infoToast = showToast(translations.checkWalletForTx);
    }
    toast.promise(
      args.promise,
      {
        loading: args.loading || translations.txPending,
        success: (value) => {
          infoToast && toast.dismiss(infoToast);
          const show = args.isSuccess ? args.isSuccess(value) : true;
          if (show && args.success && value) {
            return (
              <ToastContent
                message={args.success}
                customClick={toast.dismiss}
              />
            );
          }
          return null;
        },
        error: (err: any) => {
          infoToast && toast.dismiss(infoToast);

          return <ToastContent customClick={toast.dismiss} message={err} />;
        },
      },
      {
        success: {
          duration: 4000,
        },
        error: {
          duration: 4000,
        },
        position: "top-center",
      }
    );
  };
}

export const filterError = (error?: string) => {
  if (error?.includes("UserRejectsError")) {
    return true;
  }
  return false;
};

export const useErrorToast = () => {
  return (err: any) => {
    if (filterError(err instanceof Error ? err.message : err)) return;
    toast.dismiss();
    return errorToast(err);
  };
};

export const errorToast = (message: string) => {
  toast.error((t) => <ToastContent message={message} id={t.id} />, {
    duration: 4000,
  });
};

export const showSuccessToast = (message: string) => {
  toast.success((t) => <ToastContent message={message} id={t.id} />, {
    duration: 4000,
  });
};

interface ToastConfig {
  duration?: number;
  position: ToastPosition;
}

export const showToast = (message: string, config?: ToastConfig) => {
  return toast((t) => <ToastContent message={message} id={t.id} />, {
    duration: config?.duration || Infinity,
    position: config?.position || "top-center",
  });
};

const ToastContent = ({
  message,
  id,
  customClick,
}: {
  message: string;
  id?: string;
  customClick?: () => void;
}) => {
  const showButton = customClick || id;
  return (
    <StyledContainer className="test">
      {message}
      {showButton && (
        <StyledIconButton
          onClick={() => (customClick ? customClick() : toast.dismiss(id))}
        >
          <IoMdClose style={{ width: 20, height: 20, cursor: "pointer" }} />
        </StyledIconButton>
      )}
    </StyledContainer>
  );
};

const StyledIconButton = styled(IconButton)({
  padding: 5,
  background: "rgba(0, 0, 0, 0.03)",
});

export const clearAllToasts = () => toast.dismiss();

const StyledContainer = styled(StyledFlexRow)({
  fontSize: 15,
});
