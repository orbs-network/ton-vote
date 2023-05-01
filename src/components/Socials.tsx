import { Avatar, styled } from "@mui/material";
import React from "react";
import { StyledFlexRow } from "styles";
import {  AiFillGithub } from "react-icons/ai";
import {BsTelegram} from 'react-icons/bs'
import { ReactElement } from "react";
import {BsGlobe} from 'react-icons/bs'
import { IoNewspaperOutline } from "react-icons/io5";

interface Props {
  telegram?: string;
  github?: string;
  website?: string;
  coingecko?: string;
  className?: string;
  whitepaper?: string
  about?: string;
}

export function Socials({
  telegram,
  github,
  website,
  coingecko,
  className = "",
  whitepaper,
  about,
}: Props) {

  return (
    <StyledContainer className={className}>
      <Social url={telegram} icon={<BsTelegram size={20} />} />
      <Social url={github} icon={<AiFillGithub size={23} />} />
      <Social url={website} icon={<BsGlobe size={20} />} />
      <Social url={whitepaper} icon={<IoNewspaperOutline size={20} />} />
      <Social url={about} icon={<BsGlobe size={20} />} />
    </StyledContainer>
  );
}


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
   
    color: theme.palette.primary.main
  },
}));

const StyledContainer = styled(StyledFlexRow)({
  gap:10
});
