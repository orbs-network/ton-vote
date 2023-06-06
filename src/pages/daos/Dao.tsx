import { Typography, useTheme } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import {
  AppTooltip,
  Container,
  Link,
  OverflowWithTooltip,
  VerifiedDao,
} from "components";
import _ from "lodash";
import { mock } from "mock/mock";
import { AiFillEyeInvisible } from "react-icons/ai";
import { useIntersectionObserver } from "react-intersection-observer-hook";
import TextOverflow from "react-text-overflow";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Dao } from "types";
import {
  getIsVerifiedDao,
  makeElipsisAddress,
  parseLanguage,
} from "utils";
import {
  StyledDao,
  StyledDaoAvatar,
  StyledDaoContent,
  StyledHiddenIcon,
} from "./styles";

const parseWesbite = (website: string) => {
  let value = website.replace("https://", "").replace("www.", "");

  if (_.last(value.split("")) === "/") {
    value = value.replace("/", "");
  }

  return value;
};

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
          </StyledFlexColumn>
        ) : null}
        <Website dao={dao} />
      </StyledDaoContent>
    </StyledDao>
  );
};

const Website = ({ dao }: { dao: Dao }) => {
  const website = dao.daoMetadata.metadataArgs.website;

  if (getIsVerifiedDao(dao.daoAddress) && website) {
    return (
      <button
        className="website"
        onClick={(e) => {
          e.stopPropagation();
          window.open(website, "_blank");
        }}
      >
        <OverflowWithTooltip text={parseWesbite(website)} />
      </button>
    );
  }
  return null;
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
