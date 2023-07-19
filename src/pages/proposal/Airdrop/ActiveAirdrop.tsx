import { Chip, CircularProgress, styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  AppTooltip,
  Button,
  Img,
  OverflowWithTooltip,
  Popup,
  TextInput,
  TitleContainer,
} from "components";
import { useDebounce, useFormatNumber } from "hooks/hooks";
import _ from "lodash";
import { useAssetMetadataQuery } from "query/getters";
import { useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { BsCheckCircle, BsFillCheckCircleFill } from "react-icons/bs";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { errorToast } from "toasts";
import { validateAddress } from "utils";
import { useAirdrop, useTransferJetton, useTransferNFT } from "./hooks";
import { StyledButton } from "./styles";

export const ActiveAirdrop = () => {
  const { type } = useAirdrop();

  return (
    <StyledContainer>
      <StyledFlexColumn gap={20}>
        <TitleContainer
          title="Airdrop details"
          headerComponent={<ResetButton />}
        >
          {type === "nft" ? <NFTDetails /> : <JettonDetails />}
        </TitleContainer>

        {type === "nft" ? <NFTAction /> : <JettonAction />}
      </StyledFlexColumn>
    </StyledContainer>
  );
};

const ResetButton = () => {
  const { reset, finished } = useAirdrop();
  const [open, setOpen] = useState(false);

  if (finished) {
    return <StyledResetButton onClick={reset}>New airdrop</StyledResetButton>;
  }
  return (
    <>
      <StyledResetButton onClick={() => setOpen(true)}>Reset</StyledResetButton>
      <StyledWarningPopup
        open={open}
        onClose={() => setOpen(false)}
        title="Reset airdrop"
      >
        <StyledFlexColumn alignItems="flex-start" gap={20}>
          <Typography>Proceeding will delete the current airdrop</Typography>
          <StyledFlexRow>
            <StyledPopupButton onClick={() => setOpen(false)}>
              No
            </StyledPopupButton>
            <StyledPopupButton onClick={reset}>Yes</StyledPopupButton>
          </StyledFlexRow>
        </StyledFlexColumn>
      </StyledWarningPopup>
    </>
  );
};

const JettonFinished = () => {
  const { voters, votersCount, amountPerWallet, jettonAddress, amount } =
    useAirdrop();

  const { data, isLoading } = useAssetMetadataQuery(jettonAddress);
  const amountPerWalletUI = useFormatNumber(amountPerWallet);
  const amountUI = useFormatNumber(amount);

  const symbol = data?.metadata?.symbol;

  const csv = useMemo(() => {
    if (!amountPerWalletUI || !symbol) return [];
    const result = voters.map((it) => {
      return [it, `${amountPerWalletUI} ${symbol}`];
    });

    return [["address", "jettons"], ...result];
  }, [votersCount, amountPerWalletUI, symbol]);

  if (isLoading) {
    return (
      <StyledFlexColumn>
        <StyledSkeletonLoader />
        <StyledSkeletonLoader />
        <StyledSkeletonLoader />
      </StyledFlexColumn>
    );
  }
  return (
    <FinishedLayout
      csv={csv}
      text={`Successfully sent ${amountUI} ${symbol} to ${votersCount} voters`}
      filename={`${symbol} airdrop`}
    />
  );
};

const NFTFinished = () => {
  const { voters, votersCount } = useAirdrop();

  const csv = useMemo(() => {
    const result = voters.map((it) => {
      return [it];
    });

    return [["address"], ...result];
  }, [votersCount]);

  return (
    <FinishedLayout
      csv={csv}
      text="Succesfully sent NFT to all voters"
      filename="Airdrop"
    />
  );
};

interface FinishedProps {
  csv: any;
  filename: string;
  text: string;
}

const FinishedLayout = ({ csv, filename, text }: FinishedProps) => {
  return (
    <StyledFinished>
      <BsCheckCircle />
      <StyledFlexColumn>
        <Typography variant="h3">Congratulations!</Typography>
        <Typography className="text">{text}</Typography>
      </StyledFlexColumn>
      <CSVLink data={csv} filename={filename}>
        <StyledButton>Download CSV</StyledButton>
      </CSVLink>
    </StyledFinished>
  );
};

const Voters = () => {
  const { voters, currentWalletIndex, votersCount } = useAirdrop();

  const [open, setOpen] = useState(false);

  return (
    <StyledFlexRow justifyContent="flex-start">
      <Typography>{`${currentWalletIndex} / ${votersCount} sent`} </Typography>
      <StyledShowAll onClick={() => setOpen(true)}>
        Show all voters
      </StyledShowAll>
      <StyledPopup
        open={open}
        onClose={() => setOpen(false)}
        title="Airdrop Wallets"
      >
        <StyledList>
          {voters.map((it, index) => {
            return (
              <StyledListItem key={it}>
                <StyledAddressDisplay hideTooltip={true} full address={it} />
                {currentWalletIndex > index ? (
                  <BsFillCheckCircleFill />
                ) : (
                  <Typography>Not sent</Typography>
                )}
              </StyledListItem>
            );
          })}
        </StyledList>
      </StyledPopup>
    </StyledFlexRow>
  );
};

const JettonDetails = () => {
  const { jettonAddress, amountPerWallet, finished } = useAirdrop();
  const { data, isLoading: assetLoading } =
    useAssetMetadataQuery(jettonAddress);

  if (assetLoading) {
    return (
      <StyledFlexColumn gap={15} alignItems="flex-start">
        <StyledSkeletonLoader style={{ width: "50%", maxWidth: 200 }} />
        <StyledSkeletonLoader style={{ width: "70%", maxWidth: 300 }} />
        <StyledSkeletonLoader style={{ width: "80%", maxWidth: 500 }} />
      </StyledFlexColumn>
    );
  }

  return (
    <StyledFlow>
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <JettonMetadata />
        <StyledFlexRow>
          <Progress />
          <Voters />
        </StyledFlexRow>
        <JettonTotalAmount />
        <JettonAmountPerWallet />
      </StyledFlexColumn>
    </StyledFlow>
  );
};

const JettonAction = () => {
  const { jettonAddress, amountPerWallet, finished } = useAirdrop();
  const { data, isLoading: assetLoading } =
    useAssetMetadataQuery(jettonAddress);

  const { mutate, isLoading } = useTransferJetton();
  const amountPerWalletUI = useFormatNumber(amountPerWallet);
  const symbol = data?.metadata?.symbol || "";

  if (assetLoading) return null;

  if (finished) {
    return (
      <TitleContainer title={`Send ${symbol}`}>
        <JettonFinished />
      </TitleContainer>
    );
  }

  return (
    <TitleContainer title={`Send ${symbol}`}>
      <StyledFlexColumn gap={30}>
        <NextVoter />
        <StyledSend
          isLoading={isLoading}
          onClick={() => mutate()}
        >{`Send ${amountPerWalletUI} ${symbol}`}</StyledSend>
      </StyledFlexColumn>
    </TitleContainer>
  );
};

const JettonTotalAmount = () => {
  const { amount, jettonAddress } = useAirdrop();
  const { data } = useAssetMetadataQuery(jettonAddress);
  const amountUI = useFormatNumber(amount);
  return (
    <Typography>{`Total airdrop amount: ${amountUI} ${data?.metadata?.symbol}`}</Typography>
  );
};

const JettonAmountPerWallet = () => {
  const { amountPerWallet, jettonAddress } = useAirdrop();
  const { data } = useAssetMetadataQuery(jettonAddress);
  const amountPerWalleUI = useFormatNumber(amountPerWallet);

  return (
    <Typography>{`Each voter will receive: ${amountPerWalleUI} ${data?.metadata?.symbol}`}</Typography>
  );
};

const JettonMetadata = () => {
  const { jettonAddress } = useAirdrop();
  const { data, isLoading: assetLoading } =
    useAssetMetadataQuery(jettonAddress);

  return (
    <StyledJettonMetadata>
      <Img src={data?.metadata?.image} />
      <StyledFlexColumn className="right">
        <OverflowWithTooltip text={data?.metadata?.name} />
        <AddressDisplay padding={10} address={jettonAddress} />
      </StyledFlexColumn>
    </StyledJettonMetadata>
  );
};

const Progress = () => {
  const { votersCount, currentWalletIndex } = useAirdrop();

  const percent = useMemo(() => {
    if (!votersCount || !currentWalletIndex) return 0;
    return (currentWalletIndex / votersCount) * 100;
  }, [votersCount, currentWalletIndex]);

  const percentUI = useFormatNumber(percent, 1);

  return (
    <AppTooltip text={`${percentUI || 0}% completed`} placement="right">
      <StyledProgress>
        <Typography className="percent">{`${percentUI || 0}%`}</Typography>
        <CircularProgress
          value={percent}
          variant="determinate"
          className="main"
          style={{ width: "100%", height: "100%" }}
        />
        <div className="placeholder">
          <CircularProgress
            value={100}
            variant="determinate"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </StyledProgress>
    </AppTooltip>
  );
};

const NFTDetails = () => {
  const { amount } = useAirdrop();
  return (
    <StyledFlow>
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <Progress />
        <Voters />
        <Typography>{`Airdrop amount ${amount} NFT's`}</Typography>
        <Typography>{`Each voter will receive: 1 NFT`}</Typography>
      </StyledFlexColumn>
    </StyledFlow>
  );
};

const NFTAction = () => {
  const { mutate, isLoading } = useTransferNFT();
  const [nftAddress, setnftAddress] = useState("");
  const [error, setError] = useState("");
  const { finished } = useAirdrop();

  const onSend = () => {
    mutate(nftAddress);
    // if (!nftAddress || !validateAddress(nftAddress)) {
    //   const _error = "Please enter a valid NFT address";
    //   setError(_error);
    //   errorToast(_error);
    // } else {
    //   mutate(nftAddress);
    // }
  };

  if (finished) {
    return (
      <TitleContainer title="Send NFT">
        <NFTFinished />
      </TitleContainer>
    );
  }

  return (
    <TitleContainer title="Send NFT">
      <StyledFlexColumn gap={30}>
        <StyledFlexColumn>
          <NextVoter />
          <NFTInput
            clearError={() => setError("")}
            error={error}
            onDebouce={setnftAddress}
          />
        </StyledFlexColumn>
        <StyledSend isLoading={isLoading} onClick={onSend}>
          Send NFT
        </StyledSend>
      </StyledFlexColumn>
    </TitleContainer>
  );
};

const NextVoter = () => {
  const { nextVoter } = useAirdrop();

  return (
    <StyledFlexRow justifyContent="flex-start">
      <Typography>Next Voter: </Typography>
      <AddressDisplay padding={10} address={nextVoter} />
    </StyledFlexRow>
  );
};

const NFTInput = ({
  onDebouce,
  error,
  clearError,
}: {
  onDebouce: (value: string) => void;
  error?: string;
  clearError: () => void;
}) => {
  const [address, setAddress] = useState("");
  const debouncedValue = useDebounce<string>(address, 300);

  useEffect(() => {
    onDebouce(debouncedValue);
  }, [debouncedValue]);

  return (
    <TextInput
      onFocus={clearError}
      error={error}
      required={true}
      title="NFT address"
      value={address}
      onChange={setAddress}
    />
  );
};

const StyledShowAll = styled(Button)({
  padding: "5px 10px",
  height: "auto",
  "*": {
    fontSize: 14,
  },
});

const StyledList = styled(StyledFlexColumn)({
  gap: 20,
});

const StyledAddressDisplay = styled(AddressDisplay)({
  flex: 1,
  maxWidth: "60%",
});

const StyledListItem = styled(StyledFlexRow)({
  justifyContent: "space-between",
});

const StyledPopup = styled(Popup)({
  maxWidth: 600,
  maxHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  ".title-container-children": {
    overflowY: "auto",
    flex: 1,
  },
});

const StyledContainer = styled(StyledFlexColumn)({});

const StyledResetButton = styled(Button)({
  height: "auto",
  padding: "7px 13px",
  "*": {
    fontSize: 14,
  },
});

const StyledPopupButton = styled(Button)({
  width: "50%",
});

const StyledWarningPopup = styled(Popup)({
  maxWidth: 400,
});

const StyledFinished = styled(StyledFlexColumn)(({ theme }) => ({
  gap: 30,
  svg: {
    width: 50,
    height: 50,
    color: theme.palette.primary.main,
  },
  h3: {
    fontSize: 22,
    fontWeight: 600,
  },
  ".text": {
    fontSize: 18,
    fontWeight: 500,
  },
}));

const StyledSend = styled(StyledButton)({
  marginLeft: "auto",
  marginRight: "auto",
});

const StyledFlow = styled(StyledFlexColumn)({
  alignItems: "flex-start",
  gap: 40,
});

const StyledProgress = styled(StyledFlexRow)(({ theme }) => ({
  width: 70,
  height: 70,
  position: "relative",
  ".percent": {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: 13,
  },
  ".main": {},
  svg: {
    color: theme.palette.primary.main,
  },
  ".placeholder": {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    opacity: 0.2,
    width: "100%",
    height: "100%",
  },
}));

const StyledJettonMetadata = styled(StyledFlexRow)({
  justifyContent: "flex-start",
  gap: 20,
  p: {
    fontSize: 14,
  },
  ".right": {
    gap: 4,
    flex: 1,
    alignItems: "flex-start",
  },
  ".img": {
    width: 50,
    height: 50,
    borderRadius: "50%",
  },
});
