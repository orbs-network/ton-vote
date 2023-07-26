import { styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  OverflowWithTooltip,
  Search,
  TitleContainer,
} from "components";
import { Img } from "components";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";

export const StyledAirdropSearch = styled(Search)({
  height: "70%",
  flex: 1,
  maxWidth: 250,
});

export const StyledAirdropTitleContainer = styled(TitleContainer)({
  ".title-container-header": {
    padding: "0px 20px",
    height: 57,
  },
});

export const Metadata = ({
  image,
  name,
  address,
  isLoading,
  description,
}: {
  image?: string;
  name?: string;
  address?: string;
  isLoading?: boolean;
  description?: string;
}) => {
  return (
    <StyledAssetMetadata>
      <StyledFlexRow>
        {isLoading ? (
          <StyledSkeletonLoader className="img-loader" />
        ) : (
          <Img src={image} />
        )}
        <StyledFlexColumn className="right">
          {isLoading ? (
            <StyledFlexColumn style={{ alignItems: "flex-start" }}>
              <StyledSkeletonLoader className="name-loader" />
              <StyledSkeletonLoader className="address-loader" />
            </StyledFlexColumn>
          ) : (
            <>
              <OverflowWithTooltip className="name" text={name} />
              <AddressDisplay className="address" padding={10} address={address} />
            </>
          )}
        </StyledFlexColumn>
      </StyledFlexRow>
      {description && (
        <Typography className="description">{description}</Typography>
      )}
    </StyledAssetMetadata>
  );
};

const StyledAssetMetadata = styled(StyledFlexColumn)({
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: 10,
  p: {
    fontSize: 16,
  },
  ".right": {
    gap: 4,
    flex: 1,
    alignItems: "flex-start",
  },
  ".img, .img-loader": {
    width: 60,
    height: 60,
    borderRadius: "50%",
  },
  ".name": {
    fontWeight: 700,
  },
  ".address": {
    p: {
      fontSize: 14,
    },
  },

  ".name-loader": {
    width: 100,
    height: 20,
  },
  ".address-loader": {
    width: 150,
    height: 20,
  },
});
