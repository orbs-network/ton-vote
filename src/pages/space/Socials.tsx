import { Avatar, styled } from "@mui/material";
import React from "react";
import { StyledFlexRow } from "styles";

interface Props {
  twitter?: string;
  github?: string;
  website?: string;
  coingecko?: string;
  className?: string
}

function Socials({ twitter, github, website, coingecko, className = '' }: Props) {
  return (
    <StyledContainer className={className}>
      <Social url={twitter} img="" />
      <Social url={github} img="" />
      <Social url={website} img="" />
      <Social url={coingecko} img="" />
    </StyledContainer>
  );
}

export default Socials;

const Social = ({ url, img }: { url?: string; img: string }) => {
  if (!url) return null;
  return (
    <a href={url} target="_blank">
      <Avatar src={img} style={{ width: 30, height: 30 }} />
    </a>
  );
};

const StyledContainer = styled(StyledFlexRow)({});
