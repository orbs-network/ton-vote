import { styled, Typography } from "@mui/material";
import { Back, ErrorContainer } from "components";
import { MOBILE_WIDTH } from "consts";
import { ReactNode, useEffect } from "react";
import { StyledFlexColumn, StyledFlexRow } from "styles";
import { Webapp } from "WebApp";

function Page({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <StyledContainer className={className}>
      {children}
      {Webapp.isEnabled && <StyledTWAShadow />}
    </StyledContainer>
  );
}

const PageError = ({
  text = "Something went wrong",
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  return <ErrorContainer text={text} className={className} />;
};




const PageHeader = ({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <StyledHeader justifyContent="flex-start" className={className}>
      {children}
    </StyledHeader>
  );
};

const Title = ({ title }: { title: string }) => {
  return <StyledTitle>{title}</StyledTitle>;
};
Page.Title = Title;
Page.Header = PageHeader;
Page.Error = PageError;

const StyledHeader = styled(StyledFlexRow)({
  marginBottom: Webapp.isEnabled ? 10 : 20,
});

const StyledTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: 22,
  paddingLeft: 0,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    fontSize: 18,
  },
});

const StyledContainer = styled(StyledFlexColumn)({
  flex: 1,
  display: "flex",
  position: "relative",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  gap: 0,
  paddingBottom: 100,
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {},
});

const StyledTWAShadow = styled("div")(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  height: 2,
  zIndex: 10,
  background:
    theme.palette.mode === "dark" ? "rgba(255,255,255, 0.2)" : "#e0e0e0",
}));


export { Page };
