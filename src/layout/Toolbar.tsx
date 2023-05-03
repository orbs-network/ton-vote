import { styled } from "@mui/material";
import { AppTooltip, Button, Img } from "components";
import { useConnection } from "ConnectionProvider";
import { TOOLBAR_WIDTH } from "consts";
import { useDaosQuery } from "query/queries";
import { useTranslation } from "react-i18next";
import { AiOutlinePlus } from "react-icons/ai";
import { Link, useParams } from "react-router-dom";
import { appNavigation, useAppNavigation } from "router";
import { StyledFlexColumn } from "styles";
import { isOwner, parseLanguage } from "utils";

export function Toolbar() {
  const navigation = useAppNavigation();
  const {t} = useTranslation()

  return (
    <StyledToolbar>
      <StyledFlexColumn gap={20}>
        
        <AppTooltip text={t("createDaoSpace")} placement="right">
          <StyledButton
            onClick={navigation.createSpace.root}
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


const StyledToolbar = styled(StyledFlexColumn)({
  width: TOOLBAR_WIDTH,
  height: "100%",
  background: "white",
  position: "fixed",
  left: 0,
  borderRight: "0.5px solid rgba(114, 138, 150, 0.24)",
  zIndex: 30,
  top: 0,
  justifyContent: "flex-start",
  paddingTop: 20,
  gap: 0,
});

const UserDaos = () => {
  const { data: daos } = useDaosQuery();
  const connectedWallet = useConnection().address;

  const daoId = useParams().daoId;

  if (!connectedWallet) {
    return null;
  }

  return (
    <StyledUserDaos>
      {daos && daos?.map((dao) => {
        if (isOwner(connectedWallet, dao.daoRoles)) {
          const selected = daoId === dao.daoAddress;
          return (
            <StyledLink
              selected={selected ? 1 : 0}
              to={appNavigation.daoPage.root(dao.daoAddress)}
              key={dao.daoAddress}
            >
              <AppTooltip text={parseLanguage(dao.daoMetadata.name)} placement="right">
                <StyledDaoImg src={dao.daoMetadata.avatar} />
              </AppTooltip>
            </StyledLink>
          );
        }
        return null;
      })}
    </StyledUserDaos>
  );
};

const StyledLink = styled(Link)<{ selected: number }>(({ selected }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 5,
  transition: "0.2s all",
  boxShadow: selected === 1 ? "0px -1px 24px 4px rgba(0,136,204,1)" : "unset",
  borderRadius: "50%",
}));

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
