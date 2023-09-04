import { styled, Typography, useTheme } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { AppTooltip, Container, OverflowWithTooltip, VerifiedDao } from "components";
import { useMobile } from "hooks/hooks";
import _ from "lodash";
import { mock } from "mock/mock";
import { useIsDaoVerified } from "query/getters";
import { createContext, useContext, useMemo } from "react";
import { AiFillEyeInvisible } from "react-icons/ai";
import TextOverflow from "react-text-overflow";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Dao as DaoType } from "types";
import { makeElipsisAddress, parseLanguage } from "utils";
import {
  StyledDao,
  StyledDaoAvatar,
  StyledDaoContent,
  StyledHiddenIcon,
} from "./styles";

interface ContextType {
  dao: DaoType;
  onDaoClick: () => void;
}

const Context = createContext({} as ContextType);

const useDaoContext = () => useContext(Context);

const parseWesbite = (website: string) => {
  let value = website.replace("https://", "").replace("www.", "");

  if (_.last(value.split("")) === "/") {
    value = value.replace("/", "");
  }

  return value;
};

const useHideDao = (dao: DaoType) => {
  const walletAddress = useTonAddress();
  const hide = dao.daoMetadata?.metadataArgs.hide;

  const isOwner =
    dao.daoRoles.owner === walletAddress ||
    dao.daoRoles.proposalOwner === walletAddress;

  return useMemo(() => {
    if (hide && !isOwner) return true;
    return false;
  }, [isOwner, hide]);
};

export const DesktopDao = () => {
  const { onDaoClick } = useDaoContext();

  return (
    <StyledDao onClick={onDaoClick}>
      <StyledDaoContent className="container" hover>
        <HiddenIndicator />
        <StyledFlexColumn>
          <Avatar />
          <Name />
          <Address />
        </StyledFlexColumn>
        <Website />
      </StyledDaoContent>
    </StyledDao>
  );
};

const Avatar = () => {
  const { dao } = useDaoContext();
  return <StyledDaoAvatar src={dao.daoMetadata.metadataArgs.avatar} />;
};

const HiddenIndicator = () => {
  const { dao } = useDaoContext();
  const theme = useTheme();

  if (!dao.daoMetadata.metadataArgs.hide) return null;
  return (
    <AppTooltip text="Dao is hidden, you can change it in the settings page">
      <StyledHiddenIcon>
        <AiFillEyeInvisible
          style={{ width: 25, height: 25 }}
          color={theme.palette.primary.main}
        />
      </StyledHiddenIcon>
    </AppTooltip>
  );
};

const Name = () => {
  const { dao } = useDaoContext();
  const name = parseLanguage(dao.daoMetadata.metadataArgs?.name) || "";
  const prefix =   mock.isMockDao(dao.daoAddress) ? "(mock)" : "";
  return (
    <Typography className="title">
      <TextOverflow text={`${name}${prefix}`} />
    </Typography>
  );
};

const Website = () => {
  const { dao } = useDaoContext();
  const website = dao.daoMetadata.metadataArgs.website;
  const isVerified = useIsDaoVerified(dao.daoAddress);

  if (isVerified && website) {
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

const Address = () => {
  const { dao } = useDaoContext();
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

const MobileDao = () => {
  return (
    <StyledMobileDao>
      <StyledFlexRow>
        <Avatar />
        <StyledFlexColumn>
          <Name />
          <Address />
          <Website />
        </StyledFlexColumn>
      </StyledFlexRow>
    </StyledMobileDao>
  );
};

const StyledMobileDao = styled(Container)({
width:'100%',
height: 60,
padding:'0 10px',
})

export const Dao = ({ dao }: { dao: DaoType }) => {
  const isMobile = useMobile();
  const hideDao = useHideDao(dao);
  const { daoPage } = useAppNavigation();

  const onDaoClick = () => daoPage.root(dao.daoAddress);

  if (hideDao) return null;
  return (
    <Context.Provider value={{ dao, onDaoClick }}>
      {isMobile ? <MobileDao /> : <DesktopDao />}
    </Context.Provider>
  );
};
