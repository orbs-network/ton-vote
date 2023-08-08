import { styled, Typography } from "@mui/material";
import {
  AddressDisplay,
  LoadingContainer,
  OverflowWithTooltip,
  TitleContainer,
  Img,
} from "components";
import { ReactNode } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import moment from "moment";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import {
  useAppParams,
  useIsOneWalletOneVote,
  useProposalStrategyName,
  useStrategyArguments,
  useStrategyAsset,
} from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { ONE_WALLET_ONE_VOTE_URL } from "consts";

const fromUnixToString = (time: number, format = "MMM DD, YYYY HH:mm") => {
  return `${moment.unix(time).utc().format(format)} UTC`;
};

export const Metadata = () => {
  const { proposalAddress } = useAppParams();
  const { isLoading, data } = useProposalQuery(proposalAddress);
  const translations = useProposalPageTranslations();
  const proposalMetadata = data?.metadata;
  const strategyName = useProposalStrategyName(proposalAddress);
  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <StyledInformation title={translations.information}>
      {proposalMetadata && (
        <StyledFlexColumn gap={12}>
          <InformationRow label={translations.startDate}>
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalStartTime))}
            </Typography>
          </InformationRow>
          <InformationRow label={translations.endDate}>
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalEndTime))}
            </Typography>
          </InformationRow>

          <InformationRow label={translations.snapshot}>
            <Typography>
              {fromUnixToString(Number(proposalMetadata.proposalSnapshotTime))}
            </Typography>
          </InformationRow>
          <InformationRow label={translations.contract}>
            <AddressDisplay address={proposalAddress} />
          </InformationRow>
          <InformationRow label={translations.votingStrategy}>
            {isOneWalletOneVote ? (
              <StyledLink href={ONE_WALLET_ONE_VOTE_URL} target="_blank">
                <OverflowWithTooltip text={strategyName} />
              </StyledLink>
            ) : (
              <OverflowWithTooltip text={strategyName} />
            )}
          </InformationRow>
          <Asset />
        </StyledFlexColumn>
      )}
    </StyledInformation>
  );
};

const StyledLink = styled("a")(({ theme }) => ({
  textDecoration: "unset",
  "&:hover": {
    textDecoration: "underline",
    textDecorationColor: theme.palette.text.primary,
  },
}));

const InformationRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  return (
    <StyledRow justifyContent="space-between" gap={50}>
      <Typography className="row-label">{label}</Typography>
      <div className="row-children">{children}</div>
    </StyledRow>
  );
};

const StyledRow = styled(StyledFlexRow)({
  width: "100%",
  ".row-label": {
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  ".row-children": {
    "*": {
      fontSize: 14,
      fontWeight: 400,
    },
  },
});

const StyledInformation = styled(TitleContainer)({
  width: "100%",
});

const Asset = () => {
  const { proposalAddress } = useAppParams();

  const { address, type, onlyAddress, name, image, url } = useStrategyAsset(proposalAddress);

  const label = type === "nft" ? "NFT Collection" : "Jetton";
  if (!address) {
    return null;
  }

  if (onlyAddress) {
    return (
      <InformationRow label={label}>
        <AddressDisplay address={address} />
      </InformationRow>
    );
  }

  return (
    <InformationRow label={label}>
      <StyledAsset href={url} target="_blank">
        <OverflowWithTooltip text={name} />
        {image && <Img className="asset-img" src={image} />}
      </StyledAsset>
    </InformationRow>
  );
};

const StyledAsset = styled("a")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 5,
  textDecoration: "unset",
  ".asset-img": {
    minWidth: 25,
    minHeight: 25,
    borderRadius: "50%",
  },
  "&:hover": {
    textDecoration: "underline",
    textDecorationColor: theme.palette.text.primary,
  },
}));
