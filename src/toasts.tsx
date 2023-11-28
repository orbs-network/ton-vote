import { IconButton, styled } from "@mui/material";
import _ from "lodash";
import toast, { ToastPosition } from "react-hot-toast";
import { StyledFlexRow } from "styles";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { Markdown } from "components";

export function usePromiseToast<T>() {
  const translations = useCommonTranslations();
  return (args: {
    promise: Promise<T>;
    loading?: string;
    success?: string;
    error?: string;
    isSuccess?: (value: any) => boolean;
  }) => {
    let infoToast = "";
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
          const message = args.error || err;
          const msg = message instanceof Error ? message.message : message;

          return <ToastContent customClick={toast.dismiss} message={msg} />;
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
  if (error?.includes("The connection is outdated")) return false;
  if (error?.includes("TON_CONNECT_SDK_ERROR")) {
    return true;
  }
  return false;
};

export const useErrorToast = () => {
  return (err: any, duration?: number) => {
    if (filterError(err instanceof Error ? err.message : err)) return;
    toast.dismiss();
    return errorToast(err, duration);
  };
};

export const errorToast = (message: string | Error, duration = 7000) => {
  const msg = message instanceof Error ? message.message : message;
  toast.error((t) => <ToastContent message={msg} id={t.id} />, {
    duration,
  });
};

export const showSuccessToast = (message: string) => {
  toast.success((t) => <ToastContent message={message} id={t.id} />, {
    duration: 40_000,
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
  return (
    <StyledContainer>
      <Markdown>{message}</Markdown>
    </StyledContainer>
  );
};

export const clearAllToasts = () => toast.dismiss();

const StyledContainer = styled(StyledFlexRow)({
  fontSize: 15,
  alignItems: "center",
  p: {
    fontSize: '15px!important',
  },
});
