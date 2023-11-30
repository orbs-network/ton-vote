import { styled, useTheme } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { AppTooltip, Button, Img } from "components";
import { DevParametersModal } from "components/DevParameters";
import { TELEGRAM_SUPPORT_GROUP } from "config";
import { TOOLBAR_WIDTH } from "consts";
import { Link, useParams } from "react-router-dom";
import { appNavigation, useAppNavigation } from "router/navigation";
import { StyledFlexColumn } from "styles";
import { getBorderColor } from "theme";
import { parseLanguage } from "utils";
import { IoHelpSharp } from "react-icons/io5";
import { useActions, useWalletDaos } from "./hooks";

export function Desktop() {
  const theme = useTheme();
  const actions = useActions();

  return (
    <StyledToolbar>
      <StyledFlexColumn gap={20}>
        <DevParametersModal />
        {actions.map((action, index) => {
          return (
            <NavigationBtn
              key={index}
              tooltip={action.title}
              icon={<action.icon />}
              onClick={action.onClick}
            />
          );
        })}
      </StyledFlexColumn>

      <UserDaos />
      <StyledSupportTooltip placement="right" text="Telegram support group">
        <StyledSupport
          variant="transparent"
          onClick={() => window.open(TELEGRAM_SUPPORT_GROUP, "_target")}
        >
          <IoHelpSharp
            style={{ width: 30, height: 30, color: theme.palette.primary.main }}
          />
        </StyledSupport>
      </StyledSupportTooltip>
    </StyledToolbar>
  );
}

const NavigationBtn = ({
  tooltip,
  onClick,
  icon,
}: {
  tooltip: string;
  onClick: any;
  icon: JSX.Element;
}) => {
  return (
    <AppTooltip text={tooltip} placement="right">
      <StyledButton onClick={onClick} variant="transparent">
        {icon}
      </StyledButton>
    </AppTooltip>
  );
};

const StyledSupportTooltip = styled(AppTooltip)({
  marginTop: "auto",
  cursor: "pointer",
  marginBottom: 20,
});

const StyledButton = styled(Button)({
  borderRadius: "50%",
  cursor: "pointer",
  padding: 10,
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  svg: {
    width: 20,
    height: 20,
  },
});
const StyledSupport = styled(StyledButton)({});
const StyledToolbar = styled(StyledFlexColumn)(({ theme }) => ({
  width: TOOLBAR_WIDTH,
  height: "100%",
  background: theme.palette.background.paper,
  position: "fixed",
  left: 0,
  borderRight: `0.5px solid ${getBorderColor(theme.palette.mode)}`,
  zIndex: 30,
  top: 0,
  justifyContent: "flex-start",
  paddingTop: 20,
  gap: 0,
}));

const UserDaos = () => {
  const daos = useWalletDaos();
  const connectedWallet = useTonAddress();
  const daoId = useParams().daoId;

  if (!connectedWallet) {
    return null;
  }

  return (
    <StyledUserDaos>
      {daos.map((dao) => {
        const selected = daoId === dao.daoAddress;
        return (
          <StyledLink
            selected={selected ? 1 : 0}
            to={appNavigation.daoPage.root(dao.daoAddress)}
            key={dao.daoAddress}
          >
            <AppTooltip
              text={parseLanguage(dao.daoMetadata.metadataArgs.name)}
              placement="right"
            >
              <StyledDaoImg src={dao.daoMetadata.metadataArgs.avatar} />
            </AppTooltip>
          </StyledLink>
        );
      })}
    </StyledUserDaos>
  );
};

const StyledLink = styled(Link)<{ selected: number }>(({ selected, theme }) => {
  const shadow =
    theme.palette.mode === "light"
      ? "0px -1px 24px 4px rgba(0,136,204,1)"
      : "0px -1px 15px 4px rgba(255,255,255,0.2)";
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    transition: "0.2s all",
    boxShadow: selected === 1 ? shadow : "unset",
    borderRadius: "50%",
  };
});

const StyledDaoImg = styled(Img)({
  width: 40,
  height: 40,
  borderRadius: "50%",
});

const StyledUserDaos = styled(StyledFlexColumn)({
  flex: 1,
  gap: 20,
  overflow: "auto",
  paddingBottom: 50,
  justifyContent: "flex-start",
  paddingTop: 20,
});
