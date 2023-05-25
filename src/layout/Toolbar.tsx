import { styled } from "@mui/material";
import { useTonAddress } from "@tonconnect/ui-react";
import { AppTooltip, Button, Img } from "components";
import { DevParametersModal } from "components/DevParameters";
import { IS_DEV } from "config";
import { TOOLBAR_WIDTH } from "consts";
import { useDevFeatures, useMobile, useRole } from "hooks";
import { useDaosPageTranslations } from "i18n/hooks/useDaosPageTranslations";
import { useDaosQuery } from "query/getters";
import { AiOutlinePlus } from "react-icons/ai";
import { Link, useParams } from "react-router-dom";
import { appNavigation, useAppNavigation } from "router/navigation";
import { StyledFlexColumn } from "styles";
import { getBorderColor } from "theme";
import { parseLanguage } from "utils";

export function Toolbar() {
  const navigation = useAppNavigation();
  const translations = useDaosPageTranslations();
  const devFeatures = useDevFeatures()
  const mobile = useMobile();

  if (mobile) return null;

  return (
    <StyledToolbar>
      <StyledFlexColumn gap={20}>
        <DevParametersModal />
        <AppTooltip
          text={
            devFeatures
              ? translations.createDao
              : `${translations.createDao} (comming soon)`
          }
          placement="right"
        >
          <StyledButton
            disabled={!devFeatures}
            onClick={devFeatures ? navigation.createSpace.root : () => {}}
            variant="transparent"
          >
            <AiOutlinePlus />
          </StyledButton>
        </AppTooltip>
      </StyledFlexColumn>
      <UserDaos />
    </StyledToolbar>
  );
}

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

const StyledToolbar = styled(StyledFlexColumn)(({ theme }) => ({
  width: TOOLBAR_WIDTH,
  height: "100%",
  background: theme.palette.background.paper,
  position: "fixed",
  left: 0,
  borderRight: `0.5px solid ${
    getBorderColor(theme.palette.mode)}`,
  zIndex: 30,
  top: 0,
  justifyContent: "flex-start",
  paddingTop: 20,
  gap: 0,
}));

const UserDaos = () => {
  const { data: daos } = useDaosQuery();
  const connectedWallet = useTonAddress();

  const { getRole } = useRole();

  const daoId = useParams().daoId;

  if (!connectedWallet) {
    return null;
  }

  return (
    <StyledUserDaos>
      {daos &&
        daos?.map((dao) => {
          const {isOwner, isProposalPublisher} = getRole(dao.daoRoles);
          
          if ((isOwner || isProposalPublisher)) {
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
          }
          return null;
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
