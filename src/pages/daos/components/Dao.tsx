import { styled, Typography, useTheme } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import {
  AppTooltip,
  Img,
  OverflowWithTooltip,
  VerifiedDao,
} from "components";
import { MOBILE_WIDTH } from "consts";
import { useMobile } from "hooks/hooks";
import _ from "lodash";
import { mock } from "mock/mock";
import { useIsDaoVerified } from "query/getters";
import { createContext, useContext, useMemo } from "react";
import { AiFillEyeInvisible } from "react-icons/ai";
import TextOverflow from "react-text-overflow";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow, StyledSkeletonLoader } from "styles";
import { Dao as DaoType } from "types";
import { makeElipsisAddress, parseLanguage } from "utils";
import { StyledDesktopDao, StyledHiddenIcon, StyledMobileDao } from "../styles";

interface ContextType {
  dao: DaoType;
  onSelect: () => void;
  isSelected?: boolean;
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
  const { onSelect } = useDaoContext();

  return (
    <StyledDesktopDao onClick={onSelect} hover>
      <HiddenIndicator />
      <StyledFlexColumn>
        <Avatar />
        <Name />
        <Address />
      </StyledFlexColumn>
      <Website />
    </StyledDesktopDao>
  );
};

const Avatar = () => {
  const { dao } = useDaoContext();
  return <StyledDaoAvatar src={dao.daoMetadata.metadataArgs.avatar} />;
};

const StyledDaoAvatar = styled(Img)({
  width: 55,
  height: 55,
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: 20,
  overflow: "hidden",
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    width: 45,
    height: 45,
    marginBottom: 0,
  },
});

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
  const prefix = mock.isMockDao(dao.daoAddress) ? "(mock)" : "";
  return (
    <StyledName>
      <TextOverflow text={`${name}${prefix}`} />
    </StyledName>
  );
};

const StyledName = styled(Typography)(({ theme }) => ({
  fontSize: 18,
  fontWeight: 800,
  width: "100%",
  textAlign: "center",
  color: theme.typography.h2.color,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 15,
    textAlign: "left",
    fontWeight: 600,
  },
}));

const Website = () => {
  const { dao } = useDaoContext();
  const website = dao.daoMetadata.metadataArgs.website;
  const isVerified = useIsDaoVerified(dao.daoAddress);

  const onClick = (e: any) => {
    e.stopPropagation();
    window.open(website, "_blank");
  };

  if (!isVerified || !website) return null;

  return (
    <StyledWebsite onClick={onClick}>
      <OverflowWithTooltip text={parseWesbite(website)} />
    </StyledWebsite>
  );
};

const StyledWebsite = styled("button")(({ theme }) => ({
  marginLeft: "auto",
  marginRight: "auto",
  width: "fit-content",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  borderBottom: "1px solid transparent",
  transition: "0.2s all",
  padding: 0,
  marginTop: "auto",
  p: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: "normal",
    color: theme.palette.primary.main,
  },
  "&:hover": {
    borderBottom: `1px solid ${theme.palette.primary.main}`,
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    marginRight:'auto',
    marginLeft:'unset',
  }
}));

const Address = () => {
  const { dao } = useDaoContext();
  const metadataArgs = dao.daoMetadata?.metadataArgs;
  return (
    <StyledAddress>
      {metadataArgs.dns ? (
        <OverflowWithTooltip className="value" text={metadataArgs.dns} />
      ) : (
        <Typography className="value">
          {makeElipsisAddress(dao.daoAddress, 6)}
        </Typography>
      )}
      <VerifiedDao daoAddress={dao.daoAddress} />
    </StyledAddress>
  );
};

const StyledAddress = styled(StyledFlexRow)({
  width: "auto",
  ".value": {
    textAlign: "center",
    fontSize: 16,
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    ".value": {
      fontSize: 13,
      textAlign: "left",
    },
  },
});

const MobileDao = () => {
  const { onSelect , isSelected} = useDaoContext();
  return (
    <StyledMobileDao onClick={onSelect} isSelected={isSelected ? 1 : 0}>
      <Avatar />
      <StyledMobileDaoRight>
        <Name />
        <Address />
        <Website />
      </StyledMobileDaoRight>
    </StyledMobileDao>
  );
};

const StyledMobileDaoRight = styled(StyledFlexColumn)({
  flex: 1,
  alignItems: "flex-start",
  gap: 2,
});



export const Dao = ({
  dao,
  onSelect,
  isSelected,
}: {
  dao: DaoType;
  onSelect: (dao: DaoType) => void;
  isSelected?: boolean;
}) => {
  const isMobile = useMobile();
  const hideDao = useHideDao(dao);

  if (hideDao) return null;
  return (
    <Context.Provider
      value={{ dao, onSelect: () => onSelect(dao), isSelected }}
    >
      {isMobile ? <MobileDao /> : <DesktopDao />}
    </Context.Provider>
  );
};



export const DaoLoader = () => {
  const mobile = useMobile();

  if(mobile) {
    return (
      <StyledMobileDao>
        <StyledSkeletonLoader
          style={{ borderRadius: "50%", width: 45, height: 45 }}
        />
        <StyledFlexColumn style={{ alignItems: "flex-start", flex: 1 }}>
          <StyledSkeletonLoader style={{ width: "70%", height: 20 }} />
          <StyledSkeletonLoader style={{ height: 20 }} />
        </StyledFlexColumn>
      </StyledMobileDao>
    );
  }

  return (
    <StyledDesktopDao>
      <StyledSkeletonLoader
        style={{ borderRadius: "50%", width: 70, height: 70 }}
      />
      <StyledSkeletonLoader style={{ width: "70%" }} />
      <StyledSkeletonLoader />
    </StyledDesktopDao>
  );
}




