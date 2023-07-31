import { Typography, styled } from "@mui/material";
import { Img, OverflowWithTooltip, VirtualList } from "components";
import _ from "lodash";
import { useAirdropPersistStore } from "pages/airdrop/store";
import { StyledListTitleContainer } from "pages/airdrop/styles";
import { useReadNftItemMetadata, useWalletNFTCollectionItemsQuery } from "query/getters";
import { useMemo, ReactNode } from "react";
import { StyledFlexRow, StyledFlexColumn, StyledSkeletonLoader } from "styles";
import { makeElipsisAddress } from "utils";

const NFTItemsList = ({
  onSelect,
  selected,
}: {
  onSelect: (value: string) => void;
  selected: string;
}) => {
  const { nftCollection, NFTItemsRecipients } = useAirdropPersistStore();
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
  marginTop: 20,
  marginBottom: 20,
  marginLeft: "auto",
  marginRight: "auto",
});

const StyledLoadingList = styled(StyledFlexColumn)({
  height: "auto",
});

const NFTItemsListContainer = ({ children }: { children: ReactNode }) => {
  return (
    <StyledListContainer title="Select NFT">{children}</StyledListContainer>
  );
};

const StyledListContainer = styled(StyledListTitleContainer)({});

const StyledNFTListItemLoader = styled(StyledSkeletonLoader)({
  height: "40px",
  borderRadius: 20,
});

const StyledList = styled(VirtualList)({
  height: 340,
  width: "100%",
});


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
