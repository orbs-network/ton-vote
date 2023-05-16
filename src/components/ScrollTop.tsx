import { Fade, styled } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BsArrowUpShort } from "react-icons/bs";
function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Fade in={show}>
      <StyledContainer
        onClick={() => window.scrollTo({ top: 0, left: 0 })}
      >
        <BsArrowUpShort style={{ width: 35, height: 35, color: "white" }} />
      </StyledContainer>
    </Fade>
  );
}

export default ScrollTop;

const StyledContainer = styled("button")(({ theme }) => ({
  zIndex:100,
  position: "fixed",
  bottom: 40,
  right: 20,
  background: theme.palette.primary.main,
  borderRadius: "50%",
  border: "unset",
  width: 45,
  height: 45,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "0.1s all",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));
