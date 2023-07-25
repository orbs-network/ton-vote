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
import { VirtualList } from "components";
import { useDebounce, useFormatNumber } from "hooks/hooks";
import _ from "lodash";
import {
  useReadJettonWalletMedata,
  useReadNftItemMetadata,
} from "query/getters";
import { useEffect, useMemo, useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { errorToast } from "toasts";
import { validateAddress } from "utils";
import { AirdropAssetImg } from "./AirdropAssetImg";

import {
  useAmount,
  useAmountPerWallet,
  useNextVoter,
  useTransferJetton,
  useTransferNFT,
} from "./hooks";
import { useAirdropStore } from "./store";
import { StyledButton } from "./styles";

export const ActiveAirdrop = () => {
  const { type, currentWalletIndex = 0, voters } = useAirdropStore();

  return (
    <StyledContainer>
      <StyledFlexColumn gap={20}>
        {/* <TitleContainer title="Airdrop details">
          {type === "nft" ? <NFTDetails /> : <JettonDetails />}
        </TitleContainer> */}
        <TitleContainer
          title="Transfer assets"
          headerComponent={
            <Typography>
              {`${currentWalletIndex} / ${_.size(voters).toLocaleString()}`}{" "}
            </Typography>
          }
        >
          {type === "nft" ? <NFTAction /> : <JettonAction />}
        </TitleContainer>
      </StyledFlexColumn>
    </StyledContainer>
  );
};

const Voter = ({ value, index }: { value: string; index: number }) => {
  const { voters, currentWalletIndex = 0 } = useAirdropStore();

  const voter = voters?.find((it) => it === value);

  return (
    <StyledListItem>
      <StyledAddressDisplay hideTooltip={true} full address={voter} />
      {currentWalletIndex > index ? (
        <BsFillCheckCircleFill />
      ) : (
        <Typography>Not sent</Typography>
      )}
    </StyledListItem>
  );
};

const Voters = () => {
  const { voters, currentWalletIndex = 0 } = useAirdropStore();

  return (
    <StyledFlexRow justifyContent="flex-start">
      <Typography>
        {`${currentWalletIndex} / ${_.size(voters).toLocaleString()} sent`}{" "}
      </Typography>
      <StyledSelectPopup>
        <VirtualList RowComponent={Voter} data={voters || []} itemSize={60} />
      </StyledSelectPopup>
    </StyledFlexRow>
  );
};

const StyledSelectPopup = styled("div")({
  ".select-btn": {},
});

const JettonDetails = () => {
  const { jettonAddress } = useAirdropStore();
  const { isLoading: assetLoading } = useReadNftItemMetadata(jettonAddress);

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
        <AssetMetadata address={jettonAddress} />
        <StyledFlexRow>
          {/* <Progress /> */}
          <Voters />
        </StyledFlexRow>
        <JettonTotalAmount />
        <JettonAmountPerWallet />
      </StyledFlexColumn>
    </StyledFlow>
  );
};

const JettonAction = () => {
  const { jettonAddress } = useAirdropStore();
  const { amountPerWallet } = useAmountPerWallet();
  const { data, isLoading: assetLoading } =
    useReadNftItemMetadata(jettonAddress);

  const { mutate, isLoading } = useTransferJetton();
  const amountPerWalletUI = useFormatNumber(amountPerWallet);
  const symbol = data?.metadata?.symbol || "";

  if (assetLoading) return null;

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
  const { jettonAddress } = useAirdropStore();
  const { data } = useReadNftItemMetadata(jettonAddress);

  const { amountUI } = useAmount();

  return (
    <Typography>{`Total airdrop amount: ${amountUI} ${data?.metadata?.symbol}`}</Typography>
  );
};

const JettonAmountPerWallet = () => {
  const { jettonAddress } = useAirdropStore();
  const { data } = useReadNftItemMetadata(jettonAddress);

  const { amountPerWalletUI } = useAmountPerWallet();

  return (
    <Typography>{`Each voter will receive: ${amountPerWalletUI} ${data?.metadata?.symbol}`}</Typography>
  );
};

const AssetMetadata = ({ address }: { address?: string }) => {
  const { data } = useReadNftItemMetadata(address);
  console.log(data);

  return (
    <StyledAssetMetadata>
      <Img src={data?.metadata?.image} />
      <StyledFlexColumn className="right">
        {data ? (
          <>
            <OverflowWithTooltip text={data?.metadata?.name} />
            <AddressDisplay padding={10} address={address} />
          </>
        ) : (
          <Typography>-</Typography>
        )}
      </StyledFlexColumn>
    </StyledAssetMetadata>
  );
};

const Progress = () => {
  const { voters, currentWalletIndex } = useAirdropStore();

  const percent = useMemo(() => {
    if (!voters || !currentWalletIndex) return 0;
    return (currentWalletIndex / _.size(voters)) * 100;
  }, [_.size(voters), currentWalletIndex]);

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
  return (
    <StyledFlow>
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        <Voters />
        <Typography>{`Each voter will receive: 1 NFT`}</Typography>
      </StyledFlexColumn>
    </StyledFlow>
  );
};

const NFTAction = () => {
  const { mutate, isLoading } = useTransferNFT();
  const [nftAddress, setnftAddress] = useState("");
  const [error, setError] = useState("");

  const onSend = () => {
    if (!nftAddress || !validateAddress(nftAddress)) {
      const _error = "Please enter a valid NFT address";
      setError(_error);
      errorToast(_error);
    } else {
      mutate(nftAddress);
    }
  };

  return (
    <StyledFlexColumn gap={30}>
      <NFTInput
        clearError={() => setError("")}
        error={error}
        onDebouce={setnftAddress}
      />
      {nftAddress && <AssetMetadata address={nftAddress} />}

      <NextVoter />
      <StyledSend isLoading={isLoading} onClick={onSend}>
        Send NFT
      </StyledSend>
    </StyledFlexColumn>
  );
};

const NextVoter = () => {
  const nextVoter = useNextVoter();
  const { type, jettonAddress } = useAirdropStore();
  const { data } = useReadNftItemMetadata(jettonAddress);

  return (
    <StyledNextVoter>
      {type === "nft" ? (
        <Typography className="text">NFT will be sent to:</Typography>
      ) : (
        <Typography className="text">
          {data?.metadata?.name} will be sent to:
        </Typography>
      )}
      <AddressDisplay address={nextVoter} padding={10} />
    </StyledNextVoter>
  );
};

const StyledNextVoter = styled(StyledFlexRow)({
  justifyContent: "center",
  marginTop: 0,
  ".text": {
    whiteSpace: "nowrap",
  },
});

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
      title="NFT item address"
      value={address}
      onChange={setAddress}
      endAdornment={<AirdropAssetImg address={debouncedValue} />}
    />
  );
};

const StyledAddressDisplay = styled(AddressDisplay)({
  flex: 1,
  maxWidth: "60%",
});

const StyledListItem = styled(StyledFlexRow)({
  justifyContent: "space-between",
});

const StyledContainer = styled(StyledFlexColumn)({});

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

const StyledAssetMetadata = styled(StyledFlexRow)({
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
