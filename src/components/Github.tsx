import { useMediaQuery, Typography, styled } from "@mui/material";
import { GITHUB_URL } from "config";
import { BsGithub } from "react-icons/bs";
import { StyledFlexRow } from "styles";

interface Props{
    hideText?: boolean;
}

export const Github = ({hideText}: Props) => {

  return (
    <StyledGithub href={GITHUB_URL} target="_blank">
      <StyledFlexRow gap={7}>
        <BsGithub />
        {!hideText && <Typography>GitHub</Typography>}
      </StyledFlexRow>
    </StyledGithub>
  );
};
const StyledGithub = styled("a")(({ theme }) => {
  const color = theme.palette.text.secondary;
  return {
    fontSize: 18,
    textDecoration: "unset",
    marginLeft: 10,
    svg: {
      color,
      width: 24,
      height: 24,
    },
    p: {
      fontSize: "inherit",
      color,
      fontWeight: 700,
    },
  };
});
