import { Avatar, styled } from "@mui/material";
import React from "react";
import { StyledFlexRow } from "styles";
import {  AiFillGithub } from "react-icons/ai";
import {BsTelegram} from 'react-icons/bs'
import { ReactElement } from "react";
import {BsGlobe} from 'react-icons/bs'

interface Props {
  telegram?: string;
  github?: string;
  website?: string;
  coingecko?: string;
  className?: string;
}

function Socials({
  telegram,
  github,
  website,
  coingecko,
  className = "",
}: Props) {
  return (
    <StyledContainer className={className}>
      <Social url={telegram} icon={<BsTelegram />} />
      <Social url={github} icon={<AiFillGithub />} />
      <Social url={website} icon={<BsGlobe />} />
    </StyledContainer>
  );
}

export default Socials;

const Social = ({ url, icon }: { url?: string; icon: ReactElement }) => {
  if (!url) return null;
  return (
    <StyledSocial href={url} target="_blank">
      {icon}
    </StyledSocial>
  );
};

const StyledSocial = styled("a")(({ theme }) => ({
  svg: {
    width: 25,
    height: 25,
    color: theme.palette.primary.main
  },
}));

const StyledContainer = styled(StyledFlexRow)({
  gap:10
});
