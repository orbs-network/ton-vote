import { Skeleton, styled, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { TOOLBAR_WIDTH } from "consts";
import { CSSProperties } from "react";
import { theme } from "theme";

export const StyledFlexRow = styled(Box)(
  ({
    justifyContent = "center",
    alignItems = "center",
    gap = 10,
  }: {
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
    alignItems?: "flex-start" | "center" | "flex-end" | "space-between";
    gap?: number;
  }) => ({
    display: "flex",
    alignItems: alignItems,
    justifyContent,
    gap,
    width: "100%",
  })
);
export const StyledFlexColumn = styled(Box)(
  ({
    justifyContent = "center",
    alignItems = "center",
    gap = 10,
  }: {
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
    alignItems?: "flex-start" | "center" | "flex-end" | "space-between";
    gap?: number;
  }) => ({
    display: "flex",
    alignItems,
    justifyContent,
    flexDirection: "column",
    width: "100%",
    gap,
  })
);

export const globalStyles = {
  body: {
    background: "#F8F9FB",
  },
  ".MuiPickersDay-today": {
    border: "unset!important",
  },

  ".go1858758034": {
    width: 18,
    height: 18,
  },
  html: {
    // scrollBehavior: "smooth" as const,
  },
  ".snackbar-success": {
    backgroundColor: `${theme.palette.primary.main}!important`,
  },
  ".MuiTooltip-arrow": {
    color: `#EEEEEE!important`,
  },
  ".MuiTooltip-tooltip": {
    background: `#EEEEEE!important`,
  },
};

export const textOverflow: CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const StyledGrid = styled(StyledFlexColumn)({
  gap: 0,
  width: "calc(100% - 100px)",
  maxWidth: 1100,
  marginLeft: "auto",
  paddingLeft: TOOLBAR_WIDTH,
  marginRight: "auto",

  "@media (max-width: 850px)": {
    width: "calc(100% - 30px)",
  },
});

export const StyledPage = styled(Box)({
  paddingTop: 100,
});

export const StyledSkeletonLoader = styled(Skeleton)({
  width: "100%",
  transform: "unset",
  background: "rgba(0,0,0, 0.07)",
});

export const StyledOneLine = styled(Typography)({
  display: "inline-block",
  overflow: "hidden",
  whiteSpace: "nowrap",
});

export const StyledTitle = styled(Typography)({
  color: "black",
  textAlign: "left",
  fontWeight: 700,
  lineHeight: "28px",
  fontSize: 20,
  "@media (max-width: 600px)": {
    fontSize: 18,
    lineHeight: "25px",
  },
});

export const StyledContainer = styled(Box)<{ hover?: number }>(({ theme, hover }) => ({
  background: "white",
  border: "1px solid #e0e0e0",
  boxShadow: "rgb(114 138 150 / 8%) 0px 2px 16px",
  borderRadius: 10,
  padding: 20,
  transition: "0.2s all",
  svg: {
    transition: "0.2s all",
  },
  "&:hover": {
    border: hover
      ? `1px solid ${theme.palette.primary.main}`
      : "1px solid #e0e0e0",
    svg: {
      color: hover ? `${theme.palette.primary.main}` : "",
    },
  },
}));
