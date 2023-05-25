import { styled, Typography } from "@mui/material";
import { AddressDisplay, Button, Popup } from "components";
import React from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { useAppNavigation } from "router/navigation";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useCreatDaoStore } from "./store";

function Confirmation() {
  const { daoAddress, createDaoSuccessModal, setCreateDaoSuccessModal } =
    useCreatDaoStore();
  const { daoPage } = useAppNavigation();
  return (
    <StyledPopup onClose={() => {}} open={createDaoSuccessModal}>
      <StyledContent gap={30}>
        <StyledFlexRow gap={20}>
          <StyledTitle>Dao created successfully</StyledTitle>
          <StyledCheckIcon />
        </StyledFlexRow>
        <AddressDisplay address={daoAddress} />
        <StyledButtons>
          <Button onClick={() => setCreateDaoSuccessModal(true)}>Close</Button>
          <Button onClick={() => {
            daoPage.root(daoAddress!);
            setCreateDaoSuccessModal(false);
          }}>View Dao</Button>
        </StyledButtons>
      </StyledContent>
    </StyledPopup>
  );
}

const StyledCheckIcon = styled(BsCheckCircleFill)(({ theme }) => ({
  color: theme.palette.primary.main,
  width: 30,
  height: 30,
}));

const StyledTitle = styled(Typography)({
  fontSize: 22,
  fontWeight: 600,
});

const StyledPopup = styled(Popup)({
  maxWidth: 500,
});

const StyledButtons = styled(StyledFlexRow)({
  button: {
    width: "40%",
  },
});

const StyledContent = styled(StyledFlexColumn)({});

export default Confirmation;
