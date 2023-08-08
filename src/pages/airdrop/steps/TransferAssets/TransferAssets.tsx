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
import { useAirdropTranslations } from "i18n/hooks/useAirdropTranslations";
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
  useDisplayWalletIndex,
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
  const t = useAirdropTranslations();

  return (
    <StyledContainer>
      <StyledFlexColumn gap={20}>
        <TitleContainer
          title={t.titles.transferAssets}
          headerComponent={<VotersList />}
        >
          {assetType === "nft" ? <NFTAction /> : <JettonAction />}
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
    const walletIndex = useDisplayWalletIndex();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="text" onClick={() => setOpen(true)}>
        {`${walletIndex}/${_.size(voters).toLocaleString()}`}{" "}
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
            displayOnly={true}
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
  const { jettonAddress, voters } = useAirdropStore();
  const walletIndex = useDisplayWalletIndex();
  const { data } = useReadJettonWalletMedata(jettonAddress);
  const { amountPerWalletUI } = useAmountPerWallet();
  const { mutate, isLoading } = useTransferJetton();
  const nextVoter = useNextVoter()
  const symbol = data?.metadata?.symbol || "";

  return (
    <StyledActionContainer>
      <StyledNextVoter>
        <StyledFlexColumn>
          <Typography className="text">
            Send {amountPerWalletUI} {symbol} to:
          </Typography>
          <AddressDisplay className="address" full address={nextVoter} />
        </StyledFlexColumn>
      </StyledNextVoter>
      <StyledSend isLoading={isLoading} onClick={() => mutate()}>
        Send {`${walletIndex}/${_.size(voters).toLocaleString()}`}
      </StyledSend>
    </StyledActionContainer>
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
  const { voters } = useAirdropStore();
const walletIndex = useDisplayWalletIndex();
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
        Send {`${walletIndex}/${_.size(voters).toLocaleString()}`}
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
      required={true}
      title="NFT item address"
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
});
