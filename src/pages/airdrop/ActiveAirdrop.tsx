import { CircularProgress, styled, Typography } from "@mui/material";
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
import SelectPopup from "components/SelectPopup";
import { useDebounce, useFormatNumber } from "hooks/hooks";
import _ from "lodash";
import { useAssetMetadataQuery } from "query/getters";
import { useEffect, useMemo, useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { useAirdropStore } from "store";
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
import { StyledButton } from "./styles";

export const ActiveAirdrop = () => {
  const { type } = useAirdropStore();

  return (
    <StyledContainer>
      <StyledFlexColumn gap={20}>
        <TitleContainer title="Airdrop details">
          {type === "nft" ? <NFTDetails /> : <JettonDetails />}
        </TitleContainer>

        {type === "nft" ? <NFTAction /> : <JettonAction />}
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
        {`${currentWalletIndex} / ${_.size(voters)} sent`}{" "}
      </Typography>
      <StyledSelectPopup>
        <SelectPopup
          RowComponent={Voter}
          buttonText="Show all"
          title="Selected Voters"
          data={voters || []}
          selected={[]}
          itemSize={60}
        />
      </StyledSelectPopup>
    </StyledFlexRow>
  );
};

const StyledSelectPopup = styled("div")({
  ".select-btn": {},
});

const JettonDetails = () => {
  const { jettonAddress } = useAirdropStore();
  const { isLoading: assetLoading } = useAssetMetadataQuery(jettonAddress);

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
    useAssetMetadataQuery(jettonAddress);

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
  const { data } = useAssetMetadataQuery(jettonAddress);

  const { amountUI } = useAmount();

  return (
    <Typography>{`Total airdrop amount: ${amountUI} ${data?.metadata?.symbol}`}</Typography>
  );
};

const JettonAmountPerWallet = () => {
  const { jettonAddress } = useAirdropStore();
  const { data } = useAssetMetadataQuery(jettonAddress);

  const { amountPerWalletUI } = useAmountPerWallet();

  return (
    <Typography>{`Each voter will receive: ${amountPerWalletUI} ${data?.metadata?.symbol}`}</Typography>
  );
};

const JettonMetadata = () => {
  const { jettonAddress } = useAirdropStore();
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
  const { amount } = useAmount();
  return (
    <StyledFlow>
      <StyledFlexColumn alignItems="flex-start" gap={20}>
        {/* <Progress /> */}
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
  const nextVoter = useNextVoter();

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
      endAdornment={<AirdropAssetImg address={debouncedValue} />}
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
