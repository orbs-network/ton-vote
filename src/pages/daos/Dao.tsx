import { Chip, Typography, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useTonAddress } from "@tonconnect/ui-react";
import {
  AppTooltip,
  Container,
  Link,
  OverflowWithTooltip,
  VerifiedDao,
} from "components";
import { useCommonTranslations } from "i18n/hooks/useCommonTranslations";
import { mock } from "mock/mock";
import { AiFillEyeInvisible } from "react-icons/ai";
import { BsGlobeAmericas } from "react-icons/bs";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import TextOverflow from "react-text-overflow";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Dao } from "types";
import {
  getIsVerifiedDao,
  makeElipsisAddress,
  nFormatter,
  parseLanguage,
} from "utils";
import {
  StyledDao,
  StyledDaoAvatar,
  StyledDaoContent,
  StyledHiddenIcon,
  StyledWebsiteChip,
} from "./styles";

export const DaoListItem = ({ dao }: { dao: Dao }) => {
  const [ref, { entry }] = useIntersectionObserver();
  const isVisible = entry && entry.isIntersecting;
  const { daoPage } = useAppNavigation();
  const metadataArgs = dao.daoMetadata?.metadataArgs;
  const walletAddress = useTonAddress();
  const theme = useTheme();

  const isOwner =
    dao.daoRoles.owner === walletAddress ||
    dao.daoRoles.proposalOwner === walletAddress;

  if (metadataArgs.hide && !isOwner) return null;

  const mockPrefix = mock.isMockDao(dao.daoAddress) ? "(mock)" : "";

  const name = parseLanguage(metadataArgs?.name) || "";
  const website = dao.daoMetadata.metadataArgs.website;

  return (
    <StyledDao ref={ref} onClick={() => daoPage.root(dao.daoAddress)}>
      <StyledDaoContent className="container" hover>
        {metadataArgs.hide && (
          <AppTooltip text="Dao is hidden, you can change it in the settings page">
            <StyledHiddenIcon>
              <AiFillEyeInvisible
                style={{ width: 25, height: 25 }}
                color={theme.palette.primary.main}
              />
            </StyledHiddenIcon>
          </AppTooltip>
        )}
        {isVisible ? (
          <StyledFlexColumn>
            <StyledDaoAvatar src={metadataArgs?.avatar} />
            <Typography className="title">
              <TextOverflow text={`${name}${mockPrefix}`} />
            </Typography>
            <Address dao={dao} />
            {getIsVerifiedDao(dao.daoAddress) && website && (
              <button
                className="website"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(website, "_blank");
                }}
              >
                <StyledWebsiteChip
                  label={
                    <StyledFlexRow>
                      <Typography>
                        <TextOverflow text="Project website" />
                      </Typography>
                      <BsGlobeAmericas />
                    </StyledFlexRow>
                  }
                />
              </button>
            )}
          </StyledFlexColumn>
        ) : null}
      </StyledDaoContent>
    </StyledDao>
  );
};

const useJoinDao = () => {
  return useMutation(async () => {});
};

const Address = ({ dao }: { dao: Dao }) => {
  const metadataArgs = dao.daoMetadata?.metadataArgs;
  return (
    <StyledFlexRow className="address">
      {metadataArgs.dns ? (
        <OverflowWithTooltip
          className="address-value"
          text={metadataArgs.dns}
        />
      ) : (
        <Typography className="address-value">
          {makeElipsisAddress(dao.daoAddress, 6)}
        </Typography>
      )}
      <VerifiedDao daoAddress={dao.daoAddress} />
    </StyledFlexRow>
  );
};
