import { useMutation } from "@tanstack/react-query";
import { useNotification } from "components";
import { TX_SUBMIT_ERROR_TEXT, TX_SUBMIT_SUCCESS_TEXT } from "config";
import { useConnectionStore } from "connection";
import { getClientV2 } from "contracts-api/logic";

import { useState } from "react";
import { Logger } from "utils";

interface SendTxArgs {
  analytics?: {
    submitted?: () => void;
    success?: () => void;
    error?: (error: string) => void;
  };

  onFinished: () => void;
  message: string;
  contractAddress: string;
}

