import { Box, styled, Typography } from "@mui/material";
import { borderRadius } from "@mui/system";
import { Container, Img } from "components";
import React from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { useCreatDaoStore } from "./store";

import { AiFillGithub, AiFillTwitterCircle } from "react-icons/ai";
import { BiWorld } from "react-icons/bi";
import { IconType } from "react-icons";

function Preview() {
  const { formData, avatar } = useCreatDaoStore();
  const { name, website, github, twitter, terms } = formData;
  return (
    <StyledContainer title="Dao preview">
      <StyledFlexColumn gap={30}>
        <StyledAvatar>
          {avatar && <StyledAvatarImg src={URL.createObjectURL(avatar)} />}
        </StyledAvatar>
        {name && <Typography>{name}</Typography>}
        <StyledFlexRow>
          {github && <Social Icon={AiFillGithub} url={github} />}
          {twitter && <Social Icon={AiFillTwitterCircle} url={twitter} />}
          {website && <Social Icon={BiWorld} url={website} />}
        </StyledFlexRow>
      </StyledFlexColumn>
    </StyledContainer>
  );
}

const Social = ({ Icon, url }: { Icon: IconType; url: string }) => {
  return (
    <StyledSocial href={url} target="_blank">
      <Icon style={{ width: 30, height: 30, color: "gray" }} />
    </StyledSocial>
  );
};

const StyledSocial = styled("a")({});

export default Preview;

const StyledAvatar = styled(Box)({
  width: 70,
  height: 70,
  borderRadius: "50%",
  overflow: "hidden",
  background: "rgba(211, 211, 211, 0.6)",
});

const StyledAvatarImg = styled(Img)({
  width: "100%",
  height: "100%",
});

const StyledContainer = styled(Container)({
    position:'sticky',
    top: 100,
    width: 500
});
