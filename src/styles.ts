import { Skeleton, styled, Theme, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { MOBILE_WIDTH, TOOLBAR_WIDTH } from "consts";
import { getBorderColor } from "theme";

export const StyledEndAdornment = styled(Box)({
  button: {
    padding: "5px 10px",
    height: "unset",
    p: {
      fontSize: 12,
      display: "inline-block",
      overflow: "hidden",
      whiteSpace: "nowrap",
    },
    ".MuiCircularProgress-root": {
      width: "20px!important",
      height: "20px!important",
    },
  },
});

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

export const getGlobalStyles = (theme: Theme) => {
  return {
    ".MuiMenu-paper": {
      backgroundImage: "unset!important",
    },
    body: {
      background: theme.palette.background.default,
      overflowX: "hidden",
      fontFamily: "mulish",
    },
    "*::-webkit-scrollbar": {
      display: "none",
    },
    ".MuiPickersDay-today": {
      border: "unset!important",
    },
    ".toast": {
      padding: "10px 13px",
      borderRadius: 15,
      boxShadow:
        theme.palette.mode === "light"
          ? "0 4px 24px rgba(0, 0, 0, 0.16)"
          : "unset",
      background:
        theme.palette.mode === "light"
          ? theme.palette.background.paper
          : "black",
      border: `unset`,
      ".go685806154": {
        order: 2,
      },
      ".go3958317564": {
        margin: "0px 10px 0px 0px",
      },
      "*, p": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.text.secondary
            : "white",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, Tahoma, Verdana, sans-serif",
        fontWeight: 500,
      },
    },
    ".app-loader-hidden": {
      opacity: 0,
    },
    ".app-loader-none": {
      display: "none",
    },
    input: {
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
    svg: {
      color: theme.palette.text.primary,
    },

    html: {
      // scrollBehavior: "smooth" as const,
    },
    ".snackbar-success": {
      backgroundColor: `${theme.palette.primary.main}!important`,
    },
    ".MuiTooltip-arrow": {
      color:
        theme.palette.mode === "light"
          ? `#EEEEEE!important`
          : "#2B303B!important",
    },
    ".MuiTooltip-tooltip": {
      background:
        theme.palette.mode === "light"
          ? `#EEEEEE!important`
          : "#2B303B!important",
      boxShadow:
        theme.palette.mode === "light"
          ? "rgb(114 138 150 / 8%) 0px 2px 16px"
          : "unset",
    },
    ".MuiDateCalendar-root .Mui-disabled": {
      opacity: "0.4!important",
      color: "gray!important",
    },
    [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
      "tc-root": {
        right: 10,
        left: "unset!important",
      },
    },
  };
};

export const StyledGrid = styled(StyledFlexColumn)({
  gap: 0,
  width: "calc(100% - 100px)",
  maxWidth: 1100,
  marginLeft: "auto",
  paddingLeft: TOOLBAR_WIDTH,
  marginRight: "auto",
  "@media (max-width: 1100px)": {
    width: "calc(100% - 50px)",
  },
  [`@media (max-width: ${MOBILE_WIDTH}px)`]: {
    width: "calc(100% - 20px)",
    paddingLeft: "unset",
  },
});

export const StyledPage = styled(Box)({
  paddingTop: 100,
});

export const StyledSkeletonLoader = styled(Skeleton)(({ theme }) => ({
  width: "100%",
  transform: "unset",
  background:
    theme.palette.mode === "light"
      ? "rgba(0,0,0, 0.07)"
      : "rgba(255,255,255, 0.07)",
}));

export const StyledOneLine = styled(Typography)({
  display: "inline-block",
  overflow: "hidden",
  whiteSpace: "nowrap",
});

export const StyledTitle = styled(Typography)(({ theme }) => ({
  color:
    theme.palette.mode === "light" ? "black" : theme.palette.text.secondary,
  textAlign: "left",
  fontWeight: 700,
  lineHeight: "28px",
  fontSize: 20,
  "@media (max-width: 600px)": {
    fontSize: 18,
    lineHeight: "25px",
  },
}));

export const StyledContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  border:
    theme.palette.mode === "light"
      ? "1px solid #e0e0e0"
      : "1px solid rgba(255,255,255, 0.2)",
  boxShadow:
    theme.palette.mode === "light"
      ? "rgb(114 138 150 / 8%) 0px 2px 16px"
      : "unset",
  borderRadius: 10,
  padding: 20,
  transition: "0s all",
  svg: {
    transition: "0s all",
  },
}));

export const StyledHoverContainer = styled(StyledContainer)(({ theme }) => {
  const color =
    theme.palette.mode === "light"
      ? theme.palette.primary.main
      : "rgba(255,255,255, 0.7)";
  return {
    transition: "border-color 0.2s",
    svg: {
      transition: "0.2s all",
    },
    "&:hover": {
      border: `1px solid ${color}`,
    },
  };
});
export const StyledEmptyText = styled(Typography)({
  fontSize: 18,
  fontWeight: 700,
});

export const StyledCreateAbout = styled(Typography)({
  fontSize: 14,
  opacity: 0.7,
  width: "100%",
  textAlign: "left",
});

export const StyledSelectContainer = styled(Box)(({ theme }) => ({
  position: "relative",

  ".MuiInputBase-root": {
    borderRadius: 30,
  },
  ".MuiOutlinedInput-notchedOutline": {
    display: "none",
  },
  ".MuiSelect-select": {
    minWidth: 200,
    padding: "8px 15px 8px 15px",
    border:
      theme.palette.mode === "light"
        ? "1px solid rgba(0, 0, 0, 0.23)"
        : `1px solid rgba(255, 255, 255, 0.23)`,
    borderRadius: `30px!important`,
    transition: "0.2s all",
    "&:hover": {
      border:
        theme.palette.mode === "light"
          ? `1px solid ${theme.palette.primary.main}`
          : `1px solid white`,
    },
  },
  ".MuiSelect-icon": {
    width: 20,
    height: 20,
    marginTop: -2,
  },
}));
