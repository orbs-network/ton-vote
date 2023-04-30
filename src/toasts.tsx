import { IconButton, styled } from "@mui/material";
import _ from "lodash";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { StyledFlexRow } from "styles";
export function showPromiseToast<T>(args: {
  promise: Promise<T>;
  loading?: string;
  success: string;
  error?: string;
}) {
  toast.dismiss();

  toast.promise(
    args.promise,
    {
      loading: args.loading || "Transaction pending",
      success: () => (
        <ToastContent message={args.success} customClick={toast.dismiss} />
      ),
      error: (err) => {
        const error = args.error || getErrorText(err);

        return <ToastContent customClick={toast.dismiss} message={error} />;
      },
    },
    {
      success: {
        duration: 10000,
      },
      error: {
        duration: 10000,
      },
      position: "top-center",
    }
  );
}

export const toastTxMessage = (message?: string) => {
  return `${message || "Transaction submitted"} \n Please check wallet`;
};

export const showErrorToast = (message: string) => {
  toast.dismiss();

  toast.error((t) => <ToastContent message={message} id={t.id} />, {
    duration: 500000,
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
    <StyledPromiseContainer>
      {message}
      {showButton && (
        <StyledIconButton
          onClick={() => (customClick ? customClick() : toast.dismiss(id))}
        >
          <IoMdClose style={{ width: 20, height: 20, cursor: "pointer" }} />
        </StyledIconButton>
      )}
    </StyledPromiseContainer>
  );
};

const StyledIconButton = styled(IconButton)({
  padding: 5
});

const StyledPromiseContainer = styled(StyledFlexRow)({});

const getErrorText = (error: any) => {
  const { message } = error;

  if (message.indexOf("UserRejectsError") > -1) {
    return "User rejected the transaction";
  }

  return "Something went wrong";
};
