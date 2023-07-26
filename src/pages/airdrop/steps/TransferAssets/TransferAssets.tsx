import { styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  Button,
  Img,
  OverflowWithTooltip,
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
  useReadNftCollectionMetadata,
  useReadNftItemMetadata,
  useWalletNFTCollectionItemsQuery,
} from "query/getters";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { errorToast } from "toasts";
import { makeElipsisAddress } from "utils";

import {
  useAmountPerWallet,
  useNextVoter,
  useTransferJetton,
  useTransferNFT,
} from "../../hooks";
import { useAirdropStore } from "../../store";
import {
  StyledVirtualListContainer,
  StyledButton,
  StyledListTitleContainer,
} from "../../styles";

export const TransferAssets = () => {
  const { assetType, currentWalletIndex = 0, voters } = useAirdropStore();

  return (
    <StyledContainer>
      <StyledFlexColumn gap={20}>
        <TitleContainer
          title="Transfer assets"
          headerComponent={
            <Typography>
              {`${currentWalletIndex} / ${_.size(voters).toLocaleString()}`}{" "}
            </Typography>
          }
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="text" onClick={() => setOpen(true)}>
        Show all
      </Button>
      <StyledSelectPopup
        title="All voters"
        open={open}
        onClose={() => setOpen(false)}
      >
        <StyledVirtualList
          RowComponent={Voter}
          data={voters || []}
          itemSize={60}
        />
      </StyledSelectPopup>
    </>
  );
};

const StyledVirtualList = styled(VirtualList)({
  height: "100%",
});

const StyledSelectPopup = styled(Popup)({
  height: 600,
  maxWidth: 600,
});

const JettonAction = () => {
  const { jettonAddress } = useAirdropStore();
  const { data, isLoading: assetLoading } =
    useReadJettonWalletMedata(jettonAddress);

  const { amountPerWalletUI } = useAmountPerWallet();

  const { mutate, isLoading } = useTransferJetton();
  const symbol = data?.metadata?.symbol || "";
  const nextVoter = useNextVoter();

  return (
    <StyledFlexColumn gap={20} style={{ alignItems: "flex-start" }}>
      <JettonMetadata />
      <Typography whiteSpace="nowrap">
        Each wallet receive {`${amountPerWalletUI} ${symbol}`}
      </Typography>

      <StyledFlexRow justifyContent="flex-start">
        <Typography>Next voter: </Typography>
        <AddressDisplay address={nextVoter} />
        <VotersList />
      </StyledFlexRow>
      <StyledSend
        isLoading={isLoading}
        onClick={() => mutate()}
      >{`Transfer ${symbol}`}</StyledSend>
    </StyledFlexColumn>
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

const NFTMetadata = () => {
  const { nftCollection } = useAirdropStore();
  const { data, isLoading } = useReadNftCollectionMetadata(nftCollection);


  return (
    <StyledListTitleContainer title='NFT collection details'>
      <Metadata
        image={data?.metadata?.image}
        name={data?.metadata?.name}
        address={nftCollection}
        isLoading={isLoading}
      />
    </StyledListTitleContainer>
  );
};



const NFTRowItem = ({ value }: any) => {
  const { data } = useReadNftItemMetadata(value);

  return (
    <StyledNFTItemRow>
      <Img src={data?.image} />
      <StyledFlexColumn className="right">
        <OverflowWithTooltip text={data?.name} />
        <OverflowWithTooltip
          text={makeElipsisAddress(value)}
          tooltipText={value}
        />
      </StyledFlexColumn>
    </StyledNFTItemRow>
  );
};

const StyledNFTItemRow = styled(StyledFlexRow)({
  ".img": {
    width: 40,
    height: 40,
    borderRadius: "50%",
  },
  ".right": {
    flex: 1,
    width: "auto",
    alignItems: "flex-start",
    gap: 1,
    "*": {
      fontSize: 13,
    },
  },
});

const NFTItemsList = ({
  onSelect,
  selected,
}: {
  onSelect: (value: string) => void;
  selected: string;
}) => {
  const { nftCollection, NFTItemsRecipients } = useAirdropStore();
  const {
    data = [],
    isLoading,
    dataUpdatedAt,
  } = useWalletNFTCollectionItemsQuery(nftCollection);

  const nftItems = useMemo(() => {
    const transferedNFTs = _.values(NFTItemsRecipients);
    return _.filter(data, (item) => {
      return !transferedNFTs.includes(item);
    });
  }, [_.size(NFTItemsRecipients)]);

  if (isLoading) {
    return (
      <NFTItemsListContainer>
        <StyledLoadingList>
          <StyledNFTListItemLoader />
          <StyledNFTListItemLoader />
        </StyledLoadingList>
      </NFTItemsListContainer>
    );
  }

    if (_.isEmpty(nftItems)){
      return (
        <NFTItemsListContainer>
          <StyledEmptyList>
            <Typography>No NFTs left</Typography>
          </StyledEmptyList>
        </NFTItemsListContainer>
      );
    }
      return (
        <NFTItemsListContainer>
          <StyledList
            selected={[selected]}
            onSelect={onSelect}
            RowComponent={NFTRowItem}
            data={nftItems}
            itemSize={60}
          />
        </NFTItemsListContainer>
      );
};


const StyledEmptyList = styled(StyledFlexRow)({
  marginTop:20,
  marginBottom:20,
  marginLeft:'auto',
  marginRight:'auto',
})


const StyledLoadingList = styled(StyledFlexColumn)({
  height: 'auto'
})


const NFTItemsListContainer = ({children}:{children: ReactNode}) => {
  return (
    <StyledListContainer title="Select NFT">{children}</StyledListContainer>
  );
}

const StyledListContainer = styled(StyledListTitleContainer)({
 
});

const StyledNFTListItemLoader = styled(StyledSkeletonLoader)({
  height: "40px",
  borderRadius: 20,
});

const StyledList = styled(VirtualList)({
  height: 340,
  width: "100%",
});

const NFTAction = () => {
  const { mutate, isLoading } = useTransferNFT();
  const [nftAddress, setnftAddress] = useState("");
  const [error, setError] = useState("");

  const onSend = () => {
    if (!nftAddress) {
      const _error = "Please select NFT to send";
      setError(_error);
      errorToast(_error);
    } else {
      mutate(nftAddress);
    }
  };

  const onSelect = useCallback(
    (address: string) => {
      setnftAddress((prev) => {
        if (prev === address) {
          return "";
        }
        return address;
      });
    },
    [setnftAddress]
  );

  return (
    <StyledFlexColumn gap={20}>
      <NFTMetadata />

      <StyledFlexRow justifyContent="flex-start">
        <NextVoter />
        <VotersList />
      </StyledFlexRow>
      <NFTItemsList selected={nftAddress} onSelect={onSelect} />
      <StyledSend isLoading={isLoading} onClick={onSend}>
        Send NFT
      </StyledSend>
    </StyledFlexColumn>
  );
};

const NextVoter = () => {
  const nextVoter = useNextVoter();
  const { assetType, jettonAddress } = useAirdropStore();
  const { data } = useReadNftItemMetadata(jettonAddress);

  return (
    <StyledNextVoter>
      {assetType === "nft" ? (
        <Typography className="text">NFT will be sent to:</Typography>
      ) : (
        <Typography className="text">
          {data?.metadata?.name} will be sent to:
        </Typography>
      )}
      <AddressDisplay address={nextVoter} />
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

const StyledListItem = styled(StyledFlexRow)({
  justifyContent: "space-between",
});

const StyledContainer = styled(StyledFlexColumn)({});

const StyledSend = styled(StyledButton)({
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: 20
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

