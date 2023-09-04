import { Link, styled, Typography, useTheme } from "@mui/material";
import {
  AddressDisplay,
  LoadingContainer,
  OverflowWithTooltip,
  TitleContainer,
  Img,
} from "components";
import { ReactNode, useMemo } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import moment from "moment";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import {
  useAppParams,
  useIsOneWalletOneVote,
  useProposalStrategyName,
  useStrategyAsset,
} from "hooks/hooks";
import { useProposalQuery } from "query/getters";
import { ONE_WALLET_ONE_VOTE_URL } from "consts";
import { getTonScanContractUrl, getVoteStrategyType } from "utils";
import { VotingPowerStrategyType } from "ton-vote-contracts-sdk";
import CheckImg from "assets/check.svg";
import CheckImgGray from "assets/check-gray.svg";

const fromUnixToString = (time: number, format = "MMM DD, YYYY HH:mm") => {
  return `${moment.unix(time).utc().format(format)} UTC`;
};

export const Metadata = () => {
  const { proposalAddress } = useAppParams();
  const { isLoading, data, dataUpdatedAt } = useProposalQuery(proposalAddress);
  const translations = useProposalPageTranslations();
  const proposalMetadata = data?.metadata;
  const strategyName = useProposalStrategyName(proposalAddress);

  const type = useMemo(() => {
    return getVoteStrategyType(proposalMetadata?.votingPowerStrategies);
  }, [dataUpdatedAt]);

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <StyledInformation title={translations.information}>
      {proposalMetadata && (
        <>
          <StyledPadding>
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
                {fromUnixToString(
                  Number(proposalMetadata.proposalSnapshotTime)
                )}
              </Typography>
            </InformationRow>
            <InformationRow label={translations.contract}>
              <AddressDisplay address={proposalAddress} />
            </InformationRow>
            <InformationRow label={translations.votingStrategy}>
              <HandleStrategyNameDisplay name={strategyName} type={type} />
            </InformationRow>
            <Asset />
          </StyledPadding>
          <ExtraInfo />
        </>
      )}
    </StyledInformation>
  );
};

const StyledPadding = styled(StyledFlexColumn)({
  gap: 12,
  padding: 20,
  paddingBottom: 0,
});

const HandleStrategyNameDisplay = ({
  name,
  type,
}: {
  name?: string;
  type: VotingPowerStrategyType;
}) => {
  const { proposalAddress } = useAppParams();
  const isOneWalletOneVote = useIsOneWalletOneVote(proposalAddress);
  if (isOneWalletOneVote) {
    return (
      <StyledLink href={ONE_WALLET_ONE_VOTE_URL} target="_blank">
        <OverflowWithTooltip text={name} />
      </StyledLink>
    );
  }

  return <OverflowWithTooltip text={name} />;
};

const StyledLink = styled("a")(({ theme }) => ({
  textDecoration: "unset",
  color: theme.palette.text.primary,
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
    <StyledRow justifyContent="space-between" gap={10}>
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
  ".title-container-children": {
    padding: 0,
  },
});
const Asset = () => {
  const { proposalAddress } = useAppParams();

  const { address, type, onlyAddress, name, image, url } =
    useStrategyAsset(proposalAddress);

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

function ExtraInfo() {
  const { proposalAddress } = useAppParams();
  const { data, dataUpdatedAt } = useProposalQuery(proposalAddress);
  const theme = useTheme();
  const proposalStrategyType = useMemo(
    () => getVoteStrategyType(data?.metadata?.votingPowerStrategies),
    [dataUpdatedAt]
  );

  if (
    proposalStrategyType === VotingPowerStrategyType.TonBalanceWithValidators
  ) {
    return (
      <StyledExtraInfo>
        <img
          src={theme.palette.mode === "dark" ? CheckImg : CheckImgGray}
          className="check"
        />
        <Typography>
          Validators can participate in this vote.{" "}
          <Link
            href="https://github.com/orbs-network/ton-vote#supported-strategies"
            target="_blank"
          >
            Read more
          </Link>
        </Typography>
      </StyledExtraInfo>
    );
  }
  return <div style={{ marginTop: 20 }} />;
}

const StyledExtraInfo = styled(StyledFlexRow)({
  width: "100%",
  background: "rgba(0, 136, 204, 0.1)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  flexDirection: "row",
  padding: "14px 20px",
  gap: 12,
  marginTop: 14,
  ".check": {
    width: 22,
    height: 22,
    "*": {
      color: "yellow",
    },
  },
  p: {
    fontSize: 14,
    fontWeight: 600,
    width: "auto",
  },
});
