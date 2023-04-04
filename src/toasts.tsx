import { IconButton, styled } from "@mui/material";
import _ from "lodash";
import { ReactNode } from "react";
import toast, { Toast } from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { StyledFlexRow } from "styles";
export function showPromiseToast<T>(args: {
  promise: Promise<T>;
  loading?: string;
  success: string;
  error?: string;
}) {
  toast.promise(
    args.promise,
    {
    
      loading: args.loading || "Loading",
      success: () => <ToastContent message={args.success} />,
      error: (err) => {
        const error = args.error || getErrorText(err);

        return <ToastContent message={error} />;
      },
    },
    {
      success: {
        duration: 10000,
      },
      error: {
        duration: 125000,
      },
      position: "top-right",
    }
  );
}

export const toastTxMessage = (message?: string) => {
  return `${message || "Transaction submitted"} \n Please check wallet`;
};

export const showErrorToast = (message: string) => {
  toast.error((t) => <ToastContent message={message} id={t.id} />, {
    duration: 5000,
  });
};

export const showSuccessToast = (message: string) => {
  toast.success((t) => <ToastContent message={message} id={t.id} />, {
    duration: 5000,
  });
};

export const showToast = (message: string) => {
  toast.error((t) => <ToastContent message={message} id={t.id} />, {
    duration: 5000,
  });
};

const ToastContent = ({ message, id }: { message: string; id?: string }) => {
  return (
    <StyledPromiseContainer>
      {message}
      <StyledIconButton>
        <IoMdClose
          style={{ width: 20, height: 20, cursor: "pointer" }}
          onClick={() => toast.dismiss(id)}
        />
      </StyledIconButton>
    </StyledPromiseContainer>
  );
};

const StyledIconButton = styled(IconButton)({});

const StyledPromiseContainer = styled(StyledFlexRow)({});

const getErrorText = (error: any) => {
  const { message } = error;

  if (message.indexOf("UserRejectsError") > -1) {
    return "User rejected the transaction";
  }

  return "Something went wrong";
};
