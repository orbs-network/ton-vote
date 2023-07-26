import { styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  Button,
  Popup,
  TextInput,
  TitleContainer,
} from "components";
import { VirtualList } from "components";
import { useDebounce } from "hooks/hooks";
import _ from "lodash";
import { Metadata } from "pages/airdrop/Components";
import {
  useReadJettonWalletMedata,
  useReadNftItemMetadata,
} from "query/getters";
import { useEffect, useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { errorToast } from "toasts";
import { validateAddress } from "utils";

import {
  useAmountPerWallet,
  useNextVoter,
  useTransferJetton,
  useTransferNFT,
} from "../../hooks";
import { useAirdropStore } from "../../store";
import {
  StyledButton,
  StyledListTitleContainer,
  StyledSelectPopup,
} from "../../styles";

export const TransferAssets = () => {
  const { assetType } = useAirdropStore();

  return (
    <StyledContainer>
      <StyledFlexColumn gap={20}>
        <TitleContainer title="Transfer assets" headerComponent={<Status />}>
          {assetType === "nft" ? <NFTAction /> : <JettonAction />}
        </TitleContainer>
      </StyledFlexColumn>
    </StyledContainer>
  );
};

const Status = ({ className = "" }: { className?: string }) => {
  const { currentWalletIndex = 0, voters } = useAirdropStore();

  return (
    <StyledStatus className={className}>
      {`${currentWalletIndex}/${_.size(voters).toLocaleString()}`}{" "}
    </StyledStatus>
  );
};

const StyledStatus = styled(Typography)({
  fontSize: 14,
});

const Voter = ({ value, index }: { value: string; index: number }) => {
  const { voters, currentWalletIndex = 0 } = useAirdropStore();

  const voter = voters?.find((it) => it === value);

  return (
    <StyledListItem>
      <AddressDisplay address={voter} padding={12} />
      {currentWalletIndex > index ? (
        <BsFillCheckCircleFill />
      ) : (
        <Typography>Not sent</Typography>
      )}
    </StyledListItem>
  );
};

const VotersList = () => {
  const { voters } = useAirdropStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="text" onClick={() => setOpen(true)}>
        Show all voters
      </Button>
      <StyledSelectPopup
        title="All voters"
        open={open}
        onClose={() => setOpen(false)}
      >
        <>
          <StyledVirtualList
            RowComponent={Voter}
            data={voters || []}
            itemSize={60}
          />
          <Button onClick={() => setOpen(false)}>Close</Button>
        </>
      </StyledSelectPopup>
    </>
  );
};

const StyledVirtualList = styled(VirtualList)({
  flex: 1,
});

const JettonAction = () => {
  const { jettonAddress, currentWalletIndex = 0, voters } = useAirdropStore();
  const { data } = useReadJettonWalletMedata(jettonAddress);

  const { amountPerWalletUI } = useAmountPerWallet();

  const { mutate, isLoading } = useTransferJetton();
  const symbol = data?.metadata?.symbol || "";
  const nextVoter = useNextVoter();

  return (
    <StyledActionContainer>
      <JettonMetadata />
      <Typography whiteSpace="nowrap">
        Each wallet receive {`${amountPerWalletUI} ${symbol}`}
      </Typography>

      <NextVoter />
      <StyledSend isLoading={isLoading} onClick={() => mutate()}>
        Send {`${currentWalletIndex}/${_.size(voters).toLocaleString()}`}
      </StyledSend>
    </StyledActionContainer>
  );
};

const JettonMetadata = () => {
  const { jettonAddress } = useAirdropStore();

  const { data, isLoading } = useReadJettonWalletMedata(jettonAddress);
  return (
    <StyledListTitleContainer title="Jetton details">
      <Metadata
        image={data?.metadata?.image}
        name={data?.metadata?.name}
        address={jettonAddress}
        isLoading={isLoading}
      />
    </StyledListTitleContainer>
  );
};

const NFTMetadata = ({ address }: { address?: string }) => {
  const { data, isLoading } = useReadNftItemMetadata(address);

  return (
    <StyledListTitleContainer title="NFT Item details">
      <Metadata
        image={data?.image}
        name={data?.name}
        address={address}
        isLoading={!!address && !!validateAddress(address) && isLoading}
      />
    </StyledListTitleContainer>
  );
};

const NFTAction = () => {
  const { currentWalletIndex = 0, voters } = useAirdropStore();
  const { mutate, isLoading } = useTransferNFT();
  const [nftAddress, setNftAddress] = useState("");

  const onSend = () => {
    if (!nftAddress) {
      const _error = "Please enter NFT item address";
      errorToast(_error);
    } else {
      mutate({
        NFTItemAddress: nftAddress,
        onSuccess: () => setNftAddress(""),
      });
    }
  };

  return (
    <StyledActionContainer>
      <NFTItemInput initialValue={nftAddress} setNftAddress={setNftAddress} />
      <NFTMetadata address={nftAddress} />
      <NextVoter />

      <StyledSend isLoading={isLoading} onClick={onSend}>
        Send {`${currentWalletIndex}/${_.size(voters).toLocaleString()}`}
      </StyledSend>
    </StyledActionContainer>
  );
};

const StyledActionContainer = styled(StyledFlexColumn)({
  gap: 20,
  alignItems: "flex-start",
});

const NFTItemInput = ({
  setNftAddress,
  initialValue,
}: {
  setNftAddress: (value: string) => void;
  initialValue: string;
}) => {
  const [value, setValue] = useState("");

  const debouncedValue = useDebounce<string>(value, 300);

  useEffect(() => {
    setNftAddress(debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    if (!initialValue) {
      setValue("");
    }
  }, [initialValue]);

  return (
    <TextInput
      value={value}
      onChange={setValue}
      placeholder="Enter NFT address"
    />
  );
};

const NextVoter = () => {
  const nextVoter = useNextVoter();
  const { assetType } = useAirdropStore();

  return (
    <StyledNextVoter>
      <StyledFlexColumn>
        {assetType === "nft" ? (
          <Typography className="text">NFT will be sent to:</Typography>
        ) : (
          <Typography className="text">Jettons will be sent to:</Typography>
        )}
        <AddressDisplay className="address" full address={nextVoter} />
      </StyledFlexColumn>
      <VotersList />
    </StyledNextVoter>
  );
};

const StyledNextVoter = styled(StyledFlexColumn)({
  justifyContent: "center",
  marginTop: 0,
  ".text": {
    whiteSpace: "nowrap",
    fontWeight: 600,
    fontSize: 16,
  },
  ".address": {
    p: {
      fontSize: 14,
    },
  },
});

const StyledListItem = styled(StyledFlexRow)({
  justifyContent: "space-between",
});

const StyledContainer = styled(StyledFlexColumn)({});

const StyledSend = styled(StyledButton)({
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 20,
});
